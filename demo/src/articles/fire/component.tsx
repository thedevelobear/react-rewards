import { CodeBlock } from '@/components/code-block';
import { Section } from '@/components/section';

const USAGE = `import { confetti, fire } from 'react-rewards';

const burst = fire(confetti, {
  origin: { x: 200, y: 300 },
  config: { count: 80 },
  zIndex: 10,
});

burst.cancel(); // ends it at once
const how = await burst.finished; // 'complete', 'skipped' or 'cancelled'
`;

/** `fire`'s page, from the library's README (README, "Articles"). */
export const FireArticle = () => (
  <>
    <Section title="Usage">
      <p>
        <code>fire</code> plays an effect once and returns the burst. It needs
        no React, so it works anywhere a page can run JavaScript.
      </p>
      <CodeBlock code={USAGE} filename="burst.ts" lang="ts" label="the usage" />
    </Section>
    <Section title="Options">
      <ul>
        <li>
          <code>origin</code> is where the burst starts: a point in viewport
          pixels (<code>{'{ x, y }'}</code>), an element or a ref. It is read
          when <code>fire</code> is called.
        </li>
        <li>
          <code>config</code> changes the effect's settings, as{' '}
          <code>useReward</code>'s third argument does.
        </li>
        <li>
          <code>element</code> is the element the effect animates, if it
          animates one, as <code>pop</code> does: an element or a ref, read when{' '}
          <code>fire</code> is called. It defaults to <code>origin</code> when
          that is an element or a ref, so a burst from a point animates nothing
          unless you give one. Another burst on the same element restarts the
          animation rather than adding to it.
        </li>
      </ul>
      <p>
        Beside them, <code>fire</code> takes the{' '}
        <a href="#use-reward">burst options</a>: <code>zIndex</code>,{' '}
        <code>onComplete</code>, <code>respectReducedMotion</code> and{' '}
        <code>seed</code>.
      </p>
    </Section>
    <Section title="The burst">
      <ul>
        <li>
          <code>cancel()</code> ends the burst at once, without calling{' '}
          <code>onComplete</code>, and puts back the element it was animating.
        </li>
        <li>
          <code>finished</code> resolves once the burst has ended, with how it
          ended: <code>'complete'</code>, <code>'skipped'</code> or{' '}
          <code>'cancelled'</code>. It never rejects. A skipped burst drew and
          animated nothing: it was fired under reduced motion, from an empty
          ref, or with no renderer available.
        </li>
        <li>
          <code>renderer</code> says which renderer the burst was given:{' '}
          <code>'webgl'</code>, <code>'canvas'</code>, or <code>undefined</code>{' '}
          if it was skipped before getting one.
        </li>
      </ul>
    </Section>
  </>
);
