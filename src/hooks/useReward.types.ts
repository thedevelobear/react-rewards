import { ConfettiConfig } from '../components/Confetti/Confetti.types';
import { EmojiConfig } from '../components/Emoji/Emoji.types';
import { BalloonsConfig } from '../components/Balloons/Balloons.types';
import { FireworksConfig } from '../components/Fireworks/Fireworks.types';

export interface RewardConfigs {
  confetti: ConfettiConfig;
  emoji: EmojiConfig;
  balloons: BalloonsConfig;
  fireworks: FireworksConfig;
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
