#!/usr/bin/env python3
"""
Token-efficient verification workflow script for KisanConnect.
Consolidates linting, syntax checking, type/model imports, and builds.
Filters out verbose successful build logs to save LLM context tokens.
"""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
import time
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = ROOT_DIR / "frontend"
BACKEND_DIR = ROOT_DIR / "backend"


def get_changed_files() -> list[str]:
    """Retrieve list of modified and untracked files using git status."""
    try:
        res = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=ROOT_DIR,
            capture_output=True,
            text=True,
            check=True,
        )
        files = []
        for line in res.stdout.strip().splitlines():
            if line:
                parts = line.strip().split(maxsplit=1)
                if len(parts) == 2:
                    files.append(parts[1].replace("/", os.sep))
        return files
    except Exception:
        return []


def run_cmd(
    cmd: list[str] | str,
    cwd: Path,
    shell: bool = False,
) -> tuple[int, str, str]:
    """Run a subprocess command and return (exit_code, stdout, stderr)."""
    try:
        res = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            shell=shell,
        )
        return res.returncode, res.stdout, res.stderr
    except Exception as e:
        return 1, "", str(e)


def verify_frontend(quick: bool = False) -> tuple[bool, str]:
    """Verify frontend code via oxlint and optionally vite build."""
    summary_parts = []
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"

    # 1. Linting
    code, stdout, stderr = run_cmd([npm_cmd, "run", "lint"], cwd=FRONTEND_DIR)
    if code != 0:
        err_msg = stdout if stdout else stderr
        # Extract meaningful lines
        lines = [
            line for line in err_msg.splitlines()
            if "error" in line.lower() or "warning" in line.lower() or line.strip().startswith("!")
        ]
        extracted = "\n".join(lines[:15]) if lines else err_msg[-500:]
        return False, f"Frontend Lint FAILED (exit {code}):\n{extracted}"

    summary_parts.append("Lint: OK (0 errors)")

    if quick:
        return True, "Frontend: " + ", ".join(summary_parts)

    # 2. Build
    start_t = time.time()
    code, stdout, stderr = run_cmd([npm_cmd, "run", "build"], cwd=FRONTEND_DIR)
    elapsed = round(time.time() - start_t, 2)

    if code != 0:
        err_msg = stderr if stderr else stdout
        # Filter down to the essential error
        err_lines = [
            line for line in err_msg.splitlines()
            if "error" in line.lower() or "failed" in line.lower() or "cannot resolve" in line.lower()
        ]
        extracted = "\n".join(err_lines[:12]) if err_lines else err_msg[-600:]
        return False, f"Frontend Build FAILED (exit {code}):\n{extracted}"

    summary_parts.append(f"Build: OK ({elapsed}s)")
    return True, "Frontend: " + ", ".join(summary_parts)


def verify_backend(files_to_check: list[str] | None = None) -> tuple[bool, str]:
    """Verify backend python syntax and SQLAlchemy model imports."""
    summary_parts = []

    # Find python interpreter in backend .venv if available
    python_bin = sys.executable
    venv_python = BACKEND_DIR / ".venv" / ("Scripts" if os.name == "nt" else "bin") / ("python.exe" if os.name == "nt" else "python")
    if venv_python.exists():
        python_bin = str(venv_python)

    # 1. Syntax check on changed .py files
    py_files = []
    if files_to_check:
        for f in files_to_check:
            p = ROOT_DIR / f
            if p.suffix == ".py" and p.exists() and "backend" in f:
                py_files.append(p)
    else:
        for p in (BACKEND_DIR / "app").rglob("*.py"):
            py_files.append(p)

    for py_file in py_files:
        code, stdout, stderr = run_cmd(
            [python_bin, "-m", "py_compile", str(py_file)],
            cwd=BACKEND_DIR,
        )
        if code != 0:
            err = stderr if stderr else stdout
            return False, f"Backend Syntax Error in {py_file.name}:\n{err}"

    summary_parts.append(f"Syntax: OK ({len(py_files)} files checked)")

    # 2. Model import validation
    import_test_cmd = [
        python_bin,
        "-c",
        "import app.models; print('models_ok')",
    ]
    code, stdout, stderr = run_cmd(import_test_cmd, cwd=BACKEND_DIR)
    if code != 0 or "models_ok" not in stdout:
        err = stderr if stderr else stdout
        # Extract last 10 lines of traceback
        tb_lines = err.strip().splitlines()[-10:]
        return False, "Backend Models Import FAILED:\n" + "\n".join(tb_lines)

    summary_parts.append("Models Import: OK")
    return True, "Backend: " + ", ".join(summary_parts)


def main() -> int:
    parser = argparse.ArgumentParser(description="KisanConnect Token-Efficient Verification")
    parser.add_argument("--frontend", action="store_true", help="Run only frontend verification")
    parser.add_argument("--backend", action="store_true", help="Run only backend verification")
    parser.add_argument("--all", action="store_true", help="Run both frontend and backend verification")
    parser.add_argument("--quick", action="store_true", help="Skip full bundle build, only run linters & syntax")
    args = parser.parse_args()

    changed_files = get_changed_files()

    # Determine what to verify
    check_fe = args.frontend or args.all
    check_be = args.backend or args.all

    if not check_fe and not check_be:
        # Auto-detect from git status
        has_fe = any("frontend" in f for f in changed_files)
        has_be = any("backend" in f for f in changed_files)
        if has_fe:
            check_fe = True
        if has_be:
            check_be = True
        if not check_fe and not check_be:
            # Default to both if nothing or root files changed
            check_fe = True
            check_be = True

    results = []
    overall_success = True

    if check_fe:
        success, msg = verify_frontend(quick=args.quick)
        results.append(msg)
        if not success:
            overall_success = False

    if check_be:
        success, msg = verify_backend(changed_files)
        results.append(msg)
        if not success:
            overall_success = False

    # Output compact summary
    status_tag = "[PASS]" if overall_success else "[FAIL]"
    print(f"\n{status_tag} Verification Summary:")
    for res in results:
        print(f"  - {res}")
    print()

    return 0 if overall_success else 1


if __name__ == "__main__":
    sys.exit(main())
