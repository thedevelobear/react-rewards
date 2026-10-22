import { createRenderer as createDefaultRenderer } from './select';
import type { Renderer } from './types';

/** How long the overlay stays ready after its last burst, in milliseconds. */
export const IDLE_TIMEOUT = 5000;

export interface OverlayOptions {
  /**
   * Creates a renderer on canvases from `createCanvas`, which calls `onLost`
   * if its context is lost. Defaults to the `'auto'` choice.
   */
  readonly createRenderer?: (
    createCanvas: () => HTMLCanvasElement,
    onLost: () => void
  ) => Renderer | undefined;
  /** Milliseconds before an unused overlay is removed. */
  readonly idleTimeout?: number;
  /** Called after an unused overlay has been removed with its renderer. */
  readonly onUnmount?: () => void;
}

/** One burst's claim on the overlay. */
export interface OverlayLease {
  readonly renderer: Renderer;
  /** Ends the claim. The last one to end hides the overlay. */
  release(): void;
}

export interface Overlay {
  /**
   * Claims the overlay for one burst. Shows the canvas, creating it and its
   * renderer on first use, at the highest `zIndex` among current claims.
   * Returns undefined, and adds nothing to the page, when no renderer is
   * available. If the renderer's context is lost, every claim ends and its
   * `onLost` is called (ADR 0036).
   */
  acquire(zIndex: number, onLost?: () => void): OverlayLease | undefined;
}

interface Claim {
  readonly zIndex: number;
  readonly onLost: (() => void) | undefined;
}

const STYLE =
  'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;';

const createDefaultCanvas = (): HTMLCanvasElement =>
  document.createElement('canvas');

/**
 * Creates the page's particle overlay: one fixed, full-viewport canvas on
 * `document.body`, shared by every burst. It is hidden and cleared when no
 * burst holds it, and removed with its renderer after `idleTimeout`, so an
 * idle page pays nothing. Nothing touches the DOM until the first `acquire`.
 */
export const createOverlay = (options: OverlayOptions = {}): Overlay => {
  const {
    createRenderer = (createCanvas, onLost) =>
      createDefaultRenderer('auto', createCanvas, onLost),
    idleTimeout = IDLE_TIMEOUT,
    onUnmount,
  } = options;
  const leases = new Set<Claim>();
  let canvas: HTMLCanvasElement | undefined;
  let renderer: Renderer | undefined;
  let observer: ResizeObserver | undefined;
  let idleTimer: ReturnType<typeof setTimeout> | undefined;
  let size = '';

  /** Matches the renderer to the canvas's CSS size and the pixel ratio. */
  const resize = (): void => {
    if (!canvas || !renderer) return;
    const { width, height } = canvas.getBoundingClientRect();
    // A hidden canvas measures 0 x 0. Keep the buffer until it shows again.
    if (width === 0 || height === 0) return;
    const dpr = window.devicePixelRatio || 1;
    const next = `${width}x${height}@${dpr}`;
    if (next === size) return;
    size = next;
    renderer.resize(width, height, dpr);
  };

  const mount = (): Renderer | undefined => {
    const created = createRenderer(createDefaultCanvas, () => {
      // A renderer that was already removed has nothing left to end.
      if (renderer === created) lose();
    });
    if (!created) return undefined;
    const element = created.canvas;
    element.setAttribute('aria-hidden', 'true');
    element.style.cssText = STYLE;
    document.body.appendChild(element);
    canvas = element;
    renderer = created;
    if (typeof ResizeObserver === 'function') {
      observer = new ResizeObserver(resize);
      observer.observe(element);
    }
    return created;
  };

  const unmount = (): void => {
    idleTimer = undefined;
    observer?.disconnect();
    renderer?.dispose();
    canvas?.remove();
    observer = undefined;
    renderer = undefined;
    canvas = undefined;
    size = '';
    onUnmount?.();
  };

  /**
   * Ends every claim and removes the canvas at once, so the next burst
   * starts on a fresh one (ADR 0036).
   */
  const lose = (): void => {
    const lost = [...leases];
    leases.clear();
    clearTimeout(idleTimer);
    unmount();
    for (const lease of lost) lease.onLost?.();
  };

  const highestZ = (): number =>
    Math.max(...[...leases].map((lease) => lease.zIndex));

  const release = (lease: Claim): void => {
    if (!leases.delete(lease) || !canvas) return;
    if (leases.size > 0) {
      canvas.style.zIndex = String(highestZ());
      return;
    }
    renderer?.clear();
    canvas.style.display = 'none';
    idleTimer = setTimeout(unmount, idleTimeout);
  };

  return {
    acquire: (zIndex, onLost) => {
      clearTimeout(idleTimer);
      idleTimer = undefined;
      const current = renderer ?? mount();
      if (!current || !canvas) return undefined;
      const lease: Claim = { zIndex, onLost };
      leases.add(lease);
      canvas.style.display = '';
      canvas.style.zIndex = String(highestZ());
      // Measure now, so the first frame isn't drawn into a stale buffer.
      resize();
      return { renderer: current, release: () => release(lease) };
    },
  };
};
