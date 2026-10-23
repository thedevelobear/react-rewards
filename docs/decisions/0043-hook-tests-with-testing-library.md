# 0043. The hook's tests use Testing Library

- **Status:** Accepted
- **Date:** 2026-10-23

## Context
The hook's tests run in happy-dom in the `dom` Rstest project ([ADR 0022](0022-happy-dom-tests.md)). They need to render components, re-render them with new arguments, unmount them and run React's `act`. The root package had `react` but not `react-dom`.

Options considered:
- `react-dom` alone, with `createRoot` and React's `act`, and a small test component.
- `@testing-library/react` on top of `react-dom`, with `renderHook` and `render`.

On 2026-10-23 the latest versions were `@testing-library/react` 16.3.3, `@testing-library/dom` 10.4.2 (its peer dependency), `react-dom` 19.3.1 and `@types/react-dom` 19.3.0.

## Decision
- The root package gets those four as devDependencies, at exact versions ([ADR 0015](0015-exact-dependency-versions.md)). `react-dom` and `@types/react-dom` match the demo's versions.
- The hook's tests use `renderHook` and `render` from `@testing-library/react`.
- Rstest doesn't define test globals, so Testing Library can't register its own cleanup. Test files call `cleanup()` in `afterEach`.

## Consequences
- `react-dom` is only a devDependency. The package still doesn't depend on it.
- The tests run on React 19 only. The hook uses only APIs that React 18 has too, but nothing checks that yet.
- `fire()` can't draw in happy-dom, so its bursts are always skipped there. The hook's tests replace `@/core/fire` with a module mock to get bursts that run until the test ends them.
