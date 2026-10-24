import { CodeText } from '@/components/code-text';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { Section } from '@/components/section';
import type { Change } from './types';

const COLUMNS: readonly DataTableColumn[] = [
  { label: 'v2' },
  { label: 'v3', muted: true },
];

const CHANGES: readonly Change[] = [
  {
    v2: "`useReward('rewardId', 'confetti', config)`",
    v3: "`useReward(ref, confetti, config, options)`. The effect is imported by name, so the ones you don't use aren't bundled.",
  },
  {
    v2: '`<span id="rewardId" />`',
    v3: 'A ref, or the element itself. The burst starts at its centre.',
  },
  { v2: "`'balloons'`", v3: '`balloon`' },
  { v2: '`elementCount`', v3: '`count`' },
  { v2: '`elementSize`', v3: '`size`' },
  { v2: '`emoji`', v3: '`emojis`' },
  { v2: '`startVelocity` (px per frame)', v3: '`velocity` (px per second)' },
  {
    v2: '`decay` (velocity kept per frame)',
    v3: '`drag` (per second), and the new `gravity`',
  },
  { v2: '`lifetime` (frames)', v3: '`lifetime` (milliseconds)' },
  {
    v2: '`angle`, `spread`, `colors`, `rotate`',
    v3: 'The same names and units.',
  },
  { v2: '`fps`', v3: 'Removed. Particles move by time, at any frame rate.' },
  { v2: '`position`', v3: 'Removed. One fixed canvas covers the page.' },
  {
    v2: '`zIndex`',
    v3: 'A burst option, the fourth argument. It defaults to the top of the page instead of `0`.',
  },
  { v2: '`onAnimationComplete`', v3: '`onComplete`, a burst option.' },
  {
    v2: '`reward` changes when the config does',
    v3: '`reward` never changes, and each call uses the latest config.',
  },
  {
    v2: '`onClick={reward}` starts at the element',
    v3: '`onClick={reward}` starts at the pointer. Write `onClick={() => reward()}` to start at the element.',
  },
  { v2: 'Balloons pop when clicked', v3: "Balloons can't be clicked." },
  {
    v2: 'Reduced motion is ignored',
    v3: 'Bursts are skipped for people who prefer reduced motion. Set `respectReducedMotion: false` to play them anyway.',
  },
  { v2: 'React 15 to 17, CommonJS', v3: 'React 18 or later, ESM only.' },
];

/** The upgrade page, from the library's README (README, "Articles"). */
export const UpgradingArticle = () => (
  <>
    <Section title="What changed">
      <p>
        v3 is a rewrite, with a new engine and API. The effects were redesigned,
        so they look different, and their settings use physical units, so v2's
        numbers don't carry over. Each effect's page helps you tune the new
        values: <a href="#confetti">Confetti</a>, <a href="#emoji">Emoji</a> and{' '}
        <a href="#balloon">Balloons</a>.
      </p>
    </Section>
    <Section title="From v2 to v3">
      <p>Each v2 option, and what it became.</p>
      <DataTable
        columns={COLUMNS}
        rows={CHANGES.map(({ v2, v3 }) => ({
          key: v2,
          cells: [
            <CodeText key="v2" text={v2} />,
            <CodeText key="v3" text={v3} />,
          ],
        }))}
      />
    </Section>
  </>
);
