import { Particle, Particles } from '../Main.types';

export type AnimateFunctionArgs = {
  root: Element;
  particles: Particles;
  decay: number;
  lifetime: number;
  updateParticle: (particle: Particle, progress: number, decay: number) => void;
  onFinish: () => void;
};

export type AnimateFunction = (config: AnimateFunctionArgs) => void;
