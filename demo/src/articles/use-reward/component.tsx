import { CodeBlock } from '@/components/code-block';
import { CodeText } from '@/components/code-text';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { Section } from '@/components/section';
import { SettingsTable } from './settings-table';
import type { BurstOption } from './types';

const USAGE = `import { useRef } from 'react';
import { confetti, useReward } from 'react-rewards';

export const RewardButton = () => {
  const ref = useRef<HTMLButtonElement>(null);
  const { reward, isAnimating } = useReward(ref, confetti);

  return (
    <button ref={ref} type="button" onClick={() => reward()}>
      {isAnimating ? 'Yay!' : 'Reward me'}
    </button>
  );
};
`;

const SETTINGS = `const { reward } = useReward(
  ref,
  emoji,
  { emojis: ['🎉', '🚀'], count: 30, spread: 70 },
  { onComplete: () => console.log('done') }
);
`;

const RUNTIME = `const { reward } = useReward(ref, party ? confetti : emoji, { count: 30 });
`;

const OPTION_COLUMNS: readonly DataTableColumn[] = [
  { label: 'Option', code: true },
  { label: 'Default' },
  { label: 'What it does', muted: true },
];

const OPTIONS: readonly BurstOption[] = [
  {
    name: 'zIndex',
    defaultValue: '`2147483647`',
    description: "The canvas's z-index while the burst runs.",
  },
  {
    name: 'onComplete',
    defaultValue: '',
    description:
      'Called once when the burst ends on its own. Not called when it is cancelled.',
  },
  {
    name: 'respectReducedMotion',
    defaultValue: '`true`',
    description:
      'Skips the burst when the user prefers reduced motion. `onComplete` is still called.',
  },
  {
    name: 'seed',
    defaultValue: 'random',
    description:
      "Seeds the burst's random numbers, so the same seed plays the same burst.",
  },
];

/** The hook's page, from the library's README (README, "Articles"). */
export const UseRewardArticle = () => (
  <>
    <Section title="Usage">
      <p>
        Give <code>useReward</code> a ref to the element a reward starts from,
        and an effect. Each call to <code>reward()</code> fires a burst from the
        centre of that element.
      </p>
      <CodeBlock code={USAGE} filename="RewardButton.tsx" label="the usage" />
      <p>
        Bursts are drawn on one canvas over the whole page, so the element's{' '}
        <code>overflow</code> or <code>transform</code> can't clip them. Each
        call starts a new burst, and earlier ones keep going.
      </p>
    </Section>
    <Section title="Arguments">
      <p>
        <code>useReward(target, effect, config?, options?)</code> takes:
      </p>
      <ul>
        <li>
          <code>target</code>: a ref, or the element itself.
        </li>
        <li>
          <code>effect</code>: <code>confetti</code>, <code>emoji</code>,{' '}
          <code>balloon</code>, or <a href="#custom-effects">one of yours</a>.
        </li>
        <li>
          <code>config</code>: changes to the effect's settings.
        </li>
        <li>
          <code>options</code>: options for the burst.
        </li>
      </ul>
      <p>
        The settings and the options can change on any render:{' '}
        <code>reward</code> stays the same function, and each call uses the
        latest values.
      </p>
      <CodeBlock
        code={SETTINGS}
        filename="RewardButton.tsx"
        label="the settings example"
      />
    </Section>
    <Section title="Settings">
      <p>
        <code>confetti</code>, <code>emoji</code> and <code>balloon</code> share
        most of their settings, and every setting is optional. Each effect's
        page describes its settings, lists its colours, and lets you try them:{' '}
        <a href="#confetti">Confetti</a>, <a href="#emoji">Emoji</a> and{' '}
        <a href="#balloon">Balloons</a>.
      </p>
      <SettingsTable />
    </Section>
    <Section title="Burst options">
      <DataTable
        columns={OPTION_COLUMNS}
        rows={OPTIONS.map(({ name, defaultValue, description }) => ({
          key: name,
          cells: [
            name,
            <CodeText key="default" text={defaultValue} />,
            <CodeText key="description" text={description} />,
          ],
        }))}
      />
    </Section>
    <Section title="What it returns">
      <ul>
        <li>
          <code>reward(origin?)</code> fires the effect and returns{' '}
          <a href="#fire">the burst</a>. Without an argument it starts at the
          target's centre. It also takes a point in viewport pixels (
          <code>{'{ x, y }'}</code>), another element or ref, or a pointer
          event.
        </li>
        <li>
          <code>isAnimating</code> is true from a call until every burst it
          started has ended.
        </li>
      </ul>
      <p>Bursts still running when the component unmounts are cancelled.</p>
    </Section>
    <Section title="Starting at the pointer">
      <p>
        Pass <code>reward</code> straight to a handler, as in{' '}
        <code>{'onClick={reward}'}</code>, and the burst starts at the pointer
        instead. A click from the keyboard still starts at the element.
      </p>
    </Section>
    <Section title="Picking an effect at runtime">
      <p>
        Any effect fits where an effect is expected, so you can choose one as
        you render:
      </p>
      <CodeBlock
        code={RUNTIME}
        filename="RewardButton.tsx"
        label="the runtime example"
      />
    </Section>
  </>
);
