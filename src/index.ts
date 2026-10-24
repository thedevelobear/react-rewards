export type {
  BlendMode,
  ConfigOf,
  Effect,
  EffectConfig,
  EffectDefinition,
  Particle,
  SpriteSource,
  UpdateContext,
} from '@/core/define-effect';
export { defineEffect } from '@/core/define-effect';
export type { Burst, BurstEnd, FireOptions } from '@/core/fire';
export { fire, setRenderer } from '@/core/fire';
export type { Easing, Rng } from '@/core/math';
export {
  accelerate,
  clamp,
  createRng,
  damp,
  degToRad,
  easeInCubic,
  easeInOutCubic,
  easeInOutQuad,
  easeInQuad,
  easeOutCubic,
  easeOutQuad,
  lerp,
  linear,
} from '@/core/math';
export type { Origin } from '@/core/origin';
export type { RendererKind, RendererPreference } from '@/core/renderer';
export type { BalloonConfig } from '@/effects/balloon';
export { balloon } from '@/effects/balloon';
export type { ConfettiConfig } from '@/effects/confetti';
export { confetti } from '@/effects/confetti';
export type { EmojiConfig } from '@/effects/emoji';
export { emoji } from '@/effects/emoji';
export type {
  RewardOptions,
  RewardTarget,
  UseRewardResult,
} from '@/react/use-reward';
export { useReward } from '@/react/use-reward';
