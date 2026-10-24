# 0017. `isolatedDeclarations` is on

- **Status:** Accepted
- **Date:** 2026-10-22

`tsconfig.json` sets `isolatedDeclarations: true` and `declaration: true`, before the engine code is written. The 8 places in the v2 code that need explicit types get them, until that code is deleted.

**Why:** Every export declares its type, so declarations can be generated file by file, and the effect contract's exported types stay explicit. Turning it on before the engine code means nothing has to be retrofitted.

**Consequences:** Exports are slightly more verbose, with explicit types and return types.
