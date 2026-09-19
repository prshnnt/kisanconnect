---
name: verify
description: >-
  Token-efficient verification workflow for KisanConnect. Runs frontend linting (oxlint), Vite builds, Python syntax validation, and SQLAlchemy model imports in a single command, filtering out verbose logs to minimize token consumption. Use this skill whenever checking, building, or validating frontend or backend code.
---

# Verification Workflow

This skill streamlines all project checks into a single token-efficient workflow using [scripts/verify.py](../../scripts/verify.py).

## Why Use This Workflow

Instead of running multiple separate, verbose commands (`npm run lint`, `npm run build`, `python -m py_compile`, `python -c "import app.models"`) which dump hundreds of lines of font assets and build logs into the LLM context, run the unified verification tool:

```powershell
python scripts/verify.py
```

It executes the checks in the background, extracts only essential error information if something fails, and outputs a concise 3-line summary on success:

```text
[PASS] Verification Summary:
  - Frontend: Lint: OK (0 errors), Build: OK (2.36s)
  - Backend: Syntax: OK (15 files checked), Models Import: OK
```

## Available Commands

### 1. Auto-detect and verify changed components
Automatically detects whether frontend, backend, or both were modified based on `git status` and runs the relevant checks:
```powershell
python scripts/verify.py
```

### 2. Verify only frontend
Runs Oxlint + Vite build with compressed output:
```powershell
python scripts/verify.py --frontend
```

### 3. Verify only backend
Runs Python syntax compilation across changed files and tests `app.models` imports:
```powershell
python scripts/verify.py --backend
```

### 4. Fast lint/syntax check (no bundle build)
Runs only linters and syntax checks when you want immediate feedback before a final build:
```powershell
python scripts/verify.py --quick
```

### 5. Full project check
Runs all frontend and backend checks:
```powershell
python scripts/verify.py --all
```
