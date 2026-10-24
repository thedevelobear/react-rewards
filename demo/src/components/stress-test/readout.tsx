import type { RendererKind } from 'react-rewards';
import type { Reading } from '@/hooks/use-frame-rate';

const RENDERERS: Record<RendererKind, string> = {
  webgl: 'WebGL',
  canvas: 'Canvas 2D',
};

const fps = (value: number | undefined): string =>
  value === undefined ? '–' : String(Math.round(value));

const text = (reading: Reading): string => {
  switch (reading.state) {
    case 'ready':
      return 'Ready';
    case 'skipped':
      return 'Skipped';
    case 'running':
    case 'done': {
      const renderer = reading.renderer ? RENDERERS[reading.renderer] : '–';
      const average = reading.state === 'done' ? ' avg' : '';
      return `${renderer} · ${fps(reading.fps)} fps${average}`;
    }
  }
};

/**
 * The renderer and fps tag in the preview's corner (README, "Stress test").
 * It isn't a live region, because it changes four times a second.
 */
export const Readout = ({ reading }: { readonly reading: Reading }) => (
  <span
    className="stress-readout"
    data-testid="stress-readout"
    data-state={reading.state}
  >
    {text(reading)}
  </span>
);
