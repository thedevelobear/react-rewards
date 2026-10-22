# 0012. Rstest passes with no test files until PR 3

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
PR 2 adds Rstest and runs it in CI. The first tests arrive in PR 3 with the engine core. No tests are written for the v2 code, because PR 5 deletes it. With no matching test files, `rstest run` prints "No test files found" and exits with code 1, so CI would fail.

Options considered:
- A public API smoke test in `src/test.ts` that checks the package's exports.
- `passWithNoTests` until PR 3.

## Decision
- `rstest.config.ts` sets `passWithNoTests: true`.
- PR 3 removes it in the same commit as its first test.
- PR 2 checked the adapter wiring once with a throwaway test that was not committed: the `@/` alias, TypeScript, the `?raw` SVG import and the Node environment all worked.

## Consequences
- Until PR 3, the CI test step only proves that Rstest starts and that its config loads.
- If PR 3 forgot to remove the flag, a later mistake in the `include` pattern would silently run zero tests. Removing it is on PR 3's list in the plan.
