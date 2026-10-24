import type { Rng } from '@/core/math';

/** How a particle combines with what is drawn under it. */
export type BlendMode = 'normal' | 'additive';

/**
 * One sprite an effect draws, sized in CSS pixels. A particle is drawn at
 * this size times its scale. Colour is baked into the sprite, because
 * particles have no tint. The atlas rasterises each source once per size and
 * pixel ratio (ADR 0020).
 */
export type SpriteSource =
  | {
      readonly shape: 'rect';
      readonly color: string;
      readonly width: number;
      readonly height: number;
    }
  /** `size` is the diameter. */
  | { readonly shape: 'circle'; readonly color: string; readonly size: number }
  /** `size` is the font size. */
  | { readonly emoji: string; readonly size: number }
  | { readonly svg: string; readonly width: number; readonly height: number }
  | {
      /** Identifies the drawing in the atlas cache. */
      readonly key: string;
      readonly width: number;
      readonly height: number;
      /** Paints the box from (0, 0) to (width, height). `ctx` is pre-scaled. */
      readonly draw: (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number
      ) => void;
    };

/** The fields every effect's config has. */
export interface EffectConfig {
  /** Particles spawned per burst. */
  count: number;
  /** How long a particle lives, in milliseconds. */
  lifetime: number;
}

/**
 * One particle, as an effect sees it. Positions are CSS pixels in viewport
 * coordinates, with y pointing down. Velocities are pixels per second, and
 * angles are radians.
 *
 * The object is a view over the particle pool and is reused for the next
 * particle. Don't keep a reference to it after `spawn` or `update` returns.
 */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  /** Uniform scale. The drawn size is `scale * scaleX` by `scale * scaleY`. */
  scale: number;
  /** Horizontal scale, for flips and squash. */
  scaleX: number;
  /** Vertical scale, for flips and squash. */
  scaleY: number;
  /** Opacity from 0 to 1. */
  alpha: number;
  /** Index into the list returned by the effect's `sprites`. */
  sprite: number;
  /** Seconds since the particle spawned. The simulation advances it. */
  readonly age: number;
  /** Seconds the particle lives. It is removed once `age` reaches `life`. */
  life: number;
  /** Free slots for effect-specific state, such as spin speed or phase. */
  s0: number;
  s1: number;
  s2: number;
  s3: number;
}

/** What `update` can do besides changing its own particle. */
export interface UpdateContext {
  /** The burst's generator. Using it keeps seeded bursts deterministic. */
  readonly rng: Rng;
  /**
   * Adds a particle to the burst, for trails and sub-bursts. It starts at the
   * current particle's position with default fields, then `init` sets it up.
   * Its first update is on the next step.
   */
  spawn(init: (child: Particle) => void): void;
}

/**
 * What an effect is made of. `sprites`, `spawn` and `update` are methods, so
 * TypeScript compares their config parameters bivariantly and any `Effect<C>`
 * is an `Effect` (ADR 0052).
 */
export interface EffectDefinition<C extends EffectConfig> {
  readonly name: string;
  readonly blend: BlendMode;
  /**
   * The config's default values. The config type is inferred from them.
   * (Typing this as `Readonly<C>` would infer literal types such as `20`.)
   */
  readonly defaults: C;
  /** The sprites this effect draws. A particle picks one with `sprite`. */
  sprites(config: C): readonly SpriteSource[];
  /**
   * Sets up one new particle. It starts at the burst's origin with velocity
   * 0, rotation 0, scales 1, alpha 1, sprite 0, slots 0 and
   * `life = lifetime / 1000`.
   */
  spawn(p: Particle, config: C, rng: Rng, index: number): void;
  /**
   * Advances one particle by `dt` seconds. Change its velocity (forces such
   * as gravity and drag), rotation, scale, alpha or sprite. The simulation
   * then moves the particle by its velocity, so effects don't integrate
   * position themselves.
   */
  update(p: Particle, dt: number, config: C, ctx: UpdateContext): void;
}

/** An effect made with `defineEffect`. It and its defaults are frozen. */
export interface Effect<C extends EffectConfig = EffectConfig>
  extends Omit<EffectDefinition<C>, 'defaults'> {
  readonly defaults: Readonly<C>;
}

/**
 * The config type of the effect `E`. For a union of effects, it is the union
 * of their configs (ADR 0052).
 */
export type ConfigOf<E extends Effect> =
  E extends Effect<infer C extends EffectConfig> ? C : never;
