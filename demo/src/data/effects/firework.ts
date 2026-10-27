import { firework } from 'react-rewards';
import { angle } from './controls';
import { effectPage } from './util';

export const fireworkPage = effectPage({
  effect: firework,
  label: 'Fireworks',
  description:
    'Rockets that spiral up and burst as peonies, willows and crackles.',
  icon: 'firework',
  caption: 'Fireworks look best on dark backgrounds. Just like in real life.',
  controls: {
    count: {
      kind: 'range',
      min: 1,
      max: 10,
      step: 1,
      description:
        'Rockets per burst. They launch from the same spot, a moment apart.',
    },
    size: {
      kind: 'range',
      min: 2,
      max: 12,
      step: 1,
      unit: 'px',
      description:
        "A star's diameter in CSS pixels. Trails and sparks are smaller, and everything glows past its size.",
    },
    angle,
    spread: {
      kind: 'range',
      min: 0,
      max: 180,
      step: 1,
      unit: '°',
      description:
        'The width of the fan the rockets launch in around `angle`, in degrees.',
    },
    velocity: {
      kind: 'range',
      min: 200,
      max: 2000,
      step: 50,
      unit: 'px/s',
      description: "A rocket's average launch speed, in pixels per second.",
    },
    drag: {
      kind: 'range',
      min: 1.5,
      max: 8,
      step: 0.1,
      unit: '/s',
      description:
        'Air resistance per second on a rocket. It slows the climb, and the shell bursts just before the top.',
    },
    gravity: {
      kind: 'range',
      min: 0,
      max: 1000,
      step: 10,
      unit: 'px/s²',
      description:
        'Downward acceleration, in pixels per second squared. It slows the rockets and makes the stars droop.',
    },
    spiral: {
      kind: 'range',
      min: 0,
      max: 8,
      step: 0.5,
      unit: 'px',
      description:
        'How far a rocket spirals around its path, in CSS pixels. 0 flies straight.',
    },
    stars: {
      kind: 'range',
      min: 5,
      max: 120,
      step: 1,
      description:
        'Stars per shell. Willows have half as many and crackles three quarters, since their stars leave trails or pop.',
    },
    radius: {
      kind: 'range',
      min: 20,
      max: 250,
      step: 5,
      unit: 'px',
      description:
        "How far a shell's stars spread from where it bursts, in CSS pixels.",
    },
    peony: {
      kind: 'range',
      min: 0,
      max: 10,
      step: 1,
      description:
        'How often a shell bursts as a peony, a ball of coloured stars that droop and fade, against `willow` and `crackle`.',
    },
    willow: {
      kind: 'range',
      min: 0,
      max: 10,
      step: 1,
      description:
        'How often a shell bursts as a willow, gold stars whose long trails hang and droop, against `peony` and `crackle`.',
    },
    crackle: {
      kind: 'range',
      min: 0,
      max: 10,
      step: 1,
      description:
        'How often a shell bursts as a crackle, stars that flicker, go dark and pop into glittering sparks, against `peony` and `willow`.',
    },
    lifetime: {
      kind: 'range',
      min: 1000,
      max: 8000,
      step: 100,
      unit: 'ms',
      description:
        'How long the show lasts, in milliseconds. Every rocket, star and spark is gone by then.',
    },
    colors: {
      kind: 'colors',
      description:
        'One sprite per colour. Each shell takes the next colour. Willows burn gold, and crackles pop into amber sparks.',
    },
  },
});
