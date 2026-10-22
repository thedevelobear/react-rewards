import type { Renderer } from '@/core/renderer';
import { createInstances, INSTANCE_FLOATS } from './instance';
import { createProgram } from './shader';

/** Bytes per particle in the instance buffer. */
const STRIDE = INSTANCE_FLOATS * 4;

/** Each instance attribute: its location, size and offset in floats. */
const ATTRIBUTES = [
  [0, 3, 0],
  [1, 4, 3],
  [2, 4, 7],
] as const;

/**
 * The context to ask for. Compositing expects premultiplied alpha. A sprite
 * overlay needs no depth, stencil or multisampling, and no preserved buffer,
 * because every frame is drawn from scratch.
 */
export const CONTEXT_ATTRIBUTES: WebGLContextAttributes = {
  alpha: true,
  premultipliedAlpha: true,
  antialias: false,
  depth: false,
  stencil: false,
  preserveDrawingBuffer: false,
};

/**
 * The WebGL2 renderer. It draws every particle as an instanced quad from
 * the atlas texture, with one draw call per run of neighbouring batches
 * that share a blend mode (ADR 0034), and re-uploads the atlas whenever its
 * version changes. Throws if the sprite program can't be built.
 *
 * `onLost` is called once if the context is lost. The renderer then draws
 * nothing, and is expected to be disposed and replaced (ADR 0036).
 */
export const createWebglRenderer = (
  canvas: HTMLCanvasElement,
  gl: WebGL2RenderingContext,
  onLost?: () => void
): Renderer => {
  const program = createProgram(gl);
  const view = gl.getUniformLocation(program, 'u_view');
  const texel = gl.getUniformLocation(program, 'u_texel');
  const vao = gl.createVertexArray();
  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  const instances = createInstances();
  let dpr = 1;
  let uploaded = -1;
  let lost = false;

  // Nothing else uses this context, so its state is set once, here.
  gl.useProgram(program);
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  for (const [location] of ATTRIBUTES) {
    gl.enableVertexAttribArray(location);
    gl.vertexAttribDivisor(location, 1);
  }
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.enable(gl.BLEND);
  gl.clearColor(0, 0, 0, 0);

  const handleLost = (): void => {
    lost = true;
    onLost?.();
  };
  canvas.addEventListener('webglcontextlost', handleLost);

  /** Points the instance attributes at the run starting at `start`. */
  const point = (start: number): void => {
    for (const [location, size, offset] of ATTRIBUTES) {
      gl.vertexAttribPointer(
        location,
        size,
        gl.FLOAT,
        false,
        STRIDE,
        start * STRIDE + offset * 4
      );
    }
  };

  const clear = (): void => {
    gl.clear(gl.COLOR_BUFFER_BIT);
  };

  return {
    kind: 'webgl',
    resize: (width, height, ratio) => {
      dpr = ratio;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    },
    draw: ({ atlas, batches }) => {
      if (lost) return;
      clear();
      instances.write(batches);
      if (instances.count === 0) return;
      if (atlas.version !== uploaded) {
        const image = atlas.canvas;
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          image
        );
        gl.uniform2f(texel, 1 / image.width, 1 / image.height);
        uploaded = atlas.version;
      }
      // From CSS pixels to clip space, with y pointing down.
      gl.uniform2f(view, (2 * dpr) / canvas.width, (-2 * dpr) / canvas.height);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        instances.data,
        gl.DYNAMIC_DRAW,
        0,
        instances.count * INSTANCE_FLOATS
      );
      for (const run of instances.runs) {
        if (run.blend === 'additive') gl.blendFunc(gl.ONE, gl.ONE);
        else gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        point(run.start);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, run.count);
      }
    },
    clear: () => {
      if (!lost) clear();
    },
    dispose: () => {
      canvas.removeEventListener('webglcontextlost', handleLost);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(texture);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
      // Browsers cap live contexts, so give this one back now rather than
      // at garbage collection.
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.width = 0;
      canvas.height = 0;
    },
  };
};
