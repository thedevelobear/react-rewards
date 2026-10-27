import { afterEach, describe, expect, it, rs } from '@rstest/core';
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
} from '@testing-library/react';
import { StrictMode, useEffect } from 'react';
import { defineEffect, type Effect } from '@/core/define-effect';
import type { Burst, BurstEnd, FireOptions } from '@/core/fire';
import type { Origin } from '@/core/origin';
import {
  type RewardOptions,
  type RewardTarget,
  type UseRewardResult,
  useReward,
} from '@/react/use-reward';
import { testEffect } from '@/test-utils';

/** A call to the fake `fire()`, with a burst the test ends by hand. */
interface Fired {
  readonly effect: Effect;
  readonly options: FireOptions;
  /** How the burst ended, once it has. */
  how: BurstEnd | undefined;
  end(how: BurstEnd): void;
}

// The real fire() always skips in happy-dom, which can't draw (ADR 0043).
const { fired } = rs.hoisted(() => ({ fired: [] as Fired[] }));

rs.mock('@/core/fire', () => ({
  fire: (effect: Effect, options: FireOptions): Burst => {
    let settle: (how: BurstEnd) => void = () => {};
    const finished = new Promise<BurstEnd>((resolve) => {
      settle = resolve;
    });
    const call: Fired = {
      effect,
      options,
      how: undefined,
      end: (how) => {
        if (call.how) return;
        call.how = how;
        settle(how);
      },
    };
    fired.push(call);
    return {
      cancel: () => call.end('cancelled'),
      finished,
      renderer: 'webgl',
    };
  },
}));

const first = testEffect({ name: 'first' });
const second = testEffect({ name: 'second' });

/** Ends a burst and lets the hook see it. */
const end = (call: Fired | undefined, how: BurstEnd) =>
  act(async () => call?.end(how));

/** Calls `reward` from its effect, as a child given `reward` might. */
const Child = ({ onMount }: { onMount: UseRewardResult['reward'] }) => {
  useEffect(() => {
    onMount();
  }, [onMount]);
  return null;
};

const Parent = () => {
  const { reward, isAnimating } = useReward({ current: null }, first);
  return (
    <>
      <output>{String(isAnimating)}</output>
      <Child onMount={reward} />
    </>
  );
};

/** The target of `HandlerButton`'s hook. */
const handlerTarget = { current: null };

/** A button that passes its events straight to `reward` (ADR 0044). */
const HandlerButton = () => {
  const { reward } = useReward(handlerTarget, first);
  return (
    <button type="button" onClick={reward} onPointerDown={reward}>
      Reward
    </button>
  );
};

afterEach(() => {
  // Rstest has no test globals, so Testing Library can't clean up itself.
  cleanup();
  fired.length = 0;
});

describe('useReward', () => {
  it('fires the effect from the target, with the config and options', () => {
    const target = { current: null };
    const onComplete = () => {};
    const { result } = renderHook(() =>
      useReward(target, first, { count: 3 }, { zIndex: 5, seed: 7, onComplete })
    );
    act(() => {
      result.current.reward();
    });
    expect(fired).toHaveLength(1);
    expect(fired[0]?.effect).toBe(first);
    expect(fired[0]?.options).toEqual({
      origin: target,
      config: { count: 3 },
      zIndex: 5,
      seed: 7,
      onComplete,
    });
  });

  it('takes a union of effects, with the config of either (ADR 0052)', () => {
    // Each config has a field the other's doesn't (ADR 0052).
    const colored = defineEffect({
      name: 'colored',
      blend: 'normal',
      defaults: { count: 1, lifetime: 100, colors: ['#000'] },
      sprites: () => [],
      spawn: () => {},
      update: () => {},
    });
    const sized = defineEffect({
      name: 'sized',
      blend: 'normal',
      defaults: { count: 1, lifetime: 100, size: 4 },
      sprites: () => [],
      spawn: () => {},
      update: () => {},
    });
    const target = { current: null };
    const { result, rerender } = renderHook(
      ({ party }: { party: boolean }) =>
        useReward(target, party ? colored : sized, { colors: ['#fff'] }),
      { initialProps: { party: true } }
    );
    act(() => {
      result.current.reward();
    });
    rerender({ party: false });
    act(() => {
      result.current.reward();
    });
    expect(fired.map((call) => call.effect)).toEqual([colored, sized]);
    // @ts-expect-error `sized` has no colours.
    renderHook(() => useReward(target, sized, { colors: ['#fff'] }));
  });

  it('fires from an origin it is given, and returns the burst', async () => {
    const { result } = renderHook(() =>
      useReward(document.createElement('button'), first)
    );
    let burst: Burst | undefined;
    act(() => {
      burst = result.current.reward({ x: 10, y: 20 });
    });
    expect(fired[0]?.options.origin).toEqual({ x: 10, y: 20 });
    await act(async () => burst?.cancel());
    expect(fired[0]?.how).toBe('cancelled');
    expect(await burst?.finished).toBe('cancelled');
  });

  it('fires from the pointer when it handles a click', () => {
    const { getByRole } = render(<HandlerButton />);
    fireEvent.click(getByRole('button'), {
      clientX: 30,
      clientY: 40,
      detail: 1,
    });
    expect(fired[0]?.options.origin).toEqual({ x: 30, y: 40 });
  });

  it('fires from the target for a click from the keyboard', () => {
    const { getByRole } = render(<HandlerButton />);
    // A keyboard click, like element.click(), has detail 0.
    fireEvent.click(getByRole('button'), { clientX: 0, clientY: 0, detail: 0 });
    expect(fired[0]?.options.origin).toBe(handlerTarget);
  });

  it('fires from the pointer for other pointer events and DOM events', () => {
    const { getByRole } = render(<HandlerButton />);
    // Pointer events always have detail 0.
    fireEvent.pointerDown(getByRole('button'), { clientX: 5, clientY: 6 });
    const { result } = renderHook(() => useReward({ current: null }, first));
    act(() => {
      result.current.reward(
        new MouseEvent('click', { clientX: 7, clientY: 8, detail: 1 })
      );
    });
    expect(fired.map((call) => call.options.origin)).toEqual([
      { x: 5, y: 6 },
      { x: 7, y: 8 },
    ]);
  });

  it('fires from the target for anything that is not an origin', () => {
    const target = { current: null };
    const { result } = renderHook(() => useReward(target, first));
    const others: unknown[] = [
      { x: Number.NaN, y: 1 },
      { clientX: 1, clientY: Number.POSITIVE_INFINITY },
      { type: 'change' },
      'button',
      null,
    ];
    act(() => {
      // As plain JavaScript could call it.
      for (const other of others) result.current.reward(other as Origin);
    });
    expect(fired).toHaveLength(others.length);
    for (const call of fired) expect(call.options.origin).toBe(target);
  });

  it('keeps reward stable, and each call uses the latest arguments', () => {
    interface Props {
      readonly target: RewardTarget;
      readonly effect: typeof first;
      readonly count: number;
      readonly options: RewardOptions;
    }
    const initialProps: Props = {
      target: { current: null },
      effect: first,
      count: 1,
      options: { seed: 1 },
    };
    const element = document.createElement('div');
    const { result, rerender } = renderHook(
      ({ target, effect, count, options }: Props) =>
        // A new config object on every render, as an inline config is.
        useReward(target, effect, { count }, options),
      { initialProps }
    );
    const { reward } = result.current;
    rerender({
      target: element,
      effect: second,
      count: 2,
      options: { seed: 2 },
    });
    expect(result.current.reward).toBe(reward);
    act(() => {
      reward();
    });
    expect(fired[0]?.effect).toBe(second);
    expect(fired[0]?.options).toEqual({
      origin: element,
      config: { count: 2 },
      seed: 2,
    });
  });

  it('is animating until every burst has ended, however it ended', async () => {
    const { result } = renderHook(() => useReward({ current: null }, first));
    expect(result.current.isAnimating).toBe(false);
    act(() => {
      result.current.reward();
      result.current.reward();
      result.current.reward();
    });
    expect(fired).toHaveLength(3);
    expect(result.current.isAnimating).toBe(true);
    await end(fired[0], 'complete');
    await end(fired[1], 'skipped');
    expect(result.current.isAnimating).toBe(true);
    await end(fired[2], 'cancelled');
    expect(result.current.isAnimating).toBe(false);
    act(() => {
      result.current.reward();
    });
    expect(result.current.isAnimating).toBe(true);
  });

  it('cancels the bursts still running when it unmounts', async () => {
    const { result, unmount } = renderHook(() =>
      useReward({ current: null }, first)
    );
    act(() => {
      result.current.reward();
      result.current.reward();
    });
    await end(fired[0], 'complete');
    unmount();
    expect(fired.map((call) => call.how)).toEqual(['complete', 'cancelled']);
  });

  it('cancels a burst started after it unmounted', async () => {
    const { result, unmount } = renderHook(() =>
      useReward({ current: null }, first)
    );
    const { reward } = result.current;
    unmount();
    const burst = reward();
    expect(await burst.finished).toBe('cancelled');
  });

  it('fires once per call in Strict Mode, and cancels on unmount', () => {
    const { result, unmount } = renderHook(
      () => useReward({ current: null }, first),
      { wrapper: StrictMode }
    );
    act(() => {
      result.current.reward();
    });
    expect(fired).toHaveLength(1);
    expect(result.current.isAnimating).toBe(true);
    unmount();
    expect(fired[0]?.how).toBe('cancelled');
  });

  it("keeps a child effect's burst when Strict Mode reconnects it", async () => {
    let view: ReturnType<typeof render> | undefined;
    await act(async () => {
      view = render(
        <StrictMode>
          <Parent />
        </StrictMode>
      );
    });
    // Strict Mode mounts, unmounts and remounts the effects. The child's
    // effect runs before the hook's, so its second call comes in between.
    expect(fired.map((call) => call.how)).toEqual(['cancelled', undefined]);
    expect(view?.container.textContent).toBe('true');
    await end(fired[1], 'complete');
    expect(view?.container.textContent).toBe('false');
  });
});
