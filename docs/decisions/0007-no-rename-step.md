# 0007. No rename-only step for the v2 files

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
The original plan contradicted itself. Its sequencing list had a "Step 1b renames only (`git mv`)" commit to bring the v2 files in line with the kebab-case rules. Step 1b itself said no rename commit was needed, because the new engine replaces the v2 files rather than renaming them.

## Decision
- The v2 files are not renamed. PR 5 deletes them.
- Until then, `biome.json` has a temporary override that exempts the v2 paths (`src/components/`, `src/functions/`, `src/hooks/`, `src/Main.types.ts`) from the naming rules. PR 5 removes the override together with the files.

## Consequences
- No churn commit that moves files only to delete them a few PRs later.
- `biome ci` passes from PR 1 onwards. The naming rules are enforced on all new code from the start.
