# Adding an effect

How to add a built-in effect to react-rewards: one folder in `src/effects/`, one export, one page and one icon on the site, and a few lines in the browser specs. Effects in user code need only `defineEffect`, which the site's [Custom effects](https://thedevelobear.github.io/react-rewards/#custom-effects) page covers.

In Claude Code, ask the session's `orchestrator` agent for the effect. Its `effect-creator` agent does the library's part of this guide, working out the physics first: flight times and heights with drag, oscillation that survives any frame rate, and the tests that prove it. Its `developer` agent then does the site's part, and its `qa` agent runs every check ([ADRs 0063](../decisions/0063-effect-creator-agent.md), [0064](../decisions/0064-orchestrated-agents.md)).

The example is a made-up `sparkle` effect. Copy the closest existing effect (`confetti`, `emoji`, `balloon` or `firework`) and rename it, rather than starting from an empty folder.

## The contract
An effect is the object `defineEffect` returns, typed in [`src/core/define-effect/types.ts`](../../src/core/define-effect/types.ts):

- `name`: the folder's name, singular and kebab-case. The site uses it as the page's URL hash.
- `blend`: `'normal'`, or `'additive'` for glows and sparks.
- `defaults`: every setting's default. The config type is checked against them.
- `sprites(config)`: the sprites the effect draws. A particle picks one with `p.sprite`. Particles can't be tinted, so an effect with colours draws one sprite per colour ([ADR 0019](../decisions/0019-particle-contract.md), [ADR 0020](../decisions/0020-sprite-sizes.md)).
- `spawn(p, config, rng, index)`: sets up one new particle. It starts at the burst's origin, with velocity 0, rotation 0, scales 1, alpha 1, sprite 0, empty slots and `life = lifetime / 1000`.
- `update(p, dt, config, ctx)`: advances one particle by `dt` seconds. Change its velocity, rotation, scale, alpha or sprite. The simulation then moves it by its velocity, so an effect never integrates position. `ctx.spawn(init)` adds a particle, for trails and sub-bursts.

The 3.0 contract has `spawn` and `update` only, with no pointer events and no continuous emitters ([ADR 0005](../decisions/0005-effect-contract-scope.md)). A draw feature that an effect needs, such as a new blend mode, has to be added to both renderers first.

## The folder
```
src/effects/sparkle/
  index.ts     # the public API: the effect and its config type
  effect.ts    # defineEffect(...)
  types.ts     # the config interface
  test.ts      # Node tests over a simulation
```

Assets, such as `balloon.svg`, live in the folder too. Import an SVG's markup with `?raw`.

`index.ts` re-exports and nothing else:

```ts
export { sparkle } from './effect';
export type { SparkleConfig } from './types';
```

### `types.ts`
The config extends `EffectConfig`, which brings `count` and `lifetime`. Reuse the existing names and units where they fit: `size`, `colors`, `angle`, `spread`, `velocity`, `drag` and `gravity`, in CSS pixels, px/s, px/s², per second, milliseconds and degrees ([ADR 0024](../decisions/0024-physical-config-units.md)).

Give every field a one-line JSDoc. The site's props table and panel show the same sentence, so copy it there word for word.

```ts
import type { EffectConfig } from '@/core/define-effect';

/** Sparkle's settings, in the units of ADR 0024. */
export interface SparkleConfig extends EffectConfig {
  /** Sparks per burst. */
  count: number;
  /** A spark's diameter in CSS pixels. */
  size: number;
  /** One sprite per colour. Each spark picks one at random. */
  colors: readonly string[];
  /** The average launch speed, in pixels per second. */
  velocity: number;
  /** Air resistance per second. */
  drag: number;
  /** The longest a spark lives, in milliseconds. */
  lifetime: number;
}
```

### `effect.ts`
```ts
import { defineEffect, type Effect } from '@/core/define-effect';
import { damp, degToRad } from '@/core/math';
import type { SparkleConfig } from './types';

/**
 * Sparks that burst out in every direction, slow down and fade.
 *
 * Slots: `s0` is the spark's twinkle phase.
 */
export const sparkle: Effect<SparkleConfig> =
  /* @__PURE__ */ defineEffect<SparkleConfig>({
    name: 'sparkle',
    blend: 'additive',
    defaults: {
      count: 40,
      size: 6,
      colors: ['#FFD166', '#FFFFFF'],
      velocity: 600,
      drag: 4,
      lifetime: 1200,
    },
    sprites: ({ size, colors }) =>
      colors.map((color) => ({ shape: 'circle', color, size })),
    spawn: (p, config, rng) => {
      const direction = degToRad(rng.range(0, 360));
      const speed = config.velocity * rng.range(0.5, 1.5);
      p.vx = Math.cos(direction) * speed;
      p.vy = -Math.sin(direction) * speed;
      p.sprite = rng.int(0, config.colors.length);
      p.s0 = rng.range(0, Math.PI * 2);
    },
    update: (p, dt, config) => {
      p.vx = damp(p.vx, config.drag, dt);
      p.vy = damp(p.vy, config.drag, dt);
      p.alpha =
        (1 - p.age / p.life) * (0.75 + 0.25 * Math.sin(p.s0 + p.age * 20));
    },
  });
```

- **Annotations.** The explicit `Effect<SparkleConfig>` is needed by `isolatedDeclarations` ([ADR 0017](../decisions/0017-isolated-declarations.md)), and `defineEffect<SparkleConfig>` checks the defaults against the interface. `/* @__PURE__ */` lets bundlers drop the effect when an app doesn't import it. Without it, every app pays for every effect ([ADR 0055](../decisions/0055-pure-effect-definitions.md)). For the same reason, keep top-level constants as plain literals: bundlers keep a top-level call such as `Math.sqrt(5)` even in apps that don't import the effect. `firework`'s golden angle is written out as `2.399963229728653` for this.
- **Units.** Positions are CSS pixels in viewport coordinates, with y pointing down, so "up" is a negative `vy`. Velocities are px/s, angles in effect code are radians, and `dt`, `age` and `life` are seconds.
- **Frame-rate independence.** Use `accelerate` for gravity with drag and `damp` for decay. Both are exact for any `dt`. Applying gravity and drag as two steps drifts at 30 Hz ([ADR 0019](../decisions/0019-particle-contract.md)).
- **Randomness.** Use the `rng` that `spawn` gets, or `ctx.rng` in `update`, never `Math.random`, so a `seed` replays the burst and the tests stay deterministic. Particles added in `update` take theirs from seeds instead (see "Children").
- **State.** Keep per-particle state in the slots `s0` to `s3`, and say what each holds in the effect's doc comment. Don't keep a reference to `p`: it is a view that the next particle reuses.
- **Lifetime.** A burst ends when its last particle dies. Give each particle a `life` of at most `lifetime / 1000`, so the burst ends by `lifetime`.

### Children
`ctx.spawn(init)` in `update` adds a particle, for trails and sub-bursts. Two things make children drift between frame rates, and `firework` shows the fix for both ([ADR 0067](../decisions/0067-fireworks-climb-in-closed-form.md)):

- **Place and age a child at the moment it was made.** A child appears where its parent is when `ctx.spawn` runs, at age 0, and is first stepped on the next frame. Everything made in one step would appear together, so a trail laid every few pixels would clump once a frame. Instead, work out when within the step each child was made, `lag` seconds before the step's end, and set it up as it would be by now: where the parent was then, moved on by `lag` seconds of its own motion, with the velocity it has after `lag`, and its `life` shortened by `lag`. Find the moment from the parent's closed form. `firework`'s rockets solve for when they climbed each 7 px with Newton's method (`climbTime` in `flight.ts`), and its willow stars measure their path's arc length with Simpson's rule (`arc` in `effect.ts`).
- **Seed a child from its parent, not from `ctx.rng`.** `ctx.rng` is drawn from in step order, so what a child gets depends on how many steps came first. Keep an integer seed in a slot instead, below 2^24 so the slot stores it exactly. Hash a child's seed from its parent's seed and its number, and draw a particle's random numbers by hashing its seed with an index (`firework`'s `noise.ts`). A seeded burst is then the same particle for particle at any frame rate, and its frame-rate test can compare particles by seed.

### Import restrictions
An effect imports only from `@/core/define-effect`, `@/core/math` and its own folder. Biome's `noRestrictedImports` enforces this in `biome.json`, so the renderers, the pool and the atlas can change without touching effects. `test.ts` is exempt, so it can run a simulation with the helpers in `@/test-utils`. Effects never import each other ([step 1b, rule 8](../plans/2026-10-22-v3-rewrite.md#1b-naming-and-folder-rules)).

## Tests
Errors thrown by an effect are swallowed: its burst just ends ([ADR 0030](../decisions/0030-effect-errors-swallowed.md)). The tests are where an effect's mistakes show, so cover it in `test.ts`, in Node, the way the built-in effects do, with the helpers they share in `src/test-utils/` ([ADR 0068](../decisions/0068-shared-test-helpers.md)):

```ts
import { describe, expect, it } from '@rstest/core';
import { resolveConfig } from '@/core/define-effect';
import { sparkle } from '@/effects/sparkle';
import { field, gaps, rounded, run, simulate } from '@/test-utils';

it('fades as it ages', () => {
  const simulation = run(simulate(sparkle, { count: 50 }, 3), 1.1);
  expect(field(simulation, 'alpha').every((alpha) => alpha < 1)).toBe(true);
});
```

- `simulate(sparkle, overrides, seed)` starts a burst at (0, 0), with `overrides` on the defaults and seed 1 unless given.
- `run(simulation, seconds, hz)` steps it, at 60 Hz unless given, and returns it.
- `field(simulation, 'x')` reads one field of every live particle, in pool order. `mean` averages one.
- `gaps(simulation, reference)` is how far each particle is from the same one in another run, in pixels.
- `rounded(simulation, ['x', 'y'])` is the fields an inline snapshot shows, rounded to 3 decimals.

Keep helpers only this effect needs in its `test.ts`, as `firework` keeps `climb`. Move a helper to `src/test-utils/` once a second test file needs it, rather than copying it.

Then test, as `src/effects/emoji/test.ts` does:
- the defaults, and that they are frozen;
- the sprites for a config;
- that a burst spawns `count` particles, and whatever `spawn` promises, such as the launch cone and speeds;
- what `update` does over time, such as fading out or settling at `gravity / drag`;
- that the burst ends by `lifetime`;
- frame-rate independence: after 1 s at 30, 60 and 144 Hz, every particle within 1 px of the 144 Hz run, by `gaps`;
- an inline snapshot of a few particles after half a second at 60 Hz, from `rounded`.

## The public API
Export the effect and its config type from `src/index.ts`, next to the others. That adds to the public API, so the PR records it in an ADR, as [ADR 0037](../decisions/0037-balloon-effect-name.md) did for `balloon`.

## The site
The site imports the built package ([ADR 0031](../decisions/0031-demo-imports-built-package.md)), so run `pnpm dev` next to `pnpm --filter demo dev` while you work on it.

1. Add `demo/src/data/effects/sparkle.ts`, with a control for every config field. `effectPage()` won't type-check until every field has one. Reuse `angle` and `spread` from `controls.ts`.

   ```ts
   import { sparkle } from 'react-rewards';
   import { effectPage } from './util';

   export const sparklePage = effectPage({
     effect: sparkle,
     label: 'Sparkle',
     description: 'Sparks that burst out in every direction and fade.',
     icon: 'sparkle',
     controls: {
       count: { kind: 'range', min: 1, max: 200, step: 1, description: 'Sparks per burst.' },
       // ...one control per field, with the JSDoc from types.ts.
     },
   });
   ```

   The panel edits numbers (`range`), booleans (`switch`), and lists of colours or emoji (`colors`, `emojis`). A setting of another type needs a new control kind in `demo/src/data/effects/types.ts`.

   `icon` names the sidebar icon, which the preview's button and the effect's card show too. Add its path data, on a 24 px grid, to `ICON_PATHS` in `demo/src/components/icon/paths.ts` ([demo README](../../demo/README.md), "Icons"). An optional `caption` puts a line under the preview's button, for what the settings don't say, such as the Fireworks page's "Fireworks look best on dark backgrounds. Just like in real life."
2. Add the page to `effects` in `demo/src/data/effects/list.ts`. Its sidebar link, its `#sparkle` route, its Preview and Code tabs, its props table, its card on Getting started, its column in the settings table on the useReward page, its place in the previous and next cards, and its entry on the Stress test page follow from that ([demo README](../../demo/README.md)). The card shows its icon in `--accent`, unless the effect has a colour in `demo/src/articles/getting-started/cards.tsx`.
3. Add a `RewardButton` with `testId="fire-sparkle"` to the fixture page, `demo/src/fixtures/app.tsx`, and add `'sparkle'` to the loop in `demo/e2e/smoke.ts` that checks each effect draws.
4. Add it to `EFFECTS` in `demo/bench/run.ts`, with its label on the Stress test page. If its `count` isn't particles, as `firework`'s is rockets, add it to `UNITS` in `demo/src/articles/stress-test/component.tsx` with about how many particles one makes, so the Stress test and the benchmark ask for about the right number.

## The rest
- Name the effect where the README and the useReward page's prose list the effects (`demo/src/articles/use-reward/component.tsx`), and in the site's description and Open Graph tags in `demo/index.html`. Add it to the share card, `demo/og-image/card.html`, and render the card again ([demo README](../../demo/README.md), "Favicon and link previews").
- Add `useReward + sparkle` to `.size-limit.json`, and note the size in the PR. A size close to the whole package's means the effect stopped tree-shaking.
- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm --filter demo typecheck` and `pnpm e2e`.
- Look at the effect on the site with both renderers, using the renderer setting on the Stress test page. They should look the same.
