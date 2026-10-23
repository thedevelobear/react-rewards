import { useEffect } from 'react';
import { Header } from '@/components/header';
import { PageTitle } from '@/components/page-title';
import { Preview } from '@/components/preview';
import { Sidebar } from '@/components/sidebar';
import { effects, findEffect } from '@/data/effects';
import { useHash } from '@/hooks/use-hash';

/** The preview site. The browser specs use the fixture page (ADR 0045). */
export const App = () => {
  const page = findEffect(useHash());

  useEffect(() => {
    document.title = `${page.label} · react-rewards`;
  }, [page.label]);

  return (
    <>
      <Header />
      <div className="layout">
        <Sidebar effects={effects} current={page.name} />
        <main className="content">
          <PageTitle title={page.label} description={page.description} />
          {page.use((typed) => (
            <Preview page={typed} />
          ))}
        </main>
      </div>
    </>
  );
};
