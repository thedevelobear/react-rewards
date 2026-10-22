import type { Rng } from '@/core/math';

/** How a particle combines with what is drawn under it. */
export type BlendMode = 'normal' | 'additive';

/**
 * One sprite an effect draws. Colour is baked into the sprite, because
 * particles have no tint. The atlas rasterises each source once.
 */
export type SpriteSource =
  | { readonly shape: 'rect' | 'circle'; readonly color: string }
  | { readonly emoji: string }
  | { readonly svg: string }
  | {
      readonly key: string;
      readonly draw: (ctx: CanvasRenderingContext2D, size: number) => void;
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

export interface EffectDefinition<C extends EffectConfig> {
  readonly name: string;
  readonly blend: BlendMode;
  /**
   * The config's default values. The config type is inferred from them.
   * (Typing this as `Readonly<C>` would infer literal types such as `20`.)
   */
  readonly defaults: C;
  /** The sprites this effect draws. A particle picks one with `sprite`. */
  readonly sprites: (config: C) => readonly SpriteSource[];
  /**
   * Sets up one new particle. It starts at the burst's origin with velocity
   * 0, rotation 0, scales 1, alpha 1, sprite 0, slots 0 and
   * `life = lifetime / 1000`.
   */
  readonly spawn: (p: Particle, config: C, rng: Rng, index: number) => void;
  /**
   * Advances one particle by `dt` seconds. Change its velocity (forces such
   * as gravity and drag), rotation, scale, alpha or sprite. The simulation
   * then moves the particle by its velocity, so effects don't integrate
   * position themselves.
   */
  readonly update: (
    p: Particle,
    dt: number,
    config: C,
    ctx: UpdateContext
  ) => void;
}

/** An effect made with `defineEffect`. It and its defaults are frozen. */
export interface Effect<C extends EffectConfig = EffectConfig>
  extends Omit<EffectDefinition<C>, 'defaults'> {
  readonly defaults: Readonly<C>;
}
