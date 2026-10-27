# 0068. Helpers that more than one test file uses live in `src/test-utils/`

- **Status:** Accepted
- **Date:** 2026-10-27

- A test helper that more than one test file uses lives in `src/test-utils/`, in a module named for what it is for, exported from its `index.ts`. Tests import it from `@/test-utils`. A test file keeps only the helpers specific to it, such as `firework`'s `climb`.
- `simulation.ts` holds the effect tests' helpers: `simulate(effect, overrides, seed)` starts a burst at (0, 0), `run` steps it at a frame rate, `field` reads one field of the live particles, `gaps` measures each particle's distance from the same one in another run, `rounded` gives the fields an inline snapshot shows, and `mean` averages.
- `effect.ts` holds `testEffect`, an effect that does nothing unless overridden. `batch.ts` holds the particles and atlas regions the renderer tests draw, and `calls.ts` picks recorded calls by name. The fakes stay in `canvas.ts`, `webgl.ts` and `scheduler.ts`.
- Types the helpers share go in `src/test-utils/types.ts` ([ADR 0061](0061-types-in-types-files.md)). `src/test-utils/` stays out of the build ([ADR 0032](0032-build-tsconfig-without-tests.md)).

**Why:** Every effect's test had its own copy of the same simulation helpers, and each new effect copied them again. One copy keeps the tests measuring the same way, and leaves each test file with what it tests.

**Consequences:** A change to a shared helper changes every test that uses it, so it has to keep doing what each of them expects.
