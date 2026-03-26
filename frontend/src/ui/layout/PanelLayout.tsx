import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BookPlus, GraduationCap, ListChecks, Menu, X } from 'lucide-react';
import { cn } from '../utils/cn';
import { ThemeToggle } from '../components/ThemeToggle';

function drawerNavLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'mx-2 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium leading-snug transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gh-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--gh-navbar)]',
    isActive
      ? 'bg-[var(--gh-canvas-subtle)] text-[var(--gh-navbar-fg)]'
      : 'text-[var(--gh-navbar-fg-muted)] hover:bg-[var(--gh-canvas-subtle)] hover:text-[var(--gh-navbar-fg)]'
  );
}

export function PanelLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-full bg-[var(--gh-canvas)] text-[var(--gh-fg)]">

      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-40 bg-[var(--gh-navbar)]">
        <div className="flex h-14 items-center gap-3 px-3 md:px-5">

          {/* Hamburger */}
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--gh-navbar-fg-muted)] hover:bg-[var(--gh-canvas-subtle)] hover:text-[var(--gh-navbar-fg)]"
            onClick={() => setDrawerOpen(true)}
            aria-label="Menüyü aç"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2 text-[var(--gh-navbar-fg)]">
            <GraduationCap className="h-5 w-5 text-[var(--gh-primary)]" />
            <span className="font-semibold leading-none">Suali-Has</span>
          </div>

          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ─── Backdrop ─── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ─── Slide-in Drawer ─── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[min(292px,100vw-1rem)] flex-col border-r border-[var(--gh-navbar-border)] bg-[var(--gh-navbar)] shadow-xl transition-transform duration-200 ease-out',
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-hidden={!drawerOpen}
      >
        {/* Üst: logo + kapat — GitHub mobil menü benzeri */}
        <div className="flex shrink-0 items-center justify-between px-4 pb-3 pt-4">
          <div className="flex min-w-0 items-center gap-2.5 text-[var(--gh-navbar-fg)]">
            <GraduationCap className="h-6 w-6 shrink-0 text-[var(--gh-primary)]" strokeWidth={1.5} />
            <span className="truncate text-base font-semibold tracking-tight">Suali-Has</span>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--gh-navbar-fg-muted)] hover:bg-[var(--gh-canvas-subtle)] hover:text-[var(--gh-navbar-fg)]"
            onClick={() => setDrawerOpen(false)}
            aria-label="Menüyü kapat"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="mx-4 border-t border-[var(--gh-navbar-border)]" />

        <div className="flex min-h-0 flex-1 flex-col">
          <nav className="min-h-0 flex-1 overflow-y-auto px-1 py-3" aria-label="Panel menüsü">
            <p className="mb-1.5 px-3 text-xs font-semibold text-[var(--gh-navbar-fg-muted)]">İçerik</p>
            <div className="flex flex-col gap-0.5">
            <NavLink
              to="/questions"
              end
              className={drawerNavLinkClass}
              onClick={() => setDrawerOpen(false)}
            >
                <ListChecks className="h-[18px] w-[18px] shrink-0 opacity-90" strokeWidth={1.5} />
                Sorular
              </NavLink>
              <NavLink
                to="/questions/add"
                className={drawerNavLinkClass}
                onClick={() => setDrawerOpen(false)}
              >
                <BookPlus className="h-[18px] w-[18px] shrink-0 opacity-90" strokeWidth={1.5} />
                Soru Ekle
              </NavLink>
            </div>
          </nav>

          <div className="shrink-0 border-t border-[var(--gh-navbar-border)] px-4 py-3">
            <p className="mb-2 text-xs font-semibold text-[var(--gh-navbar-fg-muted)]">Görünüm</p>
            <div className="mx-0 flex items-center justify-between gap-3 rounded-md px-3 py-2">
              <span className="text-sm text-[var(--gh-navbar-fg-muted)]">Tema</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Page content ─── */}
      <main className="min-w-0 overflow-x-hidden py-2 md:px-4 md:py-4">
        <Outlet />
      </main>
    </div>
  );
}
