import type { Guide } from './types';

/** The home page, shown for an empty or unknown hash (README, "Routing"). */
export const gettingStarted: Guide = {
  name: 'getting-started',
  label: 'Getting started',
  description:
    'Install react-rewards and fire your first reward. Three steps: add the package, wire up the hook, pick an effect.',
  icon: ['M5 21V4', 'M5 4h11l-2 4 2 4H5'],
};

/** The engine's headroom (README, "Stress test"). */
export const stressTest: Guide = {
  name: 'stress-test',
  label: 'Stress test',
  description: 'Fire thousands of particles and watch the frame rate.',
  icon: ['M13 2 4 14h7l-1 8 9-12h-7l1-8Z'],
};

/** The guides in sidebar order. */
export const guides: readonly Guide[] = [gettingStarted, stressTest];

/** The guide for `name`, if there is one (README, "Routing"). */
export const findGuide = (name: string): Guide | undefined =>
  guides.find((guide) => guide.name === name);
