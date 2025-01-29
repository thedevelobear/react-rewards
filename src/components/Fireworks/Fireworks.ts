import { FireworksConfig } from './Fireworks.types';
import {
  animate,
  degreesToRadians,
  generatePhysics,
  getRandomInt,
} from '../../functions/helpers';
import { Particle } from '../../Main.types';

const defaultColors = ['#D71328', '#D73C70', '#E1DF45', '#BF00FF'];
const factors = [-0.6, -0.3, 0, 0.3, 0.6];

const createElements = (
  root: Element,
  elementCount: number,
  elementSize: number,
  zIndex: number,
  position: string,
  color: string
) =>
  Array.from({ length: elementCount }).map((_, index) => {
    const element = document.createElement('span');
    const step = 100 / (elementCount - 1);
    element.style.backgroundColor = color;
    element.style.width = `${elementSize}px`;
    element.style.height = `${elementSize}px`;
    element.style.borderRadius = '100%';
    element.style.position = position;
    element.style.zIndex = `${zIndex}`;
    element.style.opacity = `${Math.trunc(index * step) / 100 / 4}`;

    root.appendChild(element);
    return { element, differentiator: getRandomInt(0, factors.length) };
  });

const updateParticle = (
  particle: Particle,
  progress: number,
  decay: number
) => {
  const { x, y, wobble, angle2D, tiltAngle, height, velocity } =
    particle.physics;

  const exploded = progress > 0.25;

  if (exploded) {
    particle.physics.x -= 0.15 * wobble * Math.cos(angle2D * 2) * velocity;
    particle.physics.y -= 0.15 * wobble * Math.sin(angle2D * 2) * velocity;
    particle.physics.velocity *= decay;

    particle.element.style.opacity =
      Math.random() >= 0.6 ? '0' : `${2 - 2 * progress}`;
    particle.element.style.boxShadow = `0 0 10px ${particle.element.style.backgroundColor}, 0 0 20px ${particle.element.style.backgroundColor}`;
  } else {
    // bomb flying up
    particle.physics.velocity = progress * height * decay;
    particle.physics.x -= 1.5 * Math.cos(tiltAngle) * velocity;
    particle.physics.y -= 1.5 * Math.sin(tiltAngle) * velocity;

    particle.element.style.opacity = `${progress ** 2}`;

    particle.element.style.boxShadow = `0 0 ${progress * 10}px ${
      particle.element.style.backgroundColor
    }, 0 0 ${progress * 10}px ${particle.element.style.backgroundColor}`;
  }

  particle.element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  particle.element.style.scale = `${1 - 0.1 * progress}`;
};

export const fireworks = (
  root: Element,
  internalAnimatingCallback: () => void,
  config?: FireworksConfig
) => {
  const options = config || {};
  const {
    elementCount = 100,
    elementSize = 3,
    colors = defaultColors,
    angle = getRandomInt(65, 115),
    spread = 250,
    decay = 0.94,
    lifetime = 200,
    maxHeight = getRandomInt(20, 50),
    startVelocity = getRandomInt(20, 30),
    zIndex = 0,
    position = 'fixed',
    fps = 60,
    onAnimationComplete,
  } = options;
  const spanElements = createElements(
    root,
    elementCount,
    elementSize,
    zIndex,
    position,
    colors[getRandomInt(0, colors.length)]
  );
  const particles = spanElements.map(({ element, differentiator }) => {
    const physics = generatePhysics(90, spread, startVelocity, differentiator);
    physics.height = maxHeight;
    physics.tiltAngle = degreesToRadians(angle);
    return {
      element,
      physics,
    };
  });

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
    fps,
    updateParticle,
    onFinish,
  });
};
