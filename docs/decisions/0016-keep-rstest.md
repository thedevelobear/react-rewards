# 0016. Rstest stays the test runner

- **Status:** Accepted
- **Date:** 2026-10-22

Rstest stays, as in [ADR 0001](0001-v3-direction.md), with its existing setup. Tests that need a DOM get their own environment through Rstest's `projects`.

**Why:** Vitest 5 has the same no-test-files exit code and the same default glob as Rstest, and it can't reuse `rslib.config.ts`, so the `@/` alias would need a second config and Vite would sit next to Rspack. `node:test` doesn't resolve the `@/` alias or `?raw` imports. Rstest's risk is that it is pre-1.0.

**Consequences:** Tests and the build share one config, so aliases and asset handling can't drift apart. Rstest upgrades within 0.x may need config changes.
