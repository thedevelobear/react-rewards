![react-rewards logo](assets/react-rewards.png?raw=true "react-rewards")

[![npm version](https://badge.fury.io/js/react-rewards.svg)](https://badge.fury.io/js/react-rewards) [![forthebadge](https://forthebadge.com/images/badges/makes-people-smile.svg)](https://forthebadge.com)

:sparkles: **GPU-rendered**: WebGL2, with a Canvas 2D fallback
:evergreen_tree: **Tree-shakeable**: about 7 kB gzipped for `useReward` and confetti
:female_detective: **Built with TypeScript**
:stopwatch: **Frame-rate independent**, and quiet for people who prefer reduced motion

**React-rewards** lets you add micro-interactions to your app, and rewards users with the rain of confetti, emoji or balloons in seconds.
Firing confetti all over the page may seem like a questionable idea, but keep in mind that rewarding users for their actions is not.
If a huge cloud of smiling emoji doesn't fit your application well, try changing the physics config to make it more subtle.

You can read more on the subject of micro-interactions in my blog post – https://www.thedevelobear.com/post/microinteractions/

## Demo

**[See every effect live](https://thedevelobear.github.io/react-rewards/)**, change its settings, and copy the code for what you pick.

Upgrading from v2? See [From v2](#from-v2).

## Installation

```sh
pnpm add react-rewards
# or
npm install react-rewards
# or
yarn add react-rewards
```

React 18 or later. The package is ESM only.

## Usage

Give `useReward` a ref to the element a reward starts from, and an effect. Each call to `reward()` fires a burst from the centre of that element.

```tsx
import { useRef } from 'react';
import { confetti, useReward } from 'react-rewards';

export const RewardButton = () => {
  const ref = useRef<HTMLButtonElement>(null);
  const { reward, isAnimating } = useReward(ref, confetti);

  return (
    <button ref={ref} type="button" onClick={() => reward()}>
      {isAnimating ? 'Yay!' : 'Reward me'}
    </button>
  );
};
```

Bursts are drawn on one canvas over the whole page, so the element's `overflow` or `transform` can't clip them. Each call starts a new burst, and earlier ones keep going.

Pass `reward` straight to a handler, as in `onClick={reward}`, and the burst starts at the pointer instead. A click from the keyboard still starts at the element.

### Settings

The third argument changes the effect's settings, and the fourth sets options for the burst. Both can change on any render: `reward` stays the same function, and each call uses the latest values.

```tsx
const { reward } = useReward(
  ref,
  emoji,
  { emojis: ['🎉', '🚀'], count: 30, spread: 70 },
  { onComplete: () => console.log('done') }
);
```

### Effects

`confetti`, `emoji` and `balloon` share most of their settings. Every setting is optional.

| Setting | Unit | `confetti` | `emoji` | `balloon` | What it does |
|---|---|---|---|---|---|
| `count` | | `100` | `20` | `16` | Particles per burst. |
| `size` | CSS px | `10` | `25` | `30` | A piece's width, an emoji's font size, or a balloon's width. |
| `colors` | | 5 colours | | 5 colours | Each particle picks one. |
| `emojis` | | | `['🤓', '😊', '🥳']` | | Particles take them in turn. |
| `angle` | degrees | `90` | `90` | `90` | The launch direction, counter-clockwise from the right. `90` is up. |
| `spread` | degrees | `60` | `45` | `90` | The width of the launch cone around `angle`. |
| `velocity` | px/s | `1500` | `1500` | `300` | The average launch speed. |
| `drag` | per second | `3` | `3` | `2` | Air resistance. Falling particles settle at about `gravity / drag`. |
| `gravity` | px/s² | `900` | `900` | `-300` | Downward pull. Negative rises, as balloons do. |
| `lifetime` | ms | `3000` | `3000` | `5000` | The longest a particle lives. |
| `rotate` | | | `true` | | Whether emoji tilt and spin. |

The default colours are `#A45BF1`, `#25C6F6`, `#72F753`, `#F76C88` and `#F5F770`.

### Burst options

| Option | Default | What it does |
|---|---|---|
| `zIndex` | `2147483647` | The canvas's z-index while the burst runs. |
| `onComplete` | | Called once when the burst ends on its own. Not called when it is cancelled. |
| `respectReducedMotion` | `true` | Skips the burst when the user prefers reduced motion. `onComplete` is still called. |
| `seed` | random | Seeds the burst's random numbers, so the same seed plays the same burst. |

### What `useReward` returns

- `reward(origin?)` fires the effect and returns the burst. Without an argument it starts at the target's centre. It also takes a point in viewport pixels (`{ x, y }`), another element or ref, or a pointer event.
- `isAnimating` is true from a call until every burst it started has ended.

Bursts still running when the component unmounts are cancelled.

### Picking an effect at runtime

Any effect fits where an effect is expected, so you can choose one as you render:

```tsx
const { reward } = useReward(ref, party ? confetti : emoji, { count: 30 });
```

## Without React

`fire` plays an effect once, from a point, an element or a ref:

```ts
import { confetti, fire } from 'react-rewards';

const burst = fire(confetti, {
  origin: { x: 200, y: 300 },
  config: { count: 80 },
  zIndex: 10,
});

burst.cancel(); // ends it at once
const how = await burst.finished; // 'complete', 'skipped' or 'cancelled'
```

It takes the same settings as `config`, and the same burst options beside it. `burst.renderer` says which renderer it was given: `'webgl'`, `'canvas'`, or undefined if it was skipped before getting one.

## Renderers

Bursts are drawn with WebGL2, and with Canvas 2D where WebGL2 isn't available. Both draw the same frames. `setRenderer` forces one for the whole page, for example to compare them:

```ts
import { setRenderer } from 'react-rewards';

setRenderer('canvas'); // or 'webgl', or 'auto' (the default)
```

Keep `'auto'` in production. A forced renderer never falls back, so with `'webgl'` a browser without WebGL2 shows nothing.

WebGL keeps 120 fps with 20000 particles for every effect in the [v3 benchmark](docs/benchmarks/2026-10-23-v3-engine.md).

## Custom effects

An effect is a plain object made with `defineEffect`. It names the sprites it draws, sets up each new particle in `spawn`, and changes each particle every frame in `update`. The engine moves particles by their velocity, so an effect only changes the velocity. Custom effects work everywhere the built-in ones do.

```ts
import {
  accelerate,
  defineEffect,
  degToRad,
  easeInQuad,
  useReward,
} from 'react-rewards';

export const snow = defineEffect({
  name: 'snow',
  blend: 'normal',
  defaults: { count: 40, size: 6, color: '#ffffff', drag: 2, gravity: 120, lifetime: 4000 },
  sprites: ({ size, color }) => [{ shape: 'circle', color, size }],
  spawn: (p, _config, rng) => {
    const direction = degToRad(rng.range(0, 360));
    const speed = rng.range(100, 300);
    p.vx = Math.cos(direction) * speed;
    p.vy = -Math.sin(direction) * speed;
    p.scale = rng.range(0.5, 1);
  },
  update: (p, dt, config) => {
    p.vx = accelerate(p.vx, 0, config.drag, dt);
    p.vy = accelerate(p.vy, config.gravity, config.drag, dt);
    p.alpha = 1 - easeInQuad(p.age / p.life);
  },
});

// useReward(ref, snow, { color: '#cce8ff' })
```

- **Units.** Positions are CSS pixels in viewport coordinates, with y pointing down. Velocities are px/s, `dt` and `age` are seconds, and angles are radians.
- **Sprites.** `{ shape: 'rect', color, width, height }`, `{ shape: 'circle', color, size }`, `{ emoji, size }`, `{ svg, width, height }`, or `{ key, width, height, draw(ctx, width, height) }` for anything a 2D canvas can draw. A particle picks one with `p.sprite`. Particles can't be tinted, so draw one sprite per colour.
- **Particles** have `x`, `y`, `vx`, `vy`, `rotation`, `scale`, `scaleX`, `scaleY`, `alpha`, `sprite`, `age`, `life`, and four free slots, `s0` to `s3`, for the effect's own state. Don't keep a particle after `spawn` or `update` returns: the object is reused.
- **Helpers.** `accelerate` (gravity with drag) and `damp` (decay) are exact at any frame rate. There are also `clamp`, `lerp`, `degToRad`, the easings (`linear`, `easeInQuad`, `easeOutQuad`, `easeInOutQuad`, `easeInCubic`, `easeOutCubic`, `easeInOutCubic`) and `createRng`. Use the `rng` you are given, so a `seed` replays the burst.
- **`blend: 'additive'`** makes overlapping particles brighter, for glows and sparks.
- `update`'s fourth argument has `spawn(init)`, which adds a particle, for trails and sub-bursts.

If an effect throws, its burst ends quietly and the rest of the page carries on. If you publish effects in a package, write `/* @__PURE__ */` before each `defineEffect(` call, so bundlers can drop the ones an app doesn't use.

To add an effect to react-rewards itself, see [the effect guide](docs/guides/adding-an-effect.md).

## Server rendering

The package can be imported on the server: nothing touches `window` until a burst fires. `dist/index.js` starts with `'use client'`, so in the Next.js App Router, use `useReward` in a Client Component.

## From v2

v3 is a rewrite, with a new engine and API. The effects were redesigned, so they look different, and their settings use physical units, so v2's numbers don't carry over. The table maps each v2 option to its v3 counterpart, and the [demo](https://thedevelobear.github.io/react-rewards/) helps you tune the new values.

| v2 | v3 |
|---|---|
| `useReward('rewardId', 'confetti', config)` | `useReward(ref, confetti, config, options)`. The effect is imported by name, so the ones you don't use aren't bundled. |
| `<span id="rewardId" />` | A ref, or the element itself. The burst starts at its centre. |
| `'balloons'` | `balloon` |
| `elementCount` | `count` |
| `elementSize` | `size` |
| `emoji` | `emojis` |
| `startVelocity` (px per frame) | `velocity` (px per second) |
| `decay` (velocity kept per frame) | `drag` (per second), and the new `gravity` |
| `lifetime` (frames) | `lifetime` (milliseconds) |
| `angle`, `spread`, `colors`, `rotate` | The same names and units. |
| `fps` | Removed. Particles move by time, at any frame rate. |
| `position` | Removed. One fixed canvas covers the page. |
| `zIndex` | A burst option, the fourth argument. It defaults to the top of the page instead of `0`. |
| `onAnimationComplete` | `onComplete`, a burst option. |
| `reward` changes when the config does | `reward` never changes, and each call uses the latest config. |
| `onClick={reward}` starts at the element | `onClick={reward}` starts at the pointer. Write `onClick={() => reward()}` to start at the element. |
| Balloons pop when clicked | Balloons can't be clicked. |
| Reduced motion is ignored | Bursts are skipped for people who prefer reduced motion. Set `respectReducedMotion: false` to play them anyway. |
| React 15 to 17, CommonJS | React 18 or later, ESM only. |

## Contributing

The repo uses pnpm, and records its decisions in [`docs/`](docs/README.md). Start with [`AGENTS.md`](AGENTS.md) for the commands.

## License

MIT
