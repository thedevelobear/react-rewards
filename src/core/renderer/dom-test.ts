import { afterEach, beforeEach, describe, expect, it, rs } from '@rstest/core';
import {
  createOverlay,
  createRenderer,
  IDLE_TIMEOUT,
  type Renderer,
} from '@/core/renderer';
import { createFakeContext } from '@/test-utils';

const createFakeRenderer = () => {
  const calls: unknown[][] = [];
  const renderer: Renderer = {
    kind: 'canvas',
    resize: (...args) => calls.push(['resize', ...args]),
    draw: () => calls.push(['draw']),
    clear: () => calls.push(['clear']),
    dispose: () => calls.push(['dispose']),
  };
  return { renderer, calls };
};

class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  readonly observed: Element[] = [];
  disconnected = false;
  readonly callback: () => void;

  constructor(callback: () => void) {
    this.callback = callback;
    FakeResizeObserver.instances.push(this);
  }

  observe(element: Element): void {
    this.observed.push(element);
  }

  unobserve(): void {}

  disconnect(): void {
    this.disconnected = true;
  }
}

let rect = { width: 800, height: 600 };
const dprDescriptor = Object.getOwnPropertyDescriptor(
  window,
  'devicePixelRatio'
);

beforeEach(() => {
  rs.useFakeTimers();
  rect = { width: 800, height: 600 };
  rs.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    () => ({ x: 0, y: 0, top: 0, left: 0, ...rect }) as DOMRect
  );
  Object.defineProperty(window, 'devicePixelRatio', {
    value: 2,
    configurable: true,
  });
  FakeResizeObserver.instances = [];
  rs.stubGlobal('ResizeObserver', FakeResizeObserver);
});

afterEach(() => {
  rs.useRealTimers();
  rs.restoreAllMocks();
  rs.unstubAllGlobals();
  if (dprDescriptor) {
    Object.defineProperty(window, 'devicePixelRatio', dprDescriptor);
  }
  document.body.innerHTML = '';
});

const setup = () => {
  const fake = createFakeRenderer();
  let created = 0;
  const overlay = createOverlay({
    createRenderer: () => {
      created += 1;
      return fake.renderer;
    },
  });
  return {
    overlay,
    calls: fake.calls,
    renderer: fake.renderer,
    created: () => created,
    canvases: () => [...document.querySelectorAll('canvas')],
  };
};

describe('createOverlay', () => {
  it('adds nothing to the page until the first acquire', () => {
    const { canvases } = setup();
    expect(canvases()).toHaveLength(0);
  });

  it('mounts one fixed, click-through, aria-hidden canvas on body', () => {
    const { overlay, calls, renderer, canvases } = setup();
    const lease = overlay.acquire(10);
    expect(lease?.renderer).toBe(renderer);

    const [canvas] = canvases();
    expect(canvas?.parentElement).toBe(document.body);
    expect(canvas?.getAttribute('aria-hidden')).toBe('true');
    expect(canvas?.style.position).toBe('fixed');
    expect(canvas?.style.pointerEvents).toBe('none');
    expect(canvas?.style.zIndex).toBe('10');
    expect(calls).toEqual([['resize', 800, 600, 2]]);
    expect(FakeResizeObserver.instances[0]?.observed).toEqual([canvas]);
  });

  it('shares one canvas between bursts, at the highest zIndex', () => {
    const { overlay, created, canvases } = setup();
    const low = overlay.acquire(5);
    const high = overlay.acquire(20);
    expect(created()).toBe(1);
    expect(canvases()).toHaveLength(1);
    expect(canvases()[0]?.style.zIndex).toBe('20');

    high?.release();
    expect(canvases()[0]?.style.zIndex).toBe('5');
    expect(canvases()[0]?.style.display).toBe('');
    low?.release();
  });

  it('hides when the last burst ends, and is removed after the timeout', () => {
    const { overlay, calls, canvases } = setup();
    overlay.acquire(0)?.release();
    const [canvas] = canvases();
    expect(canvas?.style.display).toBe('none');
    expect(calls.at(-1)).toEqual(['clear']);

    rs.advanceTimersByTime(IDLE_TIMEOUT - 1);
    expect(canvases()).toHaveLength(1);
    rs.advanceTimersByTime(1);
    expect(canvases()).toHaveLength(0);
    expect(calls.at(-1)).toEqual(['dispose']);
    expect(FakeResizeObserver.instances[0]?.disconnected).toBe(true);
  });

  it('reuses the canvas when a burst starts before the timeout', () => {
    const { overlay, created, canvases } = setup();
    overlay.acquire(0)?.release();
    const [canvas] = canvases();
    rs.advanceTimersByTime(IDLE_TIMEOUT / 2);

    const lease = overlay.acquire(0);
    expect(canvases()).toEqual([canvas]);
    expect(canvas?.style.display).toBe('');
    rs.advanceTimersByTime(IDLE_TIMEOUT * 2);
    expect(canvases()).toEqual([canvas]);
    expect(created()).toBe(1);
    lease?.release();
  });

  it('mounts a fresh canvas and renderer after it was removed', () => {
    const { overlay, created, canvases } = setup();
    overlay.acquire(0)?.release();
    rs.advanceTimersByTime(IDLE_TIMEOUT);
    overlay.acquire(0);
    expect(created()).toBe(2);
    expect(canvases()).toHaveLength(1);
  });

  it('ignores a second release of the same lease', () => {
    const { overlay, canvases } = setup();
    const first = overlay.acquire(0);
    overlay.acquire(0);
    first?.release();
    first?.release();
    expect(canvases()[0]?.style.display).toBe('');
  });

  it('resizes when observed, but not while hidden or when unchanged', () => {
    const { overlay, calls } = setup();
    overlay.acquire(0);
    const observer = FakeResizeObserver.instances[0];

    rect = { width: 1024, height: 768 };
    observer?.callback();
    observer?.callback();
    rect = { width: 0, height: 0 };
    observer?.callback();
    expect(calls.filter(([name]) => name === 'resize')).toEqual([
      ['resize', 800, 600, 2],
      ['resize', 1024, 768, 2],
    ]);
  });

  it('picks up a new pixel ratio on the next acquire', () => {
    const { overlay, calls } = setup();
    overlay.acquire(0)?.release();
    Object.defineProperty(window, 'devicePixelRatio', {
      value: 3,
      configurable: true,
    });
    overlay.acquire(0);
    expect(calls.filter(([name]) => name === 'resize').at(-1)).toEqual([
      'resize',
      800,
      600,
      3,
    ]);
  });

  it('works without ResizeObserver', () => {
    rs.stubGlobal('ResizeObserver', undefined);
    const { overlay, canvases } = setup();
    expect(overlay.acquire(0)).toBeDefined();
    expect(canvases()).toHaveLength(1);
  });

  it('adds nothing and returns undefined when no renderer is available', () => {
    const overlay = createOverlay({ createRenderer: () => undefined });
    expect(overlay.acquire(0)).toBeUndefined();
    expect(document.querySelectorAll('canvas')).toHaveLength(0);
  });
});

describe('createRenderer', () => {
  it('returns undefined when the canvas has no 2D context', () => {
    const canvas = document.createElement('canvas');
    expect(createRenderer(canvas)).toBeUndefined();
  });

  it('returns the Canvas 2D renderer when it has one', () => {
    const canvas = document.createElement('canvas');
    const { ctx } = createFakeContext();
    rs.spyOn(canvas, 'getContext').mockReturnValue(ctx as never);
    expect(createRenderer(canvas)?.kind).toBe('canvas');
  });
});
