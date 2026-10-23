import { useEffect } from 'react';
import { EffectView } from '@/components/effect-view';
import { GettingStarted } from '@/components/getting-started';
import { Header } from '@/components/header';
import { PageTitle } from '@/components/page-title';
import { Sidebar, type SidebarGroup } from '@/components/sidebar';
import { effects, findEffect } from '@/data/effects';
import { gettingStarted, guides } from '@/data/guides';
import { useHash } from '@/hooks/use-hash';

const GROUPS: readonly SidebarGroup[] = [
  { heading: 'Guides', links: guides },
  { heading: 'Effects', links: effects },
];

/**
 * The preview site. A hash that names no effect shows Getting started
 * (ADR 0055). The browser specs use the fixture page (ADR 0045).
 */
export const App = () => {
  const effect = findEffect(useHash());
  const page = effect ?? gettingStarted;

  useEffect(() => {
    document.title = `${page.label} · react-rewards`;
  }, [page.label]);

  return (
    <>
      <Header />
      <div className="layout">
        <Sidebar groups={GROUPS} current={page.name} />
        <main className="content">
          <PageTitle title={page.label} description={page.description} />
          {effect ? (
            // Keyed by the effect, so its settings and tab start afresh.
            effect.use((typed) => (
              <EffectView key={typed.effect.name} page={typed} />
            ))
          ) : (
            <GettingStarted />
          )}
        </main>
      </div>
    </>
  );
};
