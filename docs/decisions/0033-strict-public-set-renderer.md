# 0033. `setRenderer` is public, and a forced renderer never falls back

- **Status:** Accepted
- **Date:** 2026-10-22

- `setRenderer` and `RendererPreference` (`'auto' | 'webgl' | 'canvas'`) are exported. The choice applies to the whole page, and defaults to `'auto'`.
- `'auto'` tries WebGL2, then Canvas 2D. `'webgl'` and `'canvas'` create only that renderer, and bursts are skipped when it isn't available.
- A new choice applies from the next burst. Running bursts finish on the current renderer, and the overlay is removed when the last one ends.

**Why:** The demo's renderer toggle can only call what the package exports ([ADR 0031](0031-demo-imports-built-package.md)). If a forced `'webgl'` fell back, the parity spec could compare Canvas 2D with itself and pass.

**Consequences:** A page that forces `'webgl'` shows nothing without WebGL2, so production code uses `'auto'`.
