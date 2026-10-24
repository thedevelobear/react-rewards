/**
 * Places one particle's quad, from four vertices and the particle's
 * instance data (see `INSTANCE_FLOATS`). The quad is the sprite's atlas box
 * plus a one-texel margin of the atlas's transparent padding, so texture
 * filtering softens the sprite's edges without multisampling. That needs at
 * least two texels of padding between sprites, which the atlas has.
 */
export const VERTEX_SHADER = `#version 300 es
layout(location = 0) in vec3 a_center;
layout(location = 1) in vec4 a_axes;
layout(location = 2) in vec4 a_rect;
uniform vec2 u_view;
uniform vec2 u_texel;
out vec2 v_uv;
out float v_alpha;
const float MARGIN = 1.0;
void main() {
  vec2 corner = vec2(gl_VertexID & 1, gl_VertexID >> 1) * 2.0 - 1.0;
  vec2 offset = corner * (a_rect.zw * 0.5 + MARGIN);
  vec2 position = a_center.xy + mat2(a_axes) * offset;
  gl_Position = vec4(position * u_view + vec2(-1.0, 1.0), 0.0, 1.0);
  v_uv = (a_rect.xy + a_rect.zw * 0.5 + offset) * u_texel;
  v_alpha = a_center.z;
}
`;

/** Samples the atlas, whose texels are premultiplied, and applies alpha. */
export const FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform sampler2D u_atlas;
in vec2 v_uv;
in float v_alpha;
out vec4 color;
void main() {
  color = texture(u_atlas, v_uv) * v_alpha;
}
`;

const compile = (
  gl: WebGL2RenderingContext,
  type: GLenum,
  source: string
): WebGLShader => {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('WebGL could not create a shader.');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
};

/**
 * Compiles and links the sprite program. Throws if it doesn't link, for
 * example because the context was lost.
 */
export const createProgram = (gl: WebGL2RenderingContext): WebGLProgram => {
  const program = gl.createProgram();
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  // The program keeps what it needs, so the shaders can go.
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`The sprite program failed to link: ${log}`);
  }
  return program;
};
