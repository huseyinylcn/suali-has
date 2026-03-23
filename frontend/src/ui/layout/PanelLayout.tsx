import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BookPlus, GraduationCap, Menu, X } from 'lucide-react';
import { cn } from '../utils/cn';
import { ThemeToggle } from '../components/ThemeToggle';

export function PanelLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-[var(--gh-canvas-subtle)] text-[var(--gh-navbar-fg)] ring-1 ring-[var(--gh-navbar-border)]'
        : 'text-[var(--gh-navbar-fg-muted)] hover:bg-[var(--gh-canvas-subtle)] hover:text-[var(--gh-navbar-fg)]'
    );

  return (
    <div className="min-h-full bg-[var(--gh-canvas)] text-[var(--gh-fg)]">

      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-40 border-b border-[var(--gh-navbar-border)] bg-[var(--gh-navbar)]">
        <div className="flex h-16 items-center gap-3 px-3 md:px-5">

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
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[var(--gh-navbar-border)] bg-[var(--gh-navbar)] transition-transform duration-200',
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Drawer header */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--gh-navbar-border)] px-4">
          <div className="flex items-center gap-2 text-[var(--gh-navbar-fg)]">
            <GraduationCap className="h-5 w-5 text-[var(--gh-primary)]" />
            <span className="font-semibold">Suali-Has</span>
          </div>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--gh-navbar-fg-muted)] hover:bg-[var(--gh-canvas-subtle)] hover:text-[var(--gh-navbar-fg)]"
            onClick={() => setDrawerOpen(false)}
            aria-label="Menüyü kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-[var(--gh-navbar-fg-muted)]">
            İçerik Paneli
          </p>
          <NavLink
            to="/questions/add"
            className={navLinkClass}
            onClick={() => setDrawerOpen(false)}
          >
            <BookPlus className="h-4 w-4" />
            Soru Ekle
          </NavLink>
        </nav>

        {/* Drawer footer */}
        <div className="border-t border-[var(--gh-navbar-border)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--gh-navbar-fg-muted)]">Tema</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* ─── Page content ─── */}
      <main className="min-w-0 py-2 md:px-4 md:py-4">
        <Outlet />
      </main>
    </div>
  );
}
