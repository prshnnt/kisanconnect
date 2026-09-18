#!/usr/bin/env python3
"""
scripts/commit.py
Automated Git commit workflow for KisanConnect:
1. Validates Python syntax on modified/untracked .py files
2. Stages changes (git add -A or specific files)
3. Auto-generates a conventional commit message if not provided
4. Commits changes and displays a clean summary
"""

import argparse
import os
import py_compile
import subprocess
import sys
from pathlib import Path


def run_git(args: list[str], check: bool = True) -> subprocess.CompletedProcess:
    """Run a git command and return the completed process."""
    return subprocess.run(
        ["git"] + args,
        capture_output=True,
        text=True,
        check=check,
        encoding="utf-8",
    )


def get_repo_root() -> Path:
    """Get the root directory of the git repository."""
    result = run_git(["rev-parse", "--show-toplevel"])
    return Path(result.stdout.strip())


def get_status_entries() -> list[tuple[str, str]]:
    """Return list of (status_code, filepath) from git status --porcelain."""
    res = run_git(["status", "--porcelain"])
    entries = []
    for line in res.stdout.splitlines():
        if not line.strip():
            continue
        status = line[:2]
        path_str = line[3:].strip()
        # Handle renames e.g. "old -> new"
        if " -> " in path_str:
            path_str = path_str.split(" -> ")[-1].strip()
        # Strip optional quotes added by git for special chars
        path_str = path_str.strip('"')
        entries.append((status, path_str))
    return entries


def validate_python_files(repo_root: Path, entries: list[tuple[str, str]]) -> list[str]:
    """Check syntax of modified/added Python files. Return errors if any."""
    errors = []
    for status, rel_path in entries:
        # Ignore deleted files
        if "D" in status:
            continue
        if rel_path.endswith(".py"):
            full_path = repo_root / rel_path
            if full_path.is_file():
                try:
                    py_compile.compile(str(full_path), doraise=True)
                except py_compile.PyCompileError as e:
                    errors.append(f"{rel_path}: {e}")
    return errors


def categorize_file(path: str) -> str:
    """Return category name for a given file path."""
    p = path.lower()
    if p.startswith("backend/app/models/"):
        return "models"
    if p.startswith("backend/app/api/"):
        return "api"
    if p.startswith("backend/app/tasks/"):
        return "tasks"
    if p.startswith("backend/app/db/") or "alembic" in p:
        return "db"
    if p.startswith("backend/"):
        return "backend"
    if p.startswith("frontend/"):
        return "frontend"
    if "docker" in p:
        return "docker"
    if p.endswith(".md") or "doc" in p:
        return "docs"
    if p.endswith(".sql") or p.endswith(".dbml"):
        return "schema"
    if "pyproject.toml" in p or "package.json" in p or "lock" in p:
        return "deps"
    return "general"


def generate_commit_message(repo_root: Path) -> tuple[str, list[str]]:
    """Inspect staged changes and auto-generate a conventional commit message."""
    diff_res = run_git(["diff", "--cached", "--name-status"])
    lines = [line.strip() for line in diff_res.stdout.splitlines() if line.strip()]
    
    if not lines:
        return ("chore: update files", ["- Update workspace files"])

    categories: dict[str, list[str]] = {}
    actions: dict[str, list[str]] = {"A": [], "M": [], "D": [], "R": []}

    for line in lines:
        parts = line.split(maxsplit=1)
        if len(parts) < 2:
            continue
        status = parts[0][0]  # 'A', 'M', 'D', 'R'
        path = parts[1].split(" -> ")[-1].strip('"')
        cat = categorize_file(path)
        categories.setdefault(cat, []).append(path)
        if status in actions:
            actions[status].append(path)

    # Determine scope and type
    cat_keys = list(categories.keys())
    if len(cat_keys) == 1:
        scope = cat_keys[0]
    elif "models" in cat_keys and len(cat_keys) <= 2:
        scope = "models"
    elif "api" in cat_keys and len(cat_keys) <= 2:
        scope = "api"
    elif "db" in cat_keys:
        scope = "db"
    elif all(c in ["backend", "models", "api", "db", "tasks"] for c in cat_keys):
        scope = "backend"
    elif all(c in ["frontend"] for c in cat_keys):
        scope = "frontend"
    else:
        scope = ""

    # Determine commit type
    if actions["D"] and not actions["A"] and not actions["M"]:
        ctype = "chore"
        summary = "remove unused files"
    elif actions["A"] and not actions["M"] and not actions["D"]:
        ctype = "feat"
        summary = f"add {scope or 'new components'}"
    elif all(c == "docs" for c in cat_keys):
        ctype = "docs"
        summary = "update documentation"
    elif all(c == "deps" for c in cat_keys):
        ctype = "chore"
        summary = "update dependencies and configuration"
    else:
        ctype = "feat" if ("models" in cat_keys or "api" in cat_keys or "tasks" in cat_keys) else "chore"
        summary = f"update {scope}" if scope else "update project components"

    title = f"{ctype}({scope}): {summary}" if scope else f"{ctype}: {summary}"

    # Detailed bullets
    bullets = []
    for cat, files in categories.items():
        file_list_str = ", ".join(f.split("/")[-1] for f in files[:4])
        if len(files) > 4:
            file_list_str += f" and {len(files) - 4} more"
        bullets.append(f"- [{cat}] {file_list_str}")

    return title, bullets


def main():
    parser = argparse.ArgumentParser(
        description="Automated Git commit workflow for KisanConnect."
    )
    parser.add_argument(
        "-m", "--message",
        type=str,
        default=None,
        help="Commit message. If omitted, an informative conventional commit message is generated.",
    )
    parser.add_argument(
        "--files",
        nargs="*",
        default=None,
        help="Specific file paths to stage. If not specified, all modified/untracked files will be staged.",
    )
    parser.add_argument(
        "--no-verify",
        action="store_true",
        help="Skip Python syntax pre-check.",
    )
    parser.add_argument(
        "--push",
        action="store_true",
        help="Push to current remote tracking branch after commit.",
    )
    args = parser.parse_args()

    repo_root = get_repo_root()
    os.chdir(repo_root)

    # 1. Check status
    entries = get_status_entries()
    if not entries:
        print("[INFO] Working tree is clean. Nothing to commit.")
        sys.exit(0)

    print(f"[1/4] Checking working tree ({len(entries)} file(s) changed)...")

    # 2. Syntax validation
    if not args.no_verify:
        print("[2/4] Validating Python syntax on modified files...")
        errors = validate_python_files(repo_root, entries)
        if errors:
            print("[ERROR] Syntax validation failed! Please fix before committing:\n")
            for err in errors:
                print(f"  * {err}")
            sys.exit(1)
        print("      Python syntax validation passed.")
    else:
        print("[2/4] Skipping syntax validation (--no-verify).")

    # 3. Stage files
    print("[3/4] Staging changes...")
    if args.files:
        run_git(["add"] + args.files)
    else:
        run_git(["add", "-A"])

    # Verify something was actually staged
    cached_diff = run_git(["diff", "--cached", "--name-only"])
    staged_files = [f for f in cached_diff.stdout.splitlines() if f.strip()]
    if not staged_files:
        print("[INFO] No changes staged. Working tree might be unchanged or ignored.")
        sys.exit(0)

    # 4. Determine commit message
    if args.message:
        commit_title = args.message
        commit_body = None
    else:
        commit_title, bullets = generate_commit_message(repo_root)
        commit_body = "\n".join(bullets)

    # 5. Commit
    print(f"[4/4] Committing: '{commit_title}'...")
    commit_cmd = ["commit", "-m", commit_title]
    if commit_body:
        commit_cmd.extend(["-m", commit_body])

    commit_res = run_git(commit_cmd)
    print(commit_res.stdout.strip())

    # 6. Optional push
    if args.push:
        print("[PUSH] Pushing to remote...")
        push_res = run_git(["push"])
        print(push_res.stdout.strip())
        if push_res.stderr.strip():
            print(push_res.stderr.strip())

    print("\n[SUCCESS] Commit complete!")


if __name__ == "__main__":
    main()
