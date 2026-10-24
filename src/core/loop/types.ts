/** Schedules a callback for the next frame. */
export interface FrameScheduler {
  request(callback: (time: number) => void): number;
  cancel(handle: number): void;
}

/** Called once per frame with the seconds since the previous frame. */
export type FrameCallback = (dt: number) => void;

export interface Loop {
  /** Calls `callback` every frame until the returned function is called. */
  add(callback: FrameCallback): () => void;
  /** Whether a frame is scheduled. */
  readonly running: boolean;
}
