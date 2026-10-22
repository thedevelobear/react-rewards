# 0017. `isolatedDeclarations` is on

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
PR 1 left `isolatedDeclarations` off, because the v2 code would need annotations that PR 5 deletes anyway. Open question 1 asked whether to turn it on for the new code. It makes every exported function and constant declare its type, so declarations can be generated file by file without type inference. That suits the effect contract, whose exported types are the stable surface for every future effect.

`tsconfig.json` cannot scope the option to some folders. With it on, TypeScript 7 flags 8 places in the v2 code (`helpers.ts` and the three effect functions). It also requires `declaration` or `composite`. With `noEmit`, `declaration: true` emits nothing.

Options considered: on now with the v2 code annotated, on in PR 5 when the v2 code is deleted, or off.

## Decision
- `tsconfig.json` sets `isolatedDeclarations: true` and `declaration: true`, from PR 3.
- The 8 places in the v2 code get explicit types, with no change in behaviour.

## Consequences
- Every export in `src/` carries an explicit type from the first line of engine code. Nothing has to be retrofitted later.
- Exports are slightly more verbose, for example `export const x: Foo = ...` and explicit return types.
- The annotations in the v2 files disappear with those files in PR 5.
