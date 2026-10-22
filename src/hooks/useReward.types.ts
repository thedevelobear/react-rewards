import type { BalloonsConfig } from '../components/Balloons/Balloons.types';
import type { ConfettiConfig } from '../components/Confetti/Confetti.types';
import type { EmojiConfig } from '../components/Emoji/Emoji.types';

export interface RewardConfigs {
  confetti: ConfettiConfig;
  emoji: EmojiConfig;
  balloons: BalloonsConfig;
}

export type RewardType = keyof RewardConfigs;

export type RewardFunction = {
  reward: () => void;
  isAnimating: boolean;
};

export type UseRewardType = <T extends RewardType>(
  id: string,
  type: T,
  config?: RewardConfigs[T]
) => RewardFunction;
