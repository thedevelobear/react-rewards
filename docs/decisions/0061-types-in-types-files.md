# 0061. Types are declared in each folder's `types.ts`

- **Status:** Accepted
- **Date:** 2026-10-24

- Every type and interface in `src/` and `demo/src/` is declared in the `types.ts` of the folder it belongs to: public and private types, component props, and the shapes functions return. Other files import them with `import type`, and signatures don't spell out object types inline.
- `types.ts` holds types only. A type derived from a value, such as `(typeof FIELDS)[number]`, imports the value's type from the module that defines it.
- `index.ts` re-exports the types other folders use, as before.
- Test files (`test.ts`, `dom-test.ts`, `dom-test.tsx`), the browser specs in `demo/e2e/` and the benchmark script keep their own local types.

**Why:** Some folders kept their types in `types.ts` and others above the code that used them. One place per folder makes types easy to find, and leaves the other files as code.
