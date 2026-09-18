# Git Commit Workflow Rule

When the user asks to commit changes (e.g. "commit the changes", "commit", "save to git"):
1. Execute the one-step commit workflow using `python scripts/commit.py`.
2. If the user provided a specific commit message, pass it with `-m "<message>"`. If not, run `python scripts/commit.py` directly to allow automatic syntax validation, staging, and conventional commit message generation.
3. Do NOT run redundant multiple exploratory commands (`git status`, `git diff`, `git log`, `git add`, etc.) when committing. Use the automated workflow script.
