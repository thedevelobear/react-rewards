import { afterEach, describe, expect, it } from '@rstest/core';
import { createLoop, type FrameScheduler, getLoop, MAX_DT } from '@/core/loop';

/** A scheduler driven by hand: `tick(time)` runs the pending frame. */
const createFakeScheduler = () => {
  let pending: ((time: number) => void) | undefined;
  let handles = 0;
  const scheduler: FrameScheduler = {
    request: (callback) => {
      pending = callback;
      handles += 1;
      return handles;
    },
    cancel: () => {
      pending = undefined;
    },
  };
  return {
    scheduler,
    get pending() {
      return pending !== undefined;
    },
    tick: (time: number) => {
      const callback = pending;
      pending = undefined;
      callback?.(time);
    },
  };
};

describe('createLoop', () => {
  it('schedules frames only while it has callbacks', () => {
    const fake = createFakeScheduler();
    const loop = createLoop(fake.scheduler);
    expect(loop.running).toBe(false);

    const remove = loop.add(() => {});
    expect(loop.running).toBe(true);
    expect(fake.pending).toBe(true);

    remove();
    expect(loop.running).toBe(false);
    expect(fake.pending).toBe(false);
  });

  it('passes 0 on the first frame, then seconds since the last frame', () => {
    const fake = createFakeScheduler();
    const loop = createLoop(fake.scheduler);
    const steps: number[] = [];
    loop.add((dt) => steps.push(dt));

    fake.tick(1000);
    fake.tick(1016);
    fake.tick(1032);
    expect(steps).toEqual([0, 0.016, 0.016].map((v) => expect.closeTo(v, 9)));
  });

  it('caps long gaps at MAX_DT, and ignores time going backwards', () => {
    const fake = createFakeScheduler();
    const steps: number[] = [];
    createLoop(fake.scheduler).add((dt) => steps.push(dt));

    fake.tick(0);
    fake.tick(5000);
    fake.tick(4000);
    expect(steps).toEqual([0, MAX_DT, 0]);
  });

  it('accepts a different cap', () => {
    const fake = createFakeScheduler();
    const steps: number[] = [];
    createLoop(fake.scheduler, 0.1).add((dt) => steps.push(dt));
    fake.tick(0);
    fake.tick(500);
    expect(steps).toEqual([0, 0.1]);
  });

  it('starts again from dt 0 after it stopped', () => {
    const fake = createFakeScheduler();
    const loop = createLoop(fake.scheduler);
    const steps: number[] = [];
    const remove = loop.add((dt) => steps.push(dt));
    fake.tick(0);
    fake.tick(16);
    remove();

    loop.add((dt) => steps.push(dt));
    fake.tick(10_000);
    expect(steps).toEqual([0, 0.016, 0]);
  });

  it('runs callbacks added during a frame from the next frame', () => {
    const fake = createFakeScheduler();
    const loop = createLoop(fake.scheduler);
    const calls: string[] = [];
    loop.add(() => {
      calls.push('first');
      if (calls.length === 1) loop.add(() => calls.push('second'));
    });

    fake.tick(0);
    expect(calls).toEqual(['first']);
    fake.tick(16);
    expect(calls).toEqual(['first', 'first', 'second']);
  });

  it('skips a callback removed earlier in the same frame', () => {
    const fake = createFakeScheduler();
    const loop = createLoop(fake.scheduler);
    const calls: string[] = [];
    let removeSecond = (): void => {};
    loop.add(() => {
      calls.push('first');
      removeSecond();
    });
    removeSecond = loop.add(() => calls.push('second'));

    fake.tick(0);
    expect(calls).toEqual(['first']);
  });

  it('stops when the last callback removes itself during a frame', () => {
    const fake = createFakeScheduler();
    const loop = createLoop(fake.scheduler);
    const remove = loop.add(() => remove());
    fake.tick(0);
    expect(loop.running).toBe(false);
    expect(fake.pending).toBe(false);
  });

  it('ignores a second call to the same remove function', () => {
    const fake = createFakeScheduler();
    const loop = createLoop(fake.scheduler);
    const remove = loop.add(() => {});
    loop.add(() => {});
    remove();
    remove();
    expect(loop.running).toBe(true);
  });

  it('keeps running when a callback throws', () => {
    const fake = createFakeScheduler();
    const loop = createLoop(fake.scheduler);
    loop.add(() => {
      throw new Error('boom');
    });
    expect(() => fake.tick(0)).toThrow('boom');
    expect(fake.pending).toBe(true);
  });
});

describe('getLoop', () => {
  const globals = globalThis as {
    requestAnimationFrame?: unknown;
    cancelAnimationFrame?: unknown;
  };

  afterEach(() => {
    delete globals.requestAnimationFrame;
    delete globals.cancelAnimationFrame;
  });

  it('returns one shared loop on requestAnimationFrame', () => {
    const requested: unknown[] = [];
    globals.requestAnimationFrame = (callback: unknown) =>
      requested.push(callback);
    globals.cancelAnimationFrame = () => {};

    const loop = getLoop();
    expect(getLoop()).toBe(loop);
    const remove = loop.add(() => {});
    expect(requested).toHaveLength(1);
    remove();
  });
});
