![react-rewards logo](assets/react-rewards.png?raw=true "react-rewards")

[![npm version](https://badge.fury.io/js/react-rewards.svg)](https://badge.fury.io/js/react-rewards) [![forthebadge](https://forthebadge.com/images/badges/makes-people-smile.svg)](https://forthebadge.com)

❇️ **GPU-rendered**: WebGL2, with a Canvas 2D fallback

🌲 **Tree-shakeable**: about 7.5 kB gzipped for `useReward` and confetti

🕵️ **Built with TypeScript**

⏱️ **Frame-rate independent**, and quiet for people who prefer reduced motion

**React-rewards** lets you add micro-interactions to your app, and rewards users with the rain of confetti, emoji, balloons or fireworks, or a pop of stars, in seconds.
Firing confetti all over the page may seem like a questionable idea, but keep in mind that rewarding users for their actions is not.
If a huge cloud of smiling emoji doesn't fit your application well, try changing the physics config to make it more subtle.

You can read more on the subject of micro-interactions in my blog post - https://www.thedevelobear.com/post/microinteractions/

## Docs and demo

**[thedevelobear.github.io/react-rewards](https://thedevelobear.github.io/react-rewards/)** has every effect live, with its settings and the code for what you pick, and the docs:

- [Getting started](https://thedevelobear.github.io/react-rewards/#getting-started)
- [`useReward`](https://thedevelobear.github.io/react-rewards/#use-reward): its settings, burst options and return value
- [`fire`](https://thedevelobear.github.io/react-rewards/#fire): effects without React
- [Renderers](https://thedevelobear.github.io/react-rewards/#renderers): WebGL2, Canvas 2D and `setRenderer`
- [Custom effects](https://thedevelobear.github.io/react-rewards/#custom-effects) with `defineEffect`
- [Server rendering](https://thedevelobear.github.io/react-rewards/#server-rendering)
- [Upgrading from v2](https://thedevelobear.github.io/react-rewards/#upgrading-from-v2)

## Installation

```sh
pnpm add react-rewards
# or
npm install react-rewards
# or
yarn add react-rewards
```

React 18 or later. The package is ESM only.

## Usage

Give `useReward` a ref to the element a reward starts from, and an effect. Each call to `reward()` fires a burst from the centre of that element.

```tsx
import { useRef } from 'react';
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
```

The effects are `confetti`, `emoji`, `balloon`, `firework` and `pop`, and each has its settings on [its page of the docs](https://thedevelobear.github.io/react-rewards/#confetti).

## Support

- React 18 or later.
- Chrome and Edge 87, Firefox 79, and Safari 14.1 (iOS 14.5), or later. Bursts draw with WebGL2 where it's available, and with Canvas 2D elsewhere.
- The package can be imported on the server: nothing touches `window` until a burst fires.
- Only the latest major version gets fixes.

Versions follow [semver](https://github.com/thedevelobear/react-rewards/blob/master/docs/decisions/0075-versioning-policy.md). A patch fixes something. A minor adds something, or changes how a built-in effect looks, and the changelog gives the old settings to keep the old look. A major can break your code, and whatever it removes is deprecated in a minor first.

## Contributing

The repo uses pnpm, and records its decisions in [`docs/`](docs/README.md). Start with [`AGENTS.md`](AGENTS.md) for the commands.

## License

MIT
