import type { Call, FakeWebgl, FakeWebglOptions, Size } from './types';

/** Copies typed arrays, so a recorded upload keeps what was uploaded. */
const snapshot = (value: unknown): unknown =>
  value instanceof Float32Array ? Array.from(value) : value;

/**
 * A WebGL2 context that records every method call, for asserting what the
 * code under test drew. Constants read back as their names, so a call reads
 * like `['bindBuffer', 'ARRAY_BUFFER', buffer]`. `create*` methods return
 * named objects, and status queries succeed unless `link` is false.
 */
export const createFakeWebgl = (
  canvas: Size,
  options: FakeWebglOptions = {}
): FakeWebgl => {
  const calls: Call[] = [];
  const created = new Map<string, number>();
  const record =
    (name: string) =>
    (...args: unknown[]): void => {
      calls.push([name, ...args.map(snapshot)]);
    };
  const methods: Record<string, (...args: unknown[]) => unknown> = {
    getProgramParameter: () => options.link ?? true,
    getProgramInfoLog: () => 'link failed',
    getShaderParameter: () => true,
    getUniformLocation: (_program, name) => name,
    getExtension: (name) =>
      name === 'WEBGL_lose_context'
        ? { loseContext: record('loseContext') }
        : null,
    isContextLost: () => false,
  };
  const gl = new Proxy(
    {},
    {
      get: (_, prop) => {
        const name = String(prop);
        if (name === 'drawingBufferWidth') return canvas.width;
        if (name === 'drawingBufferHeight') return canvas.height;
        if (/^[A-Z][A-Z0-9_]*$/.test(name)) return name;
        const method = methods[name];
        if (method) return method;
        if (!name.startsWith('create')) return record(name);
        return (...args: unknown[]) => {
          const n = (created.get(name) ?? 0) + 1;
          created.set(name, n);
          calls.push([name, ...args]);
          return { id: `${name.slice('create'.length)}${n}` };
        };
      },
    }
  ) as WebGL2RenderingContext;
  return { gl, calls };
};
