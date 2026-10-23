import type { Guide } from './types';

/** The home page, shown for an empty or unknown hash (README, "Routing"). */
export const gettingStarted: Guide = {
  name: 'getting-started',
  label: 'Getting started',
  description: 'Install react-rewards and fire your first reward.',
};

/** The guides in sidebar order. */
export const guides: readonly Guide[] = [gettingStarted];
