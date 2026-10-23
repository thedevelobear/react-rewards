# 0040. `reward` is stable, and each call reads the latest arguments

- **Status:** Accepted
- **Date:** 2026-10-23

## Context
v2's `useReward` built `reward` with `useCallback` and listed `config` in its dependencies. An inline config object, the common way to write it, made a new `reward` on every render. Anything that depended on `reward`, such as an effect's dependency array or a memoised child, re-ran or re-rendered each time. Open question 2 in the plan asked whether the new hook should read the latest config through a ref, so that `reward` stays the same function.

Options considered:
- A stable `reward` that reads the latest arguments when it is called.
- A `reward` recreated whenever its arguments change, as in v2. Callers would memoise the config to keep it stable.

## Decision
- `reward` keeps one identity for as long as the component stays mounted.
- Each call reads the target, the effect, the config and the burst options ([ADR 0041](0041-hook-burst-options-argument.md)) from the latest committed render. A render that React throws away never reaches a call.
- Changing an argument doesn't affect bursts that are already running. It applies from the next call.

## Consequences
- Inline config and options objects are fine. `reward` can go in dependency arrays and be passed to memoised children.
- This changes behaviour from v2. The README's "from v2" section (PR 12) says so.
- Calling `reward` during render is unsupported, as for any side effect. Such a call would use the previous commit's arguments.
