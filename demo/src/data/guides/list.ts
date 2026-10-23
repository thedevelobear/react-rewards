import type { Guide } from './types';

/** The home page, shown for an empty or unknown hash (README, "Routing"). */
export const gettingStarted: Guide = {
  name: 'getting-started',
  label: 'Getting started',
  description: 'Install react-rewards and fire your first reward.',
};

/** The engine's headroom (README, "Stress test"). */
export const stressTest: Guide = {
  name: 'stress-test',
  label: 'Stress test',
  description: 'Fire thousands of particles and watch the frame rate.',
};

/** The guides in sidebar order. */
export const guides: readonly Guide[] = [gettingStarted, stressTest];

/** The guide for `name`, if there is one (README, "Routing"). */
export const findGuide = (name: string): Guide | undefined =>
  guides.find((guide) => guide.name === name);
