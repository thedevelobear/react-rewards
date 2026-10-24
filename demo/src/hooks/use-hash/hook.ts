import { useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
};

const read = () => window.location.hash.slice(1);

/**
 * The URL hash without its `#`. It follows links, typed URLs, and the back
 * and forward buttons (README, "Routing").
 */
export const useHash = (): string => useSyncExternalStore(subscribe, read);
