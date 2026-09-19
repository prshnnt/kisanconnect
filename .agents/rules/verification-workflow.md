# Verification & Build Workflow Rule

To preserve LLM context and prevent token wastage from verbose build logs, font tables, and repetitive commands:

1. **Always use the unified verification script**:
   ```powershell
   python scripts/verify.py
   ```
2. **Do NOT run separate verbose commands directly**:
   - Avoid running `npm.cmd run lint` followed by `npm.cmd run build` individually.
   - Avoid dumping full Vite build asset logs into the conversation context.
   - `python scripts/verify.py` automatically suppresses verbose asset tables and outputs concise status summaries (`[PASS]`), extracting only actionable error diagnostics if a failure occurs.
3. **Use targeted flags when needed**:
   - `python scripts/verify.py --frontend` to verify only frontend changes.
   - `python scripts/verify.py --backend` to verify only backend Python changes.
   - `python scripts/verify.py --quick` to run fast lint and syntax checks without bundle build.
