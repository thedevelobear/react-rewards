export type ParticlePhysics = {
  x: number;
  y: number;
  z: number;
  wobble: number;
  velocity: number;
  angle2D: number;
  angle3D: number;
  tiltAngle: number;
  differentiator: number;
};

export interface Particle {
  element: HTMLSpanElement;
  physics: ParticlePhysics;
}

export type Particles = Particle[];
