# 0027. `demo/` is a React 19 and Rsbuild app from PR 5

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
[ADR 0006](0006-bare-demo-as-e2e-target.md) creates `demo/` in PR 5 as a bare page for the browser tests. Step 3 of the plan builds the preview site with Rsbuild and React 19 in PRs 9 to 11. The hook arrives in PR 8, so the PR 5 page can't use it yet. Options considered: start with React, or start with plain TypeScript and convert later.

## Decision
- `demo/` is a private pnpm workspace package built with Rsbuild and `@rsbuild/plugin-react`, rendering with React 19 in Strict Mode.
- Until PR 8 its buttons call `fire()` directly. PR 8 switches them to `useReward`, and PRs 9 to 11 restyle the same app.
- The demo has its own `tsconfig.json` and `typecheck` script. It type-checks against the built package's declarations ([ADR 0031](0031-demo-imports-built-package.md)), so CI runs it after `pnpm build`, and the root `typecheck` stays library-only.

## Consequences
- Nothing is rewritten between PR 5 and the site. The demo exercises Strict Mode from the start.
- `demo/` adds React DOM and Rsbuild as dev-only dependencies. They are not published, because `files` in the root `package.json` only ships `dist`.
