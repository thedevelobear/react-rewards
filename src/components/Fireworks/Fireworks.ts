import { FireworksConfig } from './Fireworks.types';
import {
  animate,
  degreesToRadians,
  generatePhysics,
  getRandomInt,
} from '../../functions/helpers';
import { Particle } from '../../Main.types';

const defaultColors = ['#ffff00', '#40ffff', '#00ff00', '#ff00ff'];
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
    element.style.backgroundColor = color;
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
  const { x, y, wobble, angle2D, tiltAngle, height, velocity, differentiator } =
    particle.physics;

  if (progress > 0.25) {
    // explosion
    particle.physics.x += Math.cos(angle2D) * velocity;
    particle.physics.y += Math.sin(angle2D) * velocity + 3.5;
    particle.physics.velocity *= decay;
  } else {
    // bomb flying up
    particle.physics.velocity = progress * height * decay;
  }
  particle.physics.x -= Math.cos(tiltAngle) * velocity;
  particle.physics.y -= Math.sin(tiltAngle) * velocity;

  const wobbleX =
    x +
    (progress > 0.25
      ? factors[differentiator] * progress * wobble * wobble
      : 0);
  const wobbleY = y + (progress > 0.25 ? -10 * wobble : 0);

  particle.element.style.transform = `translate3d(${wobbleX}px, ${wobbleY}px, 0)`;
  particle.element.style.scale = `${1 - 0.2 * progress}`;

  if (progress > 0.5) {
    particle.element.style.opacity = `${2 - 2 * progress}`;
  }
};

export const fireworks = (
  root: Element,
  internalAnimatingCallback: () => void,
  config?: FireworksConfig
) => {
  const options = config || {};
  const {
    elementCount = 50,
    elementSize = 4,
    colors = defaultColors,
    angle = getRandomInt(65, 115),
    spread = 45,
    decay = 0.94,
    lifetime = 200,
    maxHeight = getRandomInt(20, 50),
    startVelocity = getRandomInt(10, 30),
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
    colors[getRandomInt(0, colors.length - 1)]
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
    updateParticle,
    onFinish,
  });
};
