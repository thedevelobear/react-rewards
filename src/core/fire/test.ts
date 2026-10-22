import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { type AtlasOptions, createAtlas } from '@/core/atlas';
import { defineEffect, type EffectDefinition } from '@/core/define-effect';
import { createStage, DEFAULT_Z_INDEX } from '@/core/fire';
import { createLoop } from '@/core/loop';
import type { Overlay, Renderer } from '@/core/renderer';
import { createFakeCanvases, createFakeScheduler } from '@/test-utils';

type TestConfig = { count: number; lifetime: number };

const testEffect = (overrides: Partial<EffectDefinition<TestConfig>> = {}) =>
  defineEffect<TestConfig>({
    name: 'test',
    blend: 'additive',
    defaults: { count: 2, lifetime: 100 },
    sprites: () => [
      { shape: 'rect', color: '#f00', width: 4, height: 4 },
      { shape: 'circle', color: '#00f', size: 4 },
    ],
    spawn: () => {},
    update: () => {},
    ...overrides,
  });

const origin = { x: 100, y: 200 };

interface DrawnBatch {
  count: number;
  x: number[];
  vx: number[];
  regions: number;
  blend: string;
}

const setup = (
  options: { renderer?: boolean; atlas?: Partial<AtlasOptions> } = {}
) => {
  const fake = createFakeScheduler();
  const loop = createLoop(fake.scheduler);
  // A copy of each frame, because the stage reuses its batch list.
  const frames: DrawnBatch[][] = [];
  const renderer: Renderer = {
    kind: 'canvas',
    resize: () => {},
    draw: ({ batches }) => {
      frames.push(
        batches.map(({ pool, regions, blend }) => ({
          count: pool.count,
          x: Array.from(pool.fields.x.subarray(0, pool.count)),
          vx: Array.from(pool.fields.vx.subarray(0, pool.count)),
          regions: regions.length,
          blend,
        }))
      );
    },
    clear: () => {},
    dispose: () => {},
  };
  const leases: { zIndex: number; released: boolean }[] = [];
  const overlay: Overlay = {
    acquire: (zIndex) => {
      if (options.renderer === false) return undefined;
      const lease = { zIndex, released: false };
      leases.push(lease);
      return {
        renderer,
        release: () => {
          lease.released = true;
        },
      };
    },
  };
  const { createCanvas } = createFakeCanvases();
  const atlas = createAtlas({ createCanvas, ...options.atlas });
  const stage = createStage({ loop, overlay, atlas });
  let time = 0;
  return {
    stage,
    loop,
    frames,
    leases,
    counts: () => frames.map((frame) => frame.map((batch) => batch.count)),
    /** Runs the next frame, `ms` after the previous one. */
    tick: (ms = 1000 / 60) => {
      time += ms;
      fake.tick(time);
    },
  };
};

/** Lets every pending promise and microtask run. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

const counter = () => {
  const calls = { count: 0 };
  return {
    calls,
    onComplete: () => {
      calls.count += 1;
    },
  };
};

afterEach(() => {
  rs.unstubAllGlobals();
});

describe('createStage', () => {
  it('starts a burst once its sprites load and draws it until it ends', async () => {
    const { stage, loop, leases, counts, tick } = setup();
    const { calls, onComplete } = counter();
    const burst = stage.fire(testEffect(), { origin, onComplete });
    expect(leases).toEqual([{ zIndex: DEFAULT_Z_INDEX, released: false }]);
    expect(loop.running).toBe(false);

    await settle();
    expect(loop.running).toBe(true);
    tick();
    expect(counts()).toEqual([[2]]);

    for (let i = 0; i < 10; i++) tick(1000 / 30);
    expect(await burst.finished).toBe('complete');
    expect(calls.count).toBe(1);
    expect(leases[0]?.released).toBe(true);
    expect(loop.running).toBe(false);
  });

  it('spawns at the origin, resolved when fire() is called', async () => {
    const { stage, frames, tick } = setup();
    let box = { left: 10, top: 20, width: 100, height: 50 };
    const element = { getBoundingClientRect: () => box };
    stage.fire(testEffect(), { origin: element });
    box = { left: 500, top: 500, width: 0, height: 0 };
    await settle();
    tick();
    expect(frames[0]?.[0]?.x).toEqual([60, 60]);
  });

  it("passes the effect's blend mode and one region per sprite", async () => {
    const { stage, frames, tick } = setup();
    stage.fire(testEffect(), { origin });
    await settle();
    tick();
    expect(frames[0]?.[0]).toMatchObject({ regions: 2, blend: 'additive' });
  });

  it('applies config overrides, and repeats a burst with the same seed', async () => {
    const { stage, frames, tick } = setup();
    const effect = testEffect({
      spawn: (p, _config, rng) => {
        p.vx = rng.range(-100, 100);
      },
    });
    stage.fire(effect, { origin, config: { count: 5 }, seed: 7 });
    stage.fire(effect, { origin, config: { count: 5 }, seed: 7 });
    await settle();
    tick();
    const [first, second] = frames[0] ?? [];
    expect(first?.count).toBe(5);
    expect(second?.vx).toEqual(first?.vx);
  });

  it('claims the overlay at the zIndex given', () => {
    const { stage, leases } = setup();
    stage.fire(testEffect(), { origin, zIndex: 7 });
    expect(leases[0]?.zIndex).toBe(7);
  });

  it('draws concurrent bursts in one frame, in the order they started', async () => {
    const { stage, counts, tick } = setup();
    const short = stage.fire(testEffect(), {
      origin,
      config: { count: 1, lifetime: 50 },
    });
    const long = stage.fire(testEffect(), {
      origin,
      config: { count: 3, lifetime: 200 },
    });
    await settle();
    tick();
    expect(counts()).toEqual([[1, 3]]);

    for (let i = 0; i < 3; i++) tick(1000 / 30);
    expect(counts().at(-1)).toEqual([3]);
    expect(await short.finished).toBe('complete');
    for (let i = 0; i < 10; i++) tick(1000 / 30);
    expect(await long.finished).toBe('complete');
  });

  it('cancels a loading burst before it draws, without onComplete', async () => {
    const { stage, loop, frames, leases } = setup();
    const { calls, onComplete } = counter();
    const burst = stage.fire(testEffect(), { origin, onComplete });
    burst.cancel();
    expect(leases[0]?.released).toBe(true);
    expect(await burst.finished).toBe('cancelled');
    await settle();
    expect(loop.running).toBe(false);
    expect(frames).toEqual([]);
    expect(calls.count).toBe(0);
  });

  it('cancels a running burst: it is not drawn again', async () => {
    const { stage, counts, leases, tick } = setup();
    const { calls, onComplete } = counter();
    const first = stage.fire(testEffect(), { origin, onComplete });
    stage.fire(testEffect(), { origin, config: { count: 3 } });
    await settle();
    tick();
    first.cancel();
    first.cancel();
    tick();
    expect(counts()).toEqual([[2, 3], [3]]);
    expect(await first.finished).toBe('cancelled');
    expect(calls.count).toBe(0);
    expect(leases.map((lease) => lease.released)).toEqual([true, false]);
  });

  it('ignores cancel after the burst ended', async () => {
    const { stage, tick } = setup();
    const { calls, onComplete } = counter();
    const burst = stage.fire(testEffect(), { origin, onComplete });
    await settle();
    for (let i = 0; i < 10; i++) tick(1000 / 30);
    burst.cancel();
    expect(await burst.finished).toBe('complete');
    expect(calls.count).toBe(1);
  });

  it('skips under reduced motion unless told not to', async () => {
    rs.stubGlobal('matchMedia', () => ({ matches: true }));
    const { stage, leases } = setup();
    const { calls, onComplete } = counter();
    const skipped = stage.fire(testEffect(), { origin, onComplete });
    expect(await skipped.finished).toBe('skipped');
    expect(calls.count).toBe(1);
    expect(leases).toEqual([]);

    stage.fire(testEffect(), { origin, respectReducedMotion: false });
    expect(leases).toHaveLength(1);
  });

  it('skips a ref with no element', async () => {
    const { stage, leases } = setup();
    const burst = stage.fire(testEffect(), { origin: { current: null } });
    expect(await burst.finished).toBe('skipped');
    expect(leases).toEqual([]);
  });

  it('skips when no renderer is available', async () => {
    const { stage } = setup({ renderer: false });
    const { calls, onComplete } = counter();
    const burst = stage.fire(testEffect(), { origin, onComplete });
    expect(await burst.finished).toBe('skipped');
    expect(calls.count).toBe(1);
  });

  it('skips when a sprite fails to load, and releases the overlay', async () => {
    const { stage, loop, leases } = setup({
      atlas: { loadImage: () => Promise.reject(new Error('decode')) },
    });
    const effect = testEffect({
      sprites: () => [{ svg: '<svg/>', width: 4, height: 4 }],
    });
    const burst = stage.fire(effect, { origin });
    expect(await burst.finished).toBe('skipped');
    expect(leases[0]?.released).toBe(true);
    expect(loop.running).toBe(false);
  });

  it('skips an effect that throws in sprites or spawn', async () => {
    const { stage, leases } = setup();
    const { calls, onComplete } = counter();
    const fail = () => {
      throw new Error('effect');
    };
    const inSprites = stage.fire(testEffect({ sprites: fail }), {
      origin,
      onComplete,
    });
    const inSpawn = stage.fire(testEffect({ spawn: fail }), {
      origin,
      onComplete,
    });
    expect(await inSprites.finished).toBe('skipped');
    expect(await inSpawn.finished).toBe('skipped');
    expect(calls.count).toBe(2);
    expect(leases.every((lease) => lease.released)).toBe(true);
  });

  it('ends only the burst whose update throws', async () => {
    const { stage, counts, tick } = setup();
    const { calls, onComplete } = counter();
    const broken = stage.fire(
      testEffect({
        update: () => {
          throw new Error('effect');
        },
      }),
      { origin, onComplete }
    );
    stage.fire(testEffect(), { origin, config: { count: 3 } });
    await settle();
    tick();
    tick();
    expect(counts()).toEqual([[3], [3]]);
    expect(await broken.finished).toBe('complete');
    expect(calls.count).toBe(1);
  });

  it('calls onComplete in a microtask, never inside fire()', async () => {
    const { stage } = setup();
    const { calls, onComplete } = counter();
    stage.fire(testEffect(), { origin: { current: null }, onComplete });
    expect(calls.count).toBe(0);
    await Promise.resolve();
    expect(calls.count).toBe(1);
  });
});
