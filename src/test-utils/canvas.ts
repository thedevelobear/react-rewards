/** One recorded call: the method name, or `prop=` for a write, then args. */
export type Call = [name: string, ...args: unknown[]];

/**
 * A 2D context that records every method call and property write, for
 * asserting what the code under test drew. Reads return the last write.
 */
export const createFakeContext = (): {
  ctx: CanvasRenderingContext2D;
  calls: Call[];
} => {
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

export interface FakeCanvas {
  width: number;
  height: number;
  readonly ctx: CanvasRenderingContext2D;
  readonly calls: Call[];
}

/** A canvas factory whose canvases have recording contexts. */
export const createFakeCanvases = (): {
  canvases: FakeCanvas[];
  createCanvas: (width: number, height: number) => HTMLCanvasElement;
} => {
  const canvases: FakeCanvas[] = [];
  const createCanvas = (width: number, height: number) => {
    const { ctx, calls } = createFakeContext();
    const canvas = { width, height, ctx, calls, getContext: () => ctx };
    canvases.push(canvas);
    return canvas as unknown as HTMLCanvasElement;
  };
  return { canvases, createCanvas };
};
