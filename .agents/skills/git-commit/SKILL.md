---
name: git-commit
description: >-
  Automate git commits for KisanConnect with syntax validation and conventional commit message generation in a single workflow.
  Use this skill whenever the user asks to commit changes, make a git commit, or save progress to git.
---

# Git Commit Workflow

This skill streamlines git commit operations into a single step using the project workflow script [scripts/commit.py](../../scripts/commit.py).

## Why Use This Workflow

Instead of running 6-10 separate exploratory commands (`git status`, `git diff`, `git log`, `py_compile`, `git add`, `git commit`, `git status`), run the commit automation in one command:

```powershell
python scripts/commit.py
```

## Available Commands

### 1. Auto-commit with generated message
Detects changed files, runs Python syntax validation on all changed `.py` files, stages all changes, generates an appropriate conventional commit message based on the components modified, and commits:
```powershell
python scripts/commit.py
```

### 2. Commit with custom message
```powershell
python scripts/commit.py -m "feat(models): add assaying testing method model"
```

### 3. Commit specific files
```powershell
python scripts/commit.py --files backend/app/models/assaying_service.py -m "fix(models): update assaying testing method"
```

### 4. Commit and push
```powershell
python scripts/commit.py -m "feat: complete milestone" --push
```

## Validation & Safety
- Automatically halts if any modified `.py` file contains Python syntax errors.
- Bypasses syntax validation with `--no-verify` if needed.
