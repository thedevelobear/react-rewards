import { confetti } from 'react-rewards';
import { angle, spread } from './controls';
import { effectPage } from './util';

export const confettiPage = effectPage({
  effect: confetti,
  label: 'Confetti',
  description: 'Paper confetti that bursts out, flutters and falls.',
  icon: 'burst',
  controls: {
    count: {
      kind: 'range',
      min: 1,
      max: 200,
      step: 1,
      description: 'Pieces per burst.',
    },
    size: {
      kind: 'range',
      min: 2,
      max: 24,
      step: 1,
      unit: 'px',
      description:
        "A piece's width in CSS pixels. Pieces are 5/8 as tall as they are wide.",
    },
    angle,
    spread,
    velocity: {
      kind: 'range',
      min: 0,
      max: 4000,
      step: 50,
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
        'Air resistance per second. Falling pieces settle at 0.8 to 1.2 times `gravity / drag`.',
    },
    gravity: {
      kind: 'range',
      min: 0,
      max: 3000,
      step: 50,
      unit: 'px/s²',
      description: 'Downward acceleration, in pixels per second squared.',
    },
    lifetime: {
      kind: 'range',
      min: 500,
      max: 10000,
      step: 100,
      unit: 'ms',
      description: 'The longest a piece lives, in milliseconds.',
    },
    colors: {
      kind: 'colors',
      description: 'One sprite per colour. Each piece picks one at random.',
    },
  },
});
