import { emoji } from 'react-rewards';
import { angle, spread } from './controls';
import { effectPage } from './util';

export const emojiPage = effectPage({
  effect: emoji,
  label: 'Emoji',
  description: 'Emoji that pop in, spin and tumble down.',
  icon: [
    'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    'M8.5 14.5a4.5 4.5 0 0 0 7 0',
    'M9 9.5h.01M15 9.5h.01',
  ],
  controls: {
    count: {
      kind: 'range',
      min: 1,
      max: 100,
      step: 1,
      description: 'Emoji per burst.',
    },
    size: {
      kind: 'range',
      min: 8,
      max: 64,
      step: 1,
      unit: 'px',
      description:
        'The font size in CSS pixels. Each emoji is drawn at 0.9 to 1.1 times it.',
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
        'Air resistance per second. Falling emoji settle at `gravity / drag`.',
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
      description: 'The longest an emoji lives, in milliseconds.',
    },
    rotate: {
      kind: 'switch',
      description:
        'Whether emoji start a little tilted and spin. Off keeps them upright.',
    },
    emojis: {
      kind: 'emojis',
      description: 'One sprite per emoji. Particles take them in turn.',
    },
  },
});
