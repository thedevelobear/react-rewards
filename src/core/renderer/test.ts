import { describe, expect, it } from '@rstest/core';
import { createRenderer, type RendererPreference } from '@/core/renderer';
import { type Call, createFakeContext, createFakeWebgl } from '@/test-utils';

interface Support {
  /** `'broken'` gives a context whose sprite program won't link. */
  readonly webgl2?: 'ok' | 'broken';
  readonly '2d'?: boolean;
}

/** Canvases that give out the contexts in `support`, recording each request. */
const setup = (support: Support) => {
  const canvases: HTMLCanvasElement[] = [];
  const requests: string[][] = [];
  const glCalls: Call[][] = [];
  const createCanvas = () => {
    const asked: string[] = [];
    requests.push(asked);
    const canvas = Object.assign(new EventTarget(), {
      width: 0,
      height: 0,
      getContext: (type: string) => {
        asked.push(type);
        if (type === 'webgl2' && support.webgl2) {
          const fake = createFakeWebgl(canvas, {
            link: support.webgl2 === 'ok',
          });
          glCalls.push(fake.calls);
          return fake.gl;
        }
        if (type === '2d' && support['2d']) return createFakeContext().ctx;
        return null;
      },
    }) as unknown as HTMLCanvasElement;
    canvases.push(canvas);
    return canvas;
  };
  return {
    canvases,
    requests,
    glCalls,
    create: (preference: RendererPreference, onLost?: () => void) =>
      createRenderer(preference, createCanvas, onLost),
  };
};

describe('createRenderer', () => {
  it("prefers WebGL2 under 'auto'", () => {
    const { canvases, requests, create } = setup({ webgl2: 'ok', '2d': true });
    const renderer = create('auto');
    expect(renderer?.kind).toBe('webgl');
    expect(renderer?.canvas).toBe(canvases[0]);
    expect(requests).toEqual([['webgl2']]);
  });

  it("falls back to Canvas 2D on a fresh canvas under 'auto'", () => {
    const { canvases, requests, create } = setup({ '2d': true });
    const renderer = create('auto');
    expect(renderer?.kind).toBe('canvas');
    expect(renderer?.canvas).toBe(canvases[1]);
    expect(requests).toEqual([['webgl2'], ['2d']]);
  });

  it('falls back when WebGL2 works but the renderer fails, and frees it', () => {
    const { requests, glCalls, create } = setup({
      webgl2: 'broken',
      '2d': true,
    });
    expect(create('auto')?.kind).toBe('canvas');
    expect(requests).toEqual([['webgl2'], ['2d']]);
    expect(glCalls[0]?.at(-1)).toEqual(['loseContext']);
  });

  it('never falls back from a forced renderer (ADR 0033)', () => {
    const { requests, create } = setup({ '2d': true });
    expect(create('webgl')).toBeUndefined();
    expect(requests).toEqual([['webgl2']]);
  });

  it("asks only for Canvas 2D when 'canvas' is forced", () => {
    const { requests, create } = setup({ webgl2: 'ok', '2d': true });
    expect(create('canvas')?.kind).toBe('canvas');
    expect(requests).toEqual([['2d']]);
  });

  it('returns undefined when no renderer is available', () => {
    const { create } = setup({});
    expect(create('auto')).toBeUndefined();
  });

  it('passes onLost to the WebGL2 renderer', () => {
    let lost = 0;
    const { canvases, create } = setup({ webgl2: 'ok' });
    create('auto', () => {
      lost += 1;
    });
    canvases[0]?.dispatchEvent(new Event('webglcontextlost'));
    expect(lost).toBe(1);
  });
});
