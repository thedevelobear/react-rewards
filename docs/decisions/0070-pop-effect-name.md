# 0070. The pop effect is named `pop`

- **Status:** Accepted
- **Date:** 2026-10-31

The folder is `src/effects/pop/`, the export `pop`, the config type `PopConfig` and the effect's `name` `'pop'`. `src/index.ts` exports `pop` and the type `PopConfig`. Display text, such as the site's "Pop", isn't covered.

**Why:** `burst` would clash with the `Burst` that `fire()` and `reward()` return. `pop` is singular, as effect names are ([ADR 0037](0037-balloon-effect-name.md)).
