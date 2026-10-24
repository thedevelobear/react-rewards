import { CustomEffectsArticle } from '@/articles/custom-effects';
import { FireArticle } from '@/articles/fire';
import { GettingStartedArticle } from '@/articles/getting-started';
import { RenderersArticle } from '@/articles/renderers';
import { ServerRenderingArticle } from '@/articles/server-rendering';
import { StressTestArticle } from '@/articles/stress-test';
import { UpgradingArticle } from '@/articles/upgrading-from-v2';
import { UseRewardArticle } from '@/articles/use-reward';
import type { Article } from './types';

/** The home page, shown for an empty or unknown hash (README, "Routing"). */
export const gettingStarted: Article = {
  name: 'getting-started',
  label: 'Getting started',
  description:
    'Install react-rewards and fire your first reward. Three steps: add the package, wire up the hook, pick an effect.',
  icon: 'flag',
  content: GettingStartedArticle,
};

/** The guides in sidebar order. */
export const guides: readonly Article[] = [
  gettingStarted,
  {
    name: 'custom-effects',
    label: 'Custom effects',
    description:
      'Make an effect of your own with defineEffect, and fire it like the built-in ones.',
    icon: 'wand',
    content: CustomEffectsArticle,
  },
  {
    name: 'server-rendering',
    label: 'Server rendering',
    description:
      'Import react-rewards on the server, and fire rewards from Client Components.',
    icon: 'server',
    content: ServerRenderingArticle,
  },
  {
    name: 'upgrading-from-v2',
    label: 'Upgrading from v2',
    description: 'What changed in v3, and what each v2 option became.',
    icon: 'upgrade',
    content: UpgradingArticle,
  },
  // The engine's headroom (README, "Stress test").
  {
    name: 'stress-test',
    label: 'Stress test',
    description: 'Fire thousands of particles and watch the frame rate.',
    icon: 'bolt',
    content: StressTestArticle,
  },
];

/** The API's pages in sidebar order. */
export const api: readonly Article[] = [
  {
    name: 'use-reward',
    label: 'useReward',
    description:
      'The hook: its arguments, the settings and burst options it takes, and what it returns.',
    icon: 'code',
    content: UseRewardArticle,
  },
  {
    name: 'fire',
    label: 'fire',
    description:
      'Play an effect without React, from a point, an element or a ref.',
    icon: 'flame',
    content: FireArticle,
  },
  {
    name: 'renderers',
    label: 'Renderers',
    description:
      'Bursts are drawn with WebGL2, or Canvas 2D where it is missing. setRenderer picks one.',
    icon: 'layers',
    content: RenderersArticle,
  },
];

/** The article for `name`, if there is one (README, "Routing"). */
export const findArticle = (name: string): Article | undefined =>
  [...guides, ...api].find((article) => article.name === name);
