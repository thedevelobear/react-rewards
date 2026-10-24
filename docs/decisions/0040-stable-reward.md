# 0040. `reward` is stable, and each call reads the latest arguments

- **Status:** Accepted
- **Date:** 2026-10-23

`reward` keeps one identity while the component is mounted. Each call reads the target, effect, config and options from the latest committed render. A change applies from the next call, not to running bursts.

**Why:** v2 recreated `reward` whenever `config` changed, so an inline config made a new `reward` on every render, and re-ran anything that depended on it.

**Consequences:** `reward` can go in dependency arrays and to memoised children. This changes behaviour from v2.
