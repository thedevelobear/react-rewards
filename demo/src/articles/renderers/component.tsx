import { CodeBlock } from '@/components/code-block';
import { Section } from '@/components/section';

const BENCHMARK =
  'https://github.com/thedevelobear/react-rewards/blob/master/docs/benchmarks/2026-10-23-v3-engine.md';

const SET_RENDERER = `import { setRenderer } from 'react-rewards';

setRenderer('canvas'); // or 'webgl', or 'auto' (the default)
`;

/** The renderers' page, from the library's README (README, "Articles"). */
export const RenderersArticle = () => (
  <>
    <Section title="How bursts are drawn">
      <p>
        Every burst is drawn on one canvas over the whole page. It is added on
        the first burst, ignores the pointer, is hidden from screen readers, and
        is removed a few seconds after the last burst ends.
      </p>
      <p>
        Bursts are drawn with WebGL2, and with Canvas 2D where WebGL2 isn't
        available. Both draw the same frames.
      </p>
    </Section>
    <Section title="Forcing a renderer">
      <p>
        <code>setRenderer</code> forces one renderer for the whole page, for
        example to compare them:
      </p>
      <CodeBlock
        code={SET_RENDERER}
        filename="renderer.ts"
        lang="ts"
        label="the setRenderer example"
      />
      <p>
        Keep <code>'auto'</code> in production. A forced renderer never falls
        back, so with <code>'webgl'</code> a browser without WebGL2 shows
        nothing.
      </p>
    </Section>
    <Section title="Performance">
      <p>
        In the <a href={BENCHMARK}>v3 benchmark</a>, WebGL keeps 120 fps with
        20000 particles for every effect. Canvas 2D keeps 120 fps at 5000, and
        runs at 40 to 65 fps at 20000. Try it on your own device on the{' '}
        <a href="#stress-test">Stress test</a>.
      </p>
    </Section>
  </>
);
