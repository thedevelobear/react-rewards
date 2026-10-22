# 0004. Publish ESM only

- **Status:** Accepted
- **Date:** 2026-10-22

## Context
The original plan built both ESM and CJS, with an `exports` map carrying `import` and `require` conditions and separate `.d.ts` and `.d.cts` files. The maintainer answered that CJS is no longer needed, because users who need CJS can stay on v2.

## Decision
- Rslib emits one ESM build (`dist/index.js`) and its declarations (`dist/index.d.ts`). `package.json` has `"type": "module"`.
- The `exports` map has one entry, with `types` and `default` conditions pointing at that build. It uses `default` rather than `import` so that `require()` also resolves it, both in Node versions with `require(esm)` and in bundlers. A map with only `import` would throw `ERR_PACKAGE_PATH_NOT_EXPORTED` for those callers.
- `@arethetypeswrong/cli` runs with `--profile esm-only`, so it does not flag the missing CJS build.

## Consequences
- No `index.cjs` or `.d.cts` to build or publish.
- Tools that still need CJS and cannot load ESM (old Jest setups, Node versions without `require(esm)`) must stay on react-rewards 2.x.
- If CJS comes back, it needs a new ADR that supersedes this one.
