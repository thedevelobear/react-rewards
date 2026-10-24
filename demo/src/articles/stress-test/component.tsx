import { useEffect, useState } from 'react';
import { type RendererPreference, setRenderer } from 'react-rewards';
import { Preview } from '@/components/preview';
import {
  Choice,
  type ChoiceOption,
  ControlGrid,
  Range,
} from '@/components/props-panel';
import { Section } from '@/components/section';
import { effects, type RangeControl } from '@/data/effects';
import { useFrameRate } from '@/hooks/use-frame-rate';
import { Readout } from './readout';
import './style.css';

const COUNT: RangeControl = {
  kind: 'range',
  min: 100,
  max: 20000,
  step: 100,
  description: 'How many particles a burst spawns.',
};

const DEFAULT_COUNT = 5000;

const EFFECTS = effects.map(({ name, label }) => ({ value: name, label }));

const RENDERERS: readonly ChoiceOption<RendererPreference>[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'webgl', label: 'WebGL' },
  { value: 'canvas', label: 'Canvas 2D' },
];

/**
 * The engine's headroom: one effect at up to 20000 particles, on a renderer
 * of your choice, with the fps in the preview's corner (README, "Stress
 * test").
 */
export const StressTestArticle = () => {
  const [name, setName] = useState<string>(effects[0].name);
  const [count, setCount] = useState(DEFAULT_COUNT);
  const [renderer, setRendererChoice] = useState<RendererPreference>('auto');
  const { reading, track } = useFrameRate();

  // The choice applies to the whole page, so the effect pages get Auto back.
  useEffect(() => () => setRenderer('auto'), []);

  const chooseRenderer = (next: RendererPreference) => {
    setRenderer(next);
    setRendererChoice(next);
  };

  const page = effects.find((effect) => effect.name === name) ?? effects[0];

  return (
    <>
      {page.use((typed) => (
        <Preview
          page={typed}
          config={{ ...typed.effect.defaults, count }}
          onBurst={track}
          corner={<Readout reading={reading} />}
        />
      ))}
      <Section title="Customize">
        <ControlGrid>
          <Choice
            name="effect"
            options={EFFECTS}
            value={name}
            onChange={setName}
          />
          <Range
            name="count"
            control={COUNT}
            value={count}
            onChange={setCount}
          />
          <Choice
            name="renderer"
            options={RENDERERS}
            value={renderer}
            onChange={chooseRenderer}
          />
        </ControlGrid>
      </Section>
    </>
  );
};
