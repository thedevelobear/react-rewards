import { useCallback, useState } from 'react';
import { balloons } from '../components/Balloons/Balloons';
import { confetti } from '../components/Confetti/Confetti';
import { emoji } from '../components/Emoji/Emoji';
import { getContainerById } from '../functions/helpers';
import type { UseRewardType } from './useReward.types';

export const useReward: UseRewardType = (id, type, config) => {
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const reward = useCallback(() => {
    const internalAnimatingCallback = () => {
      setIsAnimating(false);
    };
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
      default:
        console.error(`${type} is not a valid react-rewards type.`);
    }
  }, [config, id, type]);

  return { reward, isAnimating };
};
