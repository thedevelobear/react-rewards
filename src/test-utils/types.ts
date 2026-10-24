import type { FrameScheduler } from '@/core/loop';

/** One recorded call: the method name, or `prop=` for a write, then args. */
export type Call = [name: string, ...args: unknown[]];

/** A recording 2D context, and what it recorded. */
export interface FakeContext {
  ctx: CanvasRenderingContext2D;
  calls: Call[];
}

export interface FakeCanvas {
  width: number;
  height: number;
  readonly ctx: CanvasRenderingContext2D;
  readonly calls: Call[];
}

/** The canvases made so far, and the factory that makes them. */
export interface FakeCanvases {
  canvases: FakeCanvas[];
  createCanvas: (width: number, height: number) => HTMLCanvasElement;
}

export interface FakeScheduler {
  scheduler: FrameScheduler;
  /** Whether a frame is waiting for `tick`. */
  readonly pending: boolean;
  tick: (time: number) => void;
}

/** A width and height, such as a canvas's. */
export interface Size {
  width: number;
  height: number;
}

export interface FakeWebglOptions {
  /** Whether programs link. Defaults to true. */
  link?: boolean;
}

/** A recording WebGL2 context, and what it recorded. */
export interface FakeWebgl {
  gl: WebGL2RenderingContext;
  calls: Call[];
}
