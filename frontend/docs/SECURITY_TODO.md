# SECURITY TODO

**IMPORTANT:** The project owner MUST perform these actions immediately. Do not commit secrets.

1. **Gemini API Keys**:
   - Revoke and rotate BOTH Gemini API keys (the current one and the one leaked in git commits `73ff48e` and `d3964ce`).

2. **Database Password**:
   - Rotate the PostgreSQL database password immediately.

3. **Git History Purge**:
   - Purge all leaked secrets from the git history. Use `git filter-repo` or BFG Repo-Cleaner to scrub the `.env` and `accounts.txt` files from all commits.
   - Force-push the rewritten history (`git push --force`).

4. **Change Existing Accounts**:
   - Change all hardcoded passwords that were listed in `accounts.txt` or `README.md` (e.g., admin, director, supplier, etc.).
