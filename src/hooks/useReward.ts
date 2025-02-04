import { useCallback, useState } from 'react';
import { confetti } from '../components/Confetti/Confetti';
import { emoji } from '../components/Emoji/Emoji';
import { balloons } from '../components/Balloons/Balloons';
import { fireworks } from '../components/Fireworks/Fireworks';
import { UseRewardType } from './useReward.types';
import { getContainerById } from '../functions/helpers';

export const useReward: UseRewardType = (id, type, config) => {
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const internalAnimatingCallback = () => {
    setIsAnimating(false);
  };

  const reward = useCallback(() => {
    const foundContainer = getContainerById(id);
    if (!foundContainer) return;
    setIsAnimating(true);
    switch (type) {
      case 'confetti':
        confetti(foundContainer, internalAnimatingCallback, config);
        break;
      case 'emoji':
        emoji(foundContainer, internalAnimatingCallback, config);
        break;
      case 'balloons':
        balloons(foundContainer, internalAnimatingCallback, config);
        break;
      case 'fireworks':
        fireworks(foundContainer, internalAnimatingCallback, config);
        break;
      default:
        console.error(`${type} is not a valid react-rewards type.`);
    }
  }, [config, id, type]);

  return { reward, isAnimating };
};
