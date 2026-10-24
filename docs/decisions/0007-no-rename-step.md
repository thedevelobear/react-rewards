# 0007. No rename-only step for the v2 files

- **Status:** Accepted
- **Date:** 2026-10-22

The v2 files aren't renamed to follow the kebab-case rules. PR 5 deletes them. Until then, an override in `biome.json` exempts their paths from the naming rules.

**Why:** Renaming files only to delete them a few PRs later is churn.
