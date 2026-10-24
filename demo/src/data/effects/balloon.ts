import { balloon } from 'react-rewards';
import { angle, spread } from './controls';
import { effectPage } from './util';

export const balloonPage = effectPage({
  effect: balloon,
  label: 'Balloons',
  description: 'Balloons that float up and sway on their strings.',
  icon: 'balloon',
  controls: {
    count: {
      kind: 'range',
      min: 1,
      max: 50,
      step: 1,
      description: 'Balloons per burst.',
    },
    size: {
      kind: 'range',
      min: 8,
      max: 60,
      step: 1,
      unit: 'px',
      description:
        "A balloon's width in CSS pixels. With its string, it is about 3.1 times as tall.",
    },
    angle,
    spread,
    velocity: {
      kind: 'range',
      min: 0,
      max: 2000,
      step: 25,
      unit: 'px/s',
      description: 'The average launch speed, in pixels per second.',
    },
    drag: {
      kind: 'range',
      min: 0,
      max: 10,
      step: 0.1,
      unit: '/s',
      description:
        'Air resistance per second. Balloons settle at a speed of `gravity / drag`.',
    },
    gravity: {
      kind: 'range',
      min: -1500,
      max: 1500,
      step: 25,
      unit: 'px/s²',
      description:
        'Downward acceleration, in pixels per second squared. Negative is buoyancy, so balloons rise.',
    },
    lifetime: {
      kind: 'range',
      min: 500,
      max: 10000,
      step: 100,
      unit: 'ms',
      description: 'The longest a balloon lives, in milliseconds.',
    },
    colors: {
      kind: 'colors',
      description: 'One sprite per colour. Each balloon picks one at random.',
    },
  },
});
