import { createRenderer as createDefaultRenderer } from './select';
import type { Renderer } from './types';

/** How long the overlay stays ready after its last burst, in milliseconds. */
export const IDLE_TIMEOUT = 5000;

export interface OverlayOptions {
  /** Creates the renderer for a new canvas. */
  readonly createRenderer?: (canvas: HTMLCanvasElement) => Renderer | undefined;
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
   * available.
   */
  acquire(zIndex: number): OverlayLease | undefined;
}

const STYLE =
  'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;';

/**
 * Creates the page's particle overlay: one fixed, full-viewport canvas on
 * `document.body`, shared by every burst. It is hidden and cleared when no
 * burst holds it, and removed with its renderer after `idleTimeout`, so an
 * idle page pays nothing. Nothing touches the DOM until the first `acquire`.
 */
export const createOverlay = (options: OverlayOptions = {}): Overlay => {
  const {
    createRenderer = createDefaultRenderer,
    idleTimeout = IDLE_TIMEOUT,
    onUnmount,
  } = options;
  const leases = new Set<{ zIndex: number }>();
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
    const element = document.createElement('canvas');
    element.setAttribute('aria-hidden', 'true');
    element.style.cssText = STYLE;
    const created = createRenderer(element);
    if (!created) return undefined;
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

  const highestZ = (): number =>
    Math.max(...[...leases].map((lease) => lease.zIndex));

  const release = (lease: { zIndex: number }): void => {
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
    acquire: (zIndex) => {
      clearTimeout(idleTimer);
      idleTimer = undefined;
      const current = renderer ?? mount();
      if (!current || !canvas) return undefined;
      const lease = { zIndex };
      leases.add(lease);
      canvas.style.display = '';
      canvas.style.zIndex = String(highestZ());
      // Measure now, so the first frame isn't drawn into a stale buffer.
      resize();
      return { renderer: current, release: () => release(lease) };
    },
  };
};
