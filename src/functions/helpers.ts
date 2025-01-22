import { AnimateFunction } from './helpers.types';

export const animate: AnimateFunction = ({
  root,
  particles,
  decay,
  rotate,
  lifetime,
  fps,
  updateParticle,
  onFinish,
}) => {
  const totalTicks = lifetime;
  let tick = 0;
  let lastTime = 0;
  const interval = 1000 / fps;

  const update = (timestamp: number) => {
    if (!lastTime) lastTime = timestamp;

    const elapsed = timestamp - lastTime;

    if (elapsed >= interval) {
      lastTime = timestamp - (elapsed % interval);

      particles.forEach((particle) =>
        updateParticle(particle, tick / totalTicks, decay, rotate)
      );

      tick += 1;

      if (tick >= totalTicks) {
        particles.forEach((particle) => {
          if (particle.element.parentNode === root) {
            root.removeChild(particle.element);
          }
        });
        onFinish();
        return;
      }
    }

    window.requestAnimationFrame(update);
  };

  window.requestAnimationFrame(update);
};

export const { PI } = Math;

export const degreesToRadians = (degrees: number) => degrees * (PI / 180);

export const getRandomInt = (min: number, max: number) => {
  const minVal = Math.ceil(min);
  const maxVal = Math.floor(max);
  return Math.floor(Math.random() * (maxVal - minVal)) + minVal;
};

export const generatePhysics = (
  angle: number,
  spread: number,
  startVelocity: number,
  differentiator: number
) => {
  const radAngle = degreesToRadians(angle);
  const radSpread = degreesToRadians(spread);
  const { random } = Math;
  return {
    x: 0,
    y: 0,
    z: 0,
    height: 0,
    wobble: random() * 10,
    velocity: startVelocity * 0.5 + random() * startVelocity,
    angle2D: -radAngle + (0.5 * radSpread - random() * radSpread),
    angle3D: -(PI / 4) + random() * (PI / 2),
    tiltAngle: random() * PI,
    differentiator,
  };
};

export const getContainerById = (id: string) => {
  const container = document.getElementById(id);
  if (!container) {
    console.error(
      `Element with an ID of ${id} could not be found. Please provide a valid ID.`
    );
  }
  return container;
};
