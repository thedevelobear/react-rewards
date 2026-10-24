import { CodeBlock } from '@/components/code-block';
import { Section } from '@/components/section';

const CLIENT_COMPONENT = `'use client';

import { useRef } from 'react';
import { confetti, useReward } from 'react-rewards';

export const RewardButton = () => {
  const ref = useRef<HTMLButtonElement>(null);
  const { reward } = useReward(ref, confetti);

  return (
    <button ref={ref} type="button" onClick={() => reward()}>
      Reward me
    </button>
  );
};
`;

/** The server rendering page, from the library's README (README, "Articles"). */
export const ServerRenderingArticle = () => (
  <>
    <Section title="On the server">
      <p>
        The package can be imported on the server: nothing touches{' '}
        <code>window</code> until a burst fires.
      </p>
    </Section>
    <Section title="Next.js">
      <p>
        <code>dist/index.js</code> starts with <code>'use client'</code>, so in
        the App Router, call <code>useReward</code> in a Client Component, and
        render that from your pages as usual.
      </p>
      <CodeBlock
        code={CLIENT_COMPONENT}
        filename="RewardButton.tsx"
        label="the Client Component"
      />
    </Section>
  </>
);
