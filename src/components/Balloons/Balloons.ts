import { BalloonsConfig } from './Balloons.types';
import {
  animate,
  generatePhysics,
  getRandomInt,
} from '../../functions/helpers';
import { Particle } from '../../Main.types';
import balloon from './balloon.svg';

const defaultColors = ['#A45BF1', '#25C6F6', '#72F753', '#F76C88', '#F5F770'];
const factors = [-0.6, -0.3, 0, 0.3, 0.6];

const handlePopBalloon = (
  event: MouseEvent,
  element: Element,
  root: Element
) => {
  if (element.parentNode === root) {
    root.removeChild(element);
  }
};

const createElements = (
  root: Element,
  elementCount: number,
  elementSize: number,
  zIndex: number,
  position: string,
  colors: string[]
) =>
  Array.from({ length: elementCount }).map((_, index) => {
    const element = document.createElement('span');
    element.innerHTML = balloon;
    element.style.width = `${elementSize}px`;
    element.style.position = position;
    element.style.color = colors[index % colors.length];
    element.style.zIndex = `${zIndex}`;
    element.addEventListener(
      'click',
      (event: MouseEvent) => {
        handlePopBalloon(event, element, root);
      },
      { once: true }
    );
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

  particle.physics.x += Math.cos(angle2D) * 0.5 * velocity;
  particle.physics.y += Math.sin(angle2D) * 0.5 * velocity;
  particle.physics.wobble += 0;
  particle.physics.velocity *= decay;
  particle.physics.tiltAngle += 0.1;

  const wobbleX =
    x +
    (factors[differentiator] * progress * wobble * wobble +
      20 * Math.sin(wobble));

  particle.element.style.transform = `translate3d(${wobbleX}px, ${y}px, 0) rotate3d(0, 0, 1, ${
    differentiator % 2
      ? Math.sin(tiltAngle / 4) / 3
      : Math.cos(tiltAngle / 4) / 3
  }rad)`;
  particle.element.style.scale = `${1 - 0.2 * progress}`;

  if (progress > 0.5) {
    particle.element.style.opacity = `${2 - 2 * progress}`;
  }
};

export const balloons = (
  root: Element,
  internalAnimatingCallback: () => void,
  config?: BalloonsConfig
) => {
  const options = config || {};
  const {
    angle = 90,
    decay = 0.999,
    spread = 50,
    startVelocity = 3,
    elementCount = 10,
    elementSize = 20,
    lifetime = 600,
    zIndex = 0,
    position = 'fixed',
    colors = defaultColors,
    onAnimationComplete,
  } = options;
  const spanElements = createElements(
    root,
    elementCount,
    elementSize,
    zIndex,
    position,
    colors
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

  animate({ root, particles, decay, lifetime, updateParticle, onFinish });
};
