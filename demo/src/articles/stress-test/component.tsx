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
import type { CountUnit } from './types';
import './style.css';

const COUNT: RangeControl = {
  kind: 'range',
  min: 100,
  max: 20000,
  step: 100,
  description: 'How many particles a burst spawns.',
};

const DEFAULT_COUNT = 5000;

/**
 * The effects whose `count` isn't particles, by name. A burst of one asks for
 * the count's particles in these instead.
 */
const UNITS: Readonly<Record<string, CountUnit>> = {
  // A rocket peaks at about 126 live particles at the defaults.
  firework: { particles: 130, one: 'rocket', many: 'rockets' },
};

const EFFECTS = effects.map(({ name, label }) => ({ value: name, label }));

const RENDERERS: readonly ChoiceOption<RendererPreference>[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'webgl', label: 'WebGL' },
  { value: 'canvas', label: 'Canvas 2D' },
];

/**
 * The engine's headroom: one effect at up to 20000 particles, on a renderer
 * of your choice, with the fps in the preview's corner. An effect whose
 * `count` isn't particles gets about as many particles (README, "Stress
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
  const unit = UNITS[page.name];
  const units = unit ? Math.max(1, Math.round(count / unit.particles)) : count;

  return (
    <>
      {page.use((typed) => (
        <Preview
          page={typed}
          config={{ ...typed.effect.defaults, count: units }}
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
        {unit && (
          <p data-testid="stress-units">
            {page.label} count {unit.many}, which make the particles, so this
            count is approximate: {count} particles is {units}{' '}
            {units === 1 ? unit.one : unit.many}.
          </p>
        )}
      </Section>
    </>
  );
};
