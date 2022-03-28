import { useState } from 'react';
import { confetti } from '../components/Confetti/Confetti';
import { emoji } from '../components/Emoji/Emoji';
import { balloons } from '../components/Balloons/Balloons';
import { UseRewardType } from './useReward.types';
import { getContainerById } from '../functions/helpers';

export const useReward: UseRewardType = (id, type, config) => {
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const internalAnimatingCallback = () => {
    setIsAnimating(false);
  };

  let reward;
  switch (type) {
    case 'confetti': {
      reward = () => {
        const foundContainer = getContainerById(id);

        if (!foundContainer) return;

        setIsAnimating(true);
        confetti(foundContainer, internalAnimatingCallback, config);
      };
      break;
    }
    case 'emoji': {
      reward = () => {
        const foundContainer = getContainerById(id);

        if (!foundContainer) return;

        setIsAnimating(true);
        emoji(foundContainer, internalAnimatingCallback, config);
      };
      break;
    }
    case 'balloons': {
      reward = () => {
        const foundContainer = getContainerById(id);

        if (!foundContainer) return;

        setIsAnimating(true);
        balloons(foundContainer, internalAnimatingCallback, config);
      };
      break;
    }
    default: {
      reward = () =>
        console.error(`${type} is not a valid react-rewards type.`);
    }
  }
  return { reward, isAnimating };
};
