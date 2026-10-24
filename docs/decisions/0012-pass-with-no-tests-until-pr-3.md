# 0012. Rstest passes with no test files until PR 3

- **Status:** Accepted
- **Date:** 2026-10-22

`rstest.config.ts` sets `passWithNoTests: true` until PR 3, which removes it in the commit that adds the first test.

**Why:** PR 2 adds Rstest to CI before any test exists, and `rstest run` exits with code 1 when it finds no test files. The v2 code gets no tests, because PR 5 deletes it.
