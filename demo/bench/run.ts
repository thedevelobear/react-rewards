// The new engine's benchmark (ADR 0048). It drives the built site's Stress
// test page in a headed Chromium, with the method of the v2 baseline in
// docs/benchmarks/2026-10-22-v2-baseline.md.
// Usage: `pnpm bench [reps]` at the root, which builds first. Keep the
// Chromium window uncovered, because macOS throttles hidden windows.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { type BrowserContext, chromium, type Page } from '@playwright/test';
import { createRsbuild, loadConfig } from '@rsbuild/core';

const root = join(import.meta.dirname, '..');
const reps = Number(process.argv[2] ?? 3);

/**
 * Each effect's name and its label on the Stress test page. The page turns
 * the count into rockets for fireworks, one per 130 particles, so their
 * particle counts are approximate (README, "Stress test").
 */
const EFFECTS = [
  ['confetti', 'Confetti'],
  ['emoji', 'Emoji'],
  ['balloon', 'Balloons'],
  ['firework', 'Fireworks'],
] as const;
const COUNTS = [500, 5000, 20000];
const RENDERERS = [
  ['webgl', 'WebGL'],
  ['canvas', 'Canvas 2D'],
] as const;

/** A burst that runs longer than this, in ms, has hung. */
const BURST_TIMEOUT = 180_000;

interface Run {
  readonly effect: string;
  readonly renderer: string;
  readonly count: number;
  readonly rep: number;
  readonly refreshMs: number;
  readonly durationMs: number;
  readonly frames: number;
  readonly fps: number;
  readonly p95FrameMs: number;
  readonly maxFrameMs: number;
  readonly longPct: number;
  readonly scriptMs: number;
  readonly styleMs: number;
  readonly layoutMs: number;
  readonly taskMs: number;
}

const intervals = (frames: readonly number[]): number[] =>
  frames.slice(1).map((time, i) => time - (frames[i] ?? time));

const sorted = (values: readonly number[]): number[] =>
  [...values].sort((a, b) => a - b);

const median = (values: readonly number[]): number => {
  const s = sorted(values);
  const middle = s.length >> 1;
  return s.length % 2
    ? (s[middle] ?? 0)
    : ((s[middle - 1] ?? 0) + (s[middle] ?? 0)) / 2;
};

const percentile = (values: readonly number[], p: number): number => {
  const s = sorted(values);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))] ?? 0;
};

/** Main-thread time so far, in ms, from the DevTools protocol. */
const mainThread = async (
  cdp: Awaited<ReturnType<BrowserContext['newCDPSession']>>
) => {
  const { metrics } = await cdp.send('Performance.getMetrics');
  const metric = (name: string) =>
    (metrics.find((entry) => entry.name === name)?.value ?? 0) * 1000;
  return {
    script: metric('ScriptDuration'),
    style: metric('RecalcStyleDuration'),
    layout: metric('LayoutDuration'),
    task: metric('TaskDuration'),
  };
};

/** `requestAnimationFrame` times over `ms`, to find the refresh rate. */
const idle = (page: Page, ms: number) =>
  page.evaluate(
    (ms) =>
      new Promise<number[]>((resolve) => {
        const frames: number[] = [];
        const tick = (time: number) => {
          frames.push(time);
          if (time - (frames[0] ?? time) < ms) requestAnimationFrame(tick);
          else resolve(frames);
        };
        requestAnimationFrame(tick);
      }),
    ms
  );

/**
 * Clicks "Reward me" in a frame callback, and collects the frame times until
 * the readout says the burst has ended (README, "Stress test").
 */
const burst = (page: Page) =>
  page.evaluate(
    (timeout) =>
      new Promise<number[]>((resolve, reject) => {
        const readout = document.querySelector<HTMLElement>(
          '[data-testid="stress-readout"]'
        );
        const button = document.querySelector<HTMLElement>(
          '[data-testid="reward"]'
        );
        if (!readout || !button) {
          reject(new Error('The Stress test page has changed.'));
          return;
        }
        const frames: number[] = [];
        let started = false;
        const tick = (time: number) => {
          frames.push(time);
          const state = readout.dataset.state;
          if (state === 'skipped') {
            reject(new Error('The burst was skipped.'));
          } else if (state === 'running') {
            started = true;
          } else if (started) {
            resolve(frames);
            return;
          }
          if (time - (frames[0] ?? time) > timeout) {
            reject(new Error('The burst never ended.'));
            return;
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame((time) => {
          frames.push(time);
          button.click();
          requestAnimationFrame(tick);
        });
      }),
    BURST_TIMEOUT
  );

/** Picks the effect, count and renderer on the Stress test page. */
const choose = async (
  page: Page,
  effect: string,
  count: number,
  renderer: string
) => {
  const option = (group: string, name: string) =>
    page
      .getByRole('group', { name: group })
      .getByRole('button', { name, exact: true })
      .click();
  await option('effect', effect);
  await page.getByLabel('count').fill(String(count));
  await option('renderer', renderer);
};

const { urls, server } = await (
  await createRsbuild({ cwd: root, config: await loadConfig({ cwd: root }) })
).preview({ getPortSilently: true });

const browser = await chromium.launch({
  headless: false,
  args: [
    '--window-size=1280,860',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-background-timer-throttling',
  ],
});
const context = await browser.newContext({ viewport: null });
const runs: Run[] = [];

try {
  for (const [effect, effectLabel] of EFFECTS) {
    for (const [renderer, rendererLabel] of RENDERERS) {
      for (const count of COUNTS) {
        const page = await context.newPage();
        await page.goto(`${urls[0]}/#stress-test`);
        await page.bringToFront();
        await choose(page, effectLabel, count, rendererLabel);
        // Lets the new window reach the screen before measuring.
        await page.waitForTimeout(1500);
        const cdp = await context.newCDPSession(page);
        await cdp.send('Performance.enable');

        const refreshMs = median(intervals(await idle(page, 1000)));
        if (refreshMs > 34) {
          throw new Error(
            `rAF is throttled (${refreshMs.toFixed(1)} ms). Is the window hidden?`
          );
        }

        await burst(page); // Warm-up, not recorded.
        const shown = await page.getByTestId('stress-readout').textContent();
        if (!shown?.startsWith(rendererLabel)) {
          throw new Error(`Drew on "${shown}", not ${rendererLabel}.`);
        }

        for (let rep = 0; rep < reps; rep++) {
          await page.waitForTimeout(300);
          const before = await mainThread(cdp);
          const frames = await burst(page);
          const after = await mainThread(cdp);
          const gaps = intervals(frames);
          const durationMs = (frames.at(-1) ?? 0) - (frames[0] ?? 0);
          const run: Run = {
            effect,
            renderer,
            count,
            rep,
            refreshMs,
            durationMs,
            frames: gaps.length,
            fps: (gaps.length / durationMs) * 1000,
            p95FrameMs: percentile(gaps, 95),
            maxFrameMs: Math.max(...gaps),
            longPct:
              (gaps.filter((gap) => gap > refreshMs * 1.5).length /
                gaps.length) *
              100,
            scriptMs: after.script - before.script,
            styleMs: after.style - before.style,
            layoutMs: after.layout - before.layout,
            taskMs: after.task - before.task,
          };
          runs.push(run);
          console.log(
            `${effect.padEnd(8)} ${renderer.padEnd(6)} ${String(count).padStart(5)} #${rep}  ` +
              `${run.fps.toFixed(1)} fps  p95 ${run.p95FrameMs.toFixed(1)}ms  ` +
              `script ${run.scriptMs.toFixed(0)}  style ${run.styleMs.toFixed(0)}  ` +
              `layout ${run.layoutMs.toFixed(0)}  task ${run.taskMs.toFixed(0)}  ` +
              `(${run.durationMs.toFixed(0)}ms)`
          );
        }
        await page.close();
      }
    }
  }
} finally {
  await browser.close();
  await server.close();
}

writeFileSync(
  join(import.meta.dirname, 'results.json'),
  JSON.stringify({ browser: browser.version(), reps, runs }, null, 2)
);

// The medians, as a table for docs/benchmarks/. Main-thread times are per
// frame.
const pick = (
  effect: string,
  renderer: string,
  count: number,
  value: (run: Run) => number
) =>
  median(
    runs
      .filter(
        (run) =>
          run.effect === effect &&
          run.renderer === renderer &&
          run.count === count
      )
      .map(value)
  );

console.log(
  '\n| Effect | Renderer | Particles | Duration (ms) | rAF fps | p95 frame (ms) | Long frames | Script | Style | Layout | Other | Main thread busy |'
);
console.log('|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|');
for (const [effect] of EFFECTS) {
  for (const [renderer, rendererLabel] of RENDERERS) {
    for (const count of COUNTS) {
      const m = (value: (run: Run) => number) =>
        pick(effect, renderer, count, value);
      const perFrame = (value: (run: Run) => number) =>
        m((run) => value(run) / run.frames).toFixed(2);
      const cells = [
        effect,
        rendererLabel,
        count,
        m((run) => run.durationMs).toFixed(0),
        m((run) => run.fps).toFixed(1),
        m((run) => run.p95FrameMs).toFixed(1),
        `${m((run) => run.longPct).toFixed(1)}%`,
        perFrame((run) => run.scriptMs),
        perFrame((run) => run.styleMs),
        perFrame((run) => run.layoutMs),
        perFrame(
          (run) => run.taskMs - run.scriptMs - run.styleMs - run.layoutMs
        ),
        `${m((run) => (run.taskMs / run.durationMs) * 100).toFixed(0)}%`,
      ];
      console.log(`| ${cells.join(' | ')} |`);
    }
  }
}
