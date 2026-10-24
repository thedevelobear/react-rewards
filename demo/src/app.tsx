import { useEffect, useRef } from 'react';
import { EffectView } from '@/components/effect-view';
import { Header } from '@/components/header';
import { PageTitle } from '@/components/page-title';
import { Pager } from '@/components/pager';
import { Sidebar, type SidebarGroup } from '@/components/sidebar';
import { api, findArticle, gettingStarted, guides } from '@/data/articles';
import { effects, findEffect } from '@/data/effects';
import { useHash } from '@/hooks/use-hash';

const GROUPS: readonly SidebarGroup[] = [
  { heading: 'Guides', links: guides },
  { heading: 'API', links: api },
  { heading: 'Effects', links: effects },
];

/** Every page, in the sidebar's order, for the pager. */
const PAGES = GROUPS.flatMap((group) => group.links);

/** The heading of the sidebar group that holds the page `name`. */
const groupOf = (name: string): string =>
  GROUPS.find((group) => group.links.some((link) => link.name === name))
    ?.heading ?? '';

/**
 * The preview site. A hash that names no page shows Getting started (README,
 * "Routing"). The browser specs use the fixture page (ADR 0045).
 */
export const App = () => {
  const hash = useHash();
  const effect = findEffect(hash);
  const article = findArticle(hash) ?? gettingStarted;
  const page = effect ?? article;
  const Content = article.content;

  useEffect(() => {
    document.title = `${page.label} · react-rewards`;
  }, [page.label]);

  // A new page starts at its top, as the pager's links are at the bottom.
  const shown = useRef(page.name);
  useEffect(() => {
    if (shown.current === page.name) return;
    shown.current = page.name;
    window.scrollTo(0, 0);
  }, [page.name]);

  return (
    <>
      <Header />
      <div className="layout">
        <Sidebar groups={GROUPS} current={page.name} />
        <main className="content">
          <PageTitle
            group={groupOf(page.name)}
            title={page.label}
            description={page.description}
          />
          {effect ? (
            // Keyed by the effect, so its settings and tab start afresh.
            effect.use((typed) => (
              <EffectView key={typed.effect.name} page={typed} />
            ))
          ) : (
            <Content />
          )}
          <Pager pages={PAGES} current={page.name} />
        </main>
      </div>
    </>
  );
};
