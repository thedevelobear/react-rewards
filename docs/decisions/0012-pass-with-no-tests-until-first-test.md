# 0012. Rstest passes with no test files until the first test

- **Status:** Accepted
- **Date:** 2026-10-22

`rstest.config.ts` sets `passWithNoTests: true` until the first test exists. The commit that adds it removes the flag.

**Why:** Rstest goes into CI before any test exists, and `rstest run` exits with code 1 when it finds no test files. The v2 code gets no tests, because the new engine replaces it.
