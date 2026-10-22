# 0016. Rstest stays the test runner

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
After PR 2, the maintainer asked whether a different test runner would cause fewer problems than Rstest. PR 2 had run into three things. Vitest 5.0.5, the main alternative, was checked against each:

| What PR 2 hit | Vitest 5 |
|---|---|
| `rstest run` exits with code 1 when no test files exist | The same. It needs `passWithNoTests`. |
| The default glob misses the role-based `test.ts` names from step 1b | The same default glob, `**/*.{test,spec}.?(c\|m)[jt]s?(x)`. |
| The Rslib adapter picks happy-dom for the `web` target | Vitest defaults to Node, but it cannot reuse `rslib.config.ts`. It needs its own config for the `@/` alias, and it brings Vite in next to Rspack. |

None of the three is a Rstest bug. Vitest does have one advantage: a `// @vitest-environment` comment switches one file's environment. Rstest 0.12 needs `projects` for that. Rstest's main risk is that it is pre-1.0, so its config can change between minor versions.

`node:test` was also considered. Node's type stripping does not resolve the `@/` alias (naming rule 9) or `?raw` imports.

## Decision
- Rstest stays, as in [ADR 0001](0001-v3-direction.md). The Rstest setup from PR 2 is unchanged.
- PR 8 gives the hook tests that need a DOM their own environment through Rstest's `projects`.

## Consequences
- Tests share `rslib.config.ts` with the build, so the alias and asset handling cannot drift apart.
- Rstest upgrades within 0.x may need config changes. With exact versions ([ADR 0015](0015-exact-dependency-versions.md)), each upgrade is a deliberate change.
- Switching runners later needs a new ADR. It is cheapest before PR 3 adds the first tests.
