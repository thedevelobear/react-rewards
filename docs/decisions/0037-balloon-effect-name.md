# 0037. The balloons effect is named `balloon`

- **Status:** Accepted
- **Date:** 2026-10-23

## Context
Naming rule 2 in plan step 1b says folders and component names are singular. The plan's layout and v2 both name the effect `balloons` (`src/effects/balloons/`, `export { balloons }`). The two contradict each other. `confetti` and `emoji` already satisfy the rule.

Options considered:
- Keep `balloons`, because the effect is named for what the user sees, and record an exception to rule 2.
- Rename it to `balloon`, following rule 2 strictly.

## Decision
- The folder is `src/effects/balloon/`, the export is `balloon`, its config type is `BalloonConfig`, and the effect's `name` is `'balloon'`.
- Rule 2 applies to effect folders and to the names effects are exported under. There is no exception for plural effect names.

## Consequences
- v2's `balloons` export becomes `balloon`. The README's "from v2" table (PR 12) gets a row for the rename.
- The plan's layout and rule 8 name `balloon/`.
- Labels on the preview site, such as the sidebar entry (PR 9), are display text rather than code names. This ADR doesn't decide them.
