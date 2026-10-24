import { CodeBlock } from '@/components/code-block';
import { Section } from '@/components/section';

const GUIDE =
  'https://github.com/thedevelobear/react-rewards/blob/master/docs/guides/adding-an-effect.md';

const SNOW = `import {
  accelerate,
  defineEffect,
  degToRad,
  easeInQuad,
} from 'react-rewards';

export const snow = defineEffect({
  name: 'snow',
  blend: 'normal',
  defaults: {
    count: 40,
    size: 6,
    color: '#ffffff',
    drag: 2,
    gravity: 120,
    lifetime: 4000,
  },
  sprites: ({ size, color }) => [{ shape: 'circle', color, size }],
  spawn: (p, _config, rng) => {
    const direction = degToRad(rng.range(0, 360));
    const speed = rng.range(100, 300);
    p.vx = Math.cos(direction) * speed;
    p.vy = -Math.sin(direction) * speed;
    p.scale = rng.range(0.5, 1);
  },
  update: (p, dt, config) => {
    p.vx = accelerate(p.vx, 0, config.drag, dt);
    p.vy = accelerate(p.vy, config.gravity, config.drag, dt);
    p.alpha = 1 - easeInQuad(p.age / p.life);
  },
});

// useReward(ref, snow, { color: '#cce8ff' })
`;

/** The custom effects page, from the library's README (README, "Articles"). */
export const CustomEffectsArticle = () => (
  <>
    <Section title="An effect">
      <p>
        An effect is a plain object made with <code>defineEffect</code>. It
        names the sprites it draws, sets up each new particle in{' '}
        <code>spawn</code>, and changes each particle every frame in{' '}
        <code>update</code>. The engine moves particles by their velocity, so an
        effect only changes the velocity. Custom effects work everywhere the
        built-in ones do.
      </p>
      <CodeBlock code={SNOW} filename="snow.ts" lang="ts" label="the effect" />
    </Section>
    <Section title="The contract">
      <ul>
        <li>
          <strong>Units.</strong> Positions are CSS pixels in viewport
          coordinates, with y pointing down. Velocities are px/s,{' '}
          <code>dt</code> and <code>age</code> are seconds, and angles are
          radians.
        </li>
        <li>
          <strong>Sprites.</strong>{' '}
          <code>{"{ shape: 'rect', color, width, height }"}</code>,{' '}
          <code>{"{ shape: 'circle', color, size }"}</code>,{' '}
          <code>{'{ emoji, size }'}</code>,{' '}
          <code>{'{ svg, width, height }'}</code>, or{' '}
          <code>{'{ key, width, height, draw(ctx, width, height) }'}</code> for
          anything a 2D canvas can draw. A particle picks one with{' '}
          <code>p.sprite</code>. Particles can't be tinted, so draw one sprite
          per colour.
        </li>
        <li>
          <strong>Particles</strong> have <code>x</code>, <code>y</code>,{' '}
          <code>vx</code>, <code>vy</code>, <code>rotation</code>,{' '}
          <code>scale</code>, <code>scaleX</code>, <code>scaleY</code>,{' '}
          <code>alpha</code>, <code>sprite</code>, <code>age</code>,{' '}
          <code>life</code>, and four free slots, <code>s0</code> to{' '}
          <code>s3</code>, for the effect's own state. Don't keep a particle
          after <code>spawn</code> or <code>update</code> returns: the object is
          reused.
        </li>
        <li>
          <strong>Helpers.</strong> <code>accelerate</code> (gravity with drag)
          and <code>damp</code> (decay) are exact at any frame rate. There are
          also <code>clamp</code>, <code>lerp</code>, <code>degToRad</code>, the
          easings (<code>linear</code>, <code>easeInQuad</code>,{' '}
          <code>easeOutQuad</code>, <code>easeInOutQuad</code>,{' '}
          <code>easeInCubic</code>, <code>easeOutCubic</code>,{' '}
          <code>easeInOutCubic</code>) and <code>createRng</code>. Use the{' '}
          <code>rng</code> you are given, so a <code>seed</code> replays the
          burst.
        </li>
        <li>
          <strong>Blending.</strong> <code>blend: 'additive'</code> makes
          overlapping particles brighter, for glows and sparks.
        </li>
        <li>
          <strong>Children.</strong> The fourth argument of <code>update</code>{' '}
          has <code>spawn(init)</code>, which adds a particle, for trails and
          sub-bursts.
        </li>
      </ul>
    </Section>
    <Section title="Errors and bundling">
      <p>
        If an effect throws, its burst ends quietly and the rest of the page
        carries on. If you publish effects in a package, write{' '}
        <code>{'/* @__PURE__ */'}</code> before each <code>defineEffect(</code>{' '}
        call, so bundlers can drop the ones an app doesn't use.
      </p>
    </Section>
    <Section title="Adding an effect to react-rewards">
      <p>
        To add an effect to the library itself, with its tests and its page on
        this site, follow <a href={GUIDE}>the effect guide</a>.
      </p>
    </Section>
  </>
);
