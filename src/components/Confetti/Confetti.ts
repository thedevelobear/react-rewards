import { ConfettiConfig } from './Confetti.types';
import {
  animate,
  generatePhysics,
  getRandomInt,
} from '../../functions/helpers';
import { Particle } from '../../Main.types';

const defaultColors = ['#A45BF1', '#25C6F6', '#72F753', '#F76C88', '#F5F770'];
const factors = [-0.6, -0.3, 0, 0.3, 0.6];

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
    element.style['background-color'] = colors[index % colors.length];
    element.style.width = `${elementSize}px`;
    element.style.height = `${elementSize}px`;
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
  const {
    x,
    y,
    tiltAngle,
    wobble,
    angle2D,
    angle3D,
    velocity,
    differentiator,
  } = particle.physics;

  particle.physics.x += Math.cos(angle2D) * velocity;
  particle.physics.y += Math.sin(angle2D) * velocity;
  particle.physics.z += Math.sin(angle3D) * velocity;
  particle.physics.wobble += 0.05;
  particle.physics.velocity *= decay;
  particle.physics.y += 3.5;
  particle.physics.tiltAngle += 0.15;

  const wobbleX =
    x +
    (factors[differentiator] * progress * wobble * wobble +
      20 * (differentiator % 2 ? Math.sin(wobble / 4) : Math.cos(wobble / 4)));

  const wobbleY = y + 5 * Math.sin(wobble);

  particle.element.style.transform = `translate3d(${wobbleX}px, ${wobbleY}px, 0) rotate3d(1, 1, 1, ${
    differentiator % 2 ? tiltAngle : -1 * tiltAngle
  }rad)`;
  particle.element.style.scale = `${1 - 0.2 * progress}`;

  if (progress > 0.5) {
    particle.element.style.opacity = `${2 - 2 * progress}`;
  }
};

export const confetti = (
  root: Element,
  internalAnimatingCallback: () => void,
  config?: ConfettiConfig
) => {
  const options = config || {};
  const {
    elementCount = 50,
    elementSize = 8,
    colors = defaultColors,
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

  animate({
    root,
    particles,
    decay,
    lifetime,
    updateParticle,
    onFinish,
  });
};
