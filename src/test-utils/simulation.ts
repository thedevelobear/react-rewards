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

/**
 * How far each particle of `simulation` is from the one at its index in
 * `reference`, in pixels.
 */
export const gaps = (
  simulation: Simulation,
  reference: Simulation
): number[] => {
  const y = field(simulation, 'y');
  const refX = field(reference, 'x');
  const refY = field(reference, 'y');
  return field(simulation, 'x').map((x, i) =>
    Math.hypot(x - (refX[i] ?? 0), (y[i] ?? 0) - (refY[i] ?? 0))
  );
};

const round = (value: number) => Math.round(value * 1000) / 1000;

/**
 * The `names` fields of the first `count` particles, rounded to 3 decimals,
 * for an inline snapshot.
 */
export const rounded = (
  simulation: Simulation,
  names: readonly Field[],
  count: number = simulation.pool.count
): Record<string, number>[] =>
  Array.from({ length: count }, (_, i) =>
    Object.fromEntries(
      names.map((name) => [
        name,
        round(field(simulation, name)[i] ?? Number.NaN),
      ])
    )
  );
