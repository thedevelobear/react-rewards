# 0004. Publish ESM only

- **Status:** Accepted
- **Date:** 2026-10-22

Rslib emits one ESM build, `dist/index.js` with `dist/index.d.ts`, and `package.json` has `"type": "module"`. The `exports` map has one entry with `types` and `default` conditions. It uses `default` rather than `import`, so `require(esm)` in Node and in bundlers still resolves it. attw runs with `--profile esm-only`.

**Why:** Users who need CJS can stay on v2, and dropping it removes a second build and its `.d.cts` files.

**Consequences:** Tools that can't load ESM, such as old Jest setups or Node without `require(esm)`, stay on 2.x.
