import { pop } from 'react-rewards';
import { effectPage } from './util';

export const popPage = effectPage({
  effect: pop,
  label: 'Pop',
  description:
    'Streaks that swirl out of a soft flash and shrink into twinkling stars.',
  icon: 'sparkle-burst',
  caption: 'Sized for a like button. For a bigger button, raise the radius.',
  controls: {
    count: {
      kind: 'range',
      min: 1,
      max: 40,
      step: 1,
      description:
        'Stars per pop, each shot out on its own streak. Every other one is smaller and lands nearer the centre.',
    },
    dots: {
      kind: 'range',
      min: 0,
      max: 64,
      step: 1,
      description:
        'Dots in the ring that races out ahead of the streaks. 0 leaves the ring out.',
    },
    size: {
      kind: 'range',
      min: 4,
      max: 24,
      step: 1,
      unit: 'px',
      description:
        "A star's width from tip to tip, in CSS pixels. Streaks and dots are drawn to scale with it.",
    },
    radius: {
      kind: 'range',
      min: 20,
      max: 200,
      step: 5,
      unit: 'px',
      description:
        "How far the long streaks' stars land from the centre, in CSS pixels. Short ones land at 0.62 of it, and the ring races a little further.",
    },
    swirl: {
      kind: 'range',
      min: -90,
      max: 90,
      step: 1,
      unit: '°',
      description:
        'How far the streaks curve around the centre on their way out, in degrees. Positive turns counter-clockwise.',
    },
    lifetime: {
      kind: 'range',
      min: 600,
      max: 2400,
      step: 50,
      unit: 'ms',
      description:
        'How long the pop lasts, in milliseconds. Every part keeps its share of it, so a longer pop plays slower.',
    },
    bounce: {
      kind: 'switch',
      description:
        'Whether the element the pop fires from shrinks away at the tap and springs back as the stars bloom. Off leaves the element still.',
    },
    colors: {
      kind: 'colors',
      description:
        'One sprite per colour. Streaks take the colours in turn, and the flash and the ring take the first.',
    },
  },
});
