# 0043. The hook's tests use Testing Library

- **Status:** Accepted
- **Date:** 2026-10-23

The hook's tests use `renderHook` and `render` from `@testing-library/react`, in the `dom` project ([ADR 0022](0022-happy-dom-tests.md)). The root package adds `@testing-library/react`, `@testing-library/dom`, `react-dom` and `@types/react-dom` as devDependencies, the last two matching the demo. Test files call `cleanup()` in `afterEach`, because Rstest defines no globals for Testing Library to hook into. `@/core/fire` is mocked, since happy-dom can't draw.

**Why:** The tests render, re-render with new arguments, unmount and run `act`, which `renderHook` and `render` provide.

**Consequences:** The tests run on React 19 only. The hook uses no API that React 18 lacks, but nothing checks it.
