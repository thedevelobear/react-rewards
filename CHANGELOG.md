# Changelog

Each release's changes, newest first. Releases before 3.0.0 are tagged in git, with no entries here.

## 3.1.0

### Added
- `firework`: a volley of rockets that climb on a spiralling trail and burst as peonies, willows and crackles. Its settings, typed as `FireworkConfig`, are on [its page of the docs](https://thedevelobear.github.io/react-rewards/#firework). It looks best on dark backgrounds.

## 3.0.0

A rewrite, with a new engine and API. [Upgrading from v2](https://thedevelobear.github.io/react-rewards/#upgrading-from-v2) maps each v2 option to its replacement.

### Breaking changes
- `useReward(target, effect, config?, options?)` takes a ref or an element instead of an element id, and an imported effect (`confetti`, `emoji`, `balloon`) instead of a type name.
- `balloons` is now `balloon`.
- Settings use physical units: `velocity` in px/s, `gravity` in px/s², `drag` per second and `lifetime` in milliseconds. `elementCount` is `count`, `elementSize` is `size`, `emoji` is `emojis`, and `startVelocity` and `decay` are replaced by `velocity`, `drag` and `gravity`.
- `fps` and `position` are removed. `zIndex` and `onAnimationComplete` (now `onComplete`) are burst options, in the fourth argument.
- `onClick={reward}` starts the burst at the pointer. `onClick={() => reward()}` starts it at the element.
- The effects were redesigned and look different. Balloons can no longer be popped.
- Bursts are skipped for people who prefer reduced motion, unless `respectReducedMotion` is `false`.
- React 18 or later. The package is ESM only.

### Added
- A particle engine that draws with WebGL2, with a Canvas 2D fallback, on one canvas over the page, so nothing clips a burst. Particles move by time, so bursts look the same at any frame rate.
- `reward()` returns the burst. Calls stack, and `isAnimating` stays true until every burst has ended. `reward` keeps one identity, and each call uses the latest arguments.
- `fire(effect, options)` plays an effect without React. Its burst has `cancel()`, `finished` and `renderer`.
- `setRenderer('auto' | 'webgl' | 'canvas')`.
- `defineEffect` for custom effects, with the math helpers the built-in effects use.
- A `seed` option, so a burst can be replayed exactly.
- A site with every effect live and the docs: https://thedevelobear.github.io/react-rewards/
- Packages are published from GitHub Actions with npm provenance.
