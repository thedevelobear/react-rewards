import { useLayoutEffect, useState } from 'react';
import { confetti } from '../components/Confetti/Confetti';
import { emoji } from '../components/Emoji/Emoji';
import { balloons } from '../components/Balloons/Balloons';
import { UseRewardType } from './useReward.types';

export const useReward: UseRewardType = (id, type, config) => {
  const [container, setContainer] = useState<Element>();
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const elementNotFoundMessage = `Element with an ID of ${id} could not be found. Please provide a valid ID.`;
  const typeNotFoundMessage = `${type} is not a valid react-rewards type.`;

  useLayoutEffect(() => {
    const foundContainer = document.getElementById(id);
    if (foundContainer) {
      setContainer(foundContainer);
    } else {
      console.error(elementNotFoundMessage);
    }
  }, [id, elementNotFoundMessage]);

  if (!container) {
    return {
      reward: () => {
        console.error(elementNotFoundMessage);
      },
      isAnimating: false,
    };
  }

  const internalAnimatingCallback = () => {
    setIsAnimating(false);
  };

  let reward;
  switch (type) {
    case 'confetti': {
      reward = () => {
        setIsAnimating(true);
        confetti(container, config);
        setIsAnimating(false);
      };
      break;
    }
    case 'emoji': {
      reward = () => {
        setIsAnimating(true);
        emoji(container, internalAnimatingCallback, config);
      };
      break;
    }
    case 'balloons': {
      reward = () => {
        setIsAnimating(true);
        balloons(container, internalAnimatingCallback, config);
      };
      break;
    }
    default: {
      reward = () => console.error(typeNotFoundMessage);
    }
  }
  return { reward, isAnimating };
};
