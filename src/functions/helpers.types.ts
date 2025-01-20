import { Particle, Particles } from '../Main.types';

export type AnimateFunctionArgs = {
  root: Element;
  particles: Particles;
  decay: number;
  rotate?: boolean;
  lifetime: number;
  fps: number;
  updateParticle: (
    particle: Particle,
    progress: number,
    decay: number,
    rotate?: boolean
  ) => void;
  onFinish: () => void;
};

export type AnimateFunction = (config: AnimateFunctionArgs) => void;
