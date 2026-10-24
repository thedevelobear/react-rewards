import type { Call, FakeCanvas, FakeCanvases, FakeContext } from './types';

/**
 * A 2D context that records every method call and property write, for
 * asserting what the code under test drew. Reads return the last write.
 */
export const createFakeContext = (): FakeContext => {
  const calls: Call[] = [];
  const state: Record<string | symbol, unknown> = {};
  const ctx = new Proxy(
    {},
    {
      get: (_, prop) =>
        prop in state
          ? state[prop]
          : (...args: unknown[]) => calls.push([String(prop), ...args]),
      set: (_, prop, value) => {
        state[prop] = value;
        calls.push([`${String(prop)}=`, value]);
        return true;
      },
    }
  ) as CanvasRenderingContext2D;
  return { ctx, calls };
};

/** A canvas factory whose canvases have recording contexts. */
export const createFakeCanvases = (): FakeCanvases => {
  const canvases: FakeCanvas[] = [];
  const createCanvas = (width: number, height: number) => {
    const { ctx, calls } = createFakeContext();
    const canvas = { width, height, ctx, calls, getContext: () => ctx };
    canvases.push(canvas);
    return canvas as unknown as HTMLCanvasElement;
  };
  return { canvases, createCanvas };
};
