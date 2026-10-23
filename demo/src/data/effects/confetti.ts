import { confetti } from 'react-rewards';
import { effectPage } from './util';

export const confettiPage = effectPage({
  effect: confetti,
  label: 'Confetti',
  description: 'Paper confetti that bursts out, flutters and falls.',
});
