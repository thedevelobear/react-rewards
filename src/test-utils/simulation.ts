import {
  type Effect,
  type EffectConfig,
  resolveConfig,
} from '@/core/define-effect';
import type { Field } from '@/core/pool';
import { createSimulation, type Simulation } from '@/core/simulation';

const origin = { x: 0, y: 0 };

/** A burst of `effect` at (0, 0), with `overrides` on its defaults. */
export const simulate = <C extends EffectConfig>(
  effect: Effect<C>,
  overrides: Partial<C> = {},
  seed: number = 1
): Simulation =>
  createSimulation(effect, resolveConfig(effect, overrides), {
    origin,
    seed,
  });

/** One field of every live particle, in pool order. */
export const field = (simulation: Simulation, name: Field): number[] =>
  Array.from(simulation.pool.fields[name].subarray(0, simulation.pool.count));

/** Steps `seconds` at `hz` steps per second. */
export const run = (
  simulation: Simulation,
  seconds: number,
  hz: number = 60
): Simulation => {
  for (let i = 0; i < Math.round(seconds * hz); i++) simulation.step(1 / hz);
  return simulation;
};

export const mean = (values: readonly number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / values.length;
