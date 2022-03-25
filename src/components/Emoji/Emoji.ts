import { EmojiConfig } from './Emoji.types';
import {
  animate,
  generatePhysics,
  getRandomInt,
} from '../../functions/helpers';
import { Particle } from '../../Main.types';

const defaultEmoji = ['🤓', '😊', '🥳'];
const factors = [-0.6, -0.3, 0, 0.3, 0.6];

const createElements = (
  root: Element,
  elementCount: number,
  elementSize: number,
  zIndex: number,
  position: string,
  emojis: string[]
) =>
  Array.from({ length: elementCount }).map((_, index) => {
    const element = document.createElement('span');
    element.innerHTML = emojis[index % emojis.length];
    element.style.fontSize = `${elementSize + getRandomInt(0, 4)}px`;
    element.style.position = position;
    element.style.zIndex = `${zIndex}`;
    root.appendChild(element);
    return { element, differentiator: getRandomInt(0, factors.length) };
  });

const updateParticle = (
  particle: Particle,
  progress: number,
  decay: number
) => {
  const { x, y, tiltAngle, angle2D, velocity, differentiator, wobble } =
    particle.physics;

  particle.physics.x += Math.cos(angle2D) * velocity;
  particle.physics.y += Math.sin(angle2D) * velocity;
  particle.physics.wobble += 0;
  particle.physics.velocity *= decay;
  particle.physics.y += 5;
  particle.physics.tiltAngle += 0.05;

  const wobbleX =
    x +
    (factors[differentiator] * progress * wobble * wobble +
      20 * Math.sin(wobble / 4));

  particle.element.style.transform = `translate3d(${wobbleX}px, ${y}px, 0) rotate3d(0, 0, 1, ${
    differentiator % 2 ? tiltAngle : -1 * tiltAngle
  }rad)`;

  if (progress > 0.5) {
    particle.element.style.opacity = `${2 - 2 * progress}`;
  }
};

export const emoji = (
  root: Element,
  internalAnimatingCallback: () => void,
  config?: EmojiConfig
) => {
  const options = config || {};
  const {
    elementCount = 20,
    elementSize = 25,
    emoji: emojiArray = defaultEmoji,
    angle = 90,
    spread = 45,
    decay = 0.94,
    lifetime = 200,
    startVelocity = 35,
    zIndex = 0,
    position = 'fixed',
    onAnimationComplete,
  } = options;
  const spanElements = createElements(
    root,
    elementCount,
    elementSize,
    zIndex,
    position,
    emojiArray
  );
  const particles = spanElements.map(({ element, differentiator }) => ({
    element,
    physics: generatePhysics(angle, spread, startVelocity, differentiator),
  }));

  const onFinish = () => {
    if (typeof onAnimationComplete === 'function') {
      onAnimationComplete();
    }
    internalAnimatingCallback();
  };

  animate({
    root,
    particles,
    decay,
    lifetime,
    updateParticle,
    onFinish,
  });
};
