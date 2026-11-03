# 0080. The unit tests also run on React 18, the lowest supported React

- **Status:** Proposed
- **Date:** 2026-11-03

- CI has a second job, `react-18`. After the usual install from the lockfile, it runs `pnpm add -D -w react@18.3.1 react-dom@18.3.1 @types/react@18.3.31 @types/react-dom@18.3.7` on the runner, then `pnpm test`. Nothing it changes is committed: the lockfile, the main job, the demo and the browser specs stay on React 19. Testing Library 16 supports both.
- To run it locally, the same two commands run in a temporary `git worktree`, which is removed afterwards, so the checkout keeps React 19.
- The versions are the newest 18.x releases, pinned in the workflow and updated by hand.

**Why:** `react >=18` is the peer range ([ADR 0015](0015-exact-dependency-versions.md)), and React 18 is supported ([ADR 0075](0075-versioning-policy.md)), but only React 19 was tested. The unit tests cover the hook, the part that depends on React ([ADR 0043](0043-hook-tests-with-testing-library.md)).

**Consequences:** React 18 is checked by the unit tests, not by the browser specs. When the lowest supported React rises, the job moves to it.
