import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Menu, Moon, Sun, X } from 'lucide-react';
import { FEATURED_CREATOR_USERNAME, type CreatorAccount } from '../data/mockData';
import { SPRING_SNAPPY } from '../utils/motion';

interface NavbarProps {
  currentUser: CreatorAccount | null;
  currentRoute: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
}

export function Navbar({
  currentUser,
  currentRoute,
  theme,
  onToggleTheme,
  onLogout,
}: NavbarProps) {
  const prefersReducedMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isOverview = currentRoute === '/home' || (!currentUser && currentRoute === '/');
  const isExplore = currentRoute === '/explore';
  const isFeatured = currentRoute === `/u/${FEATURED_CREATOR_USERNAME}`;
  const isDashboard =
    currentRoute === '/dashboard' || (Boolean(currentUser) && currentRoute === '/');
  const isAuth = currentRoute === '/auth';

  return (
    <header className="no-print border-b border-[var(--border-line)] bg-[var(--bg-canvas)]/95 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3.5 sm:gap-8 sm:px-6">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#/"
          onClick={() => setMobileOpen(false)}
          className="inline-flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight text-[var(--text-main)] whitespace-nowrap shrink-0"
        >
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect x="2" y="2" width="15" height="15" rx="4" fill="#3b48e8" />
            <circle cx="19" cy="19" r="7" fill="#c9f2dc" stroke="#14163a" strokeWidth="2" />
            <circle cx="21" cy="7" r="3" fill="#ff9f43" />
          </svg>
          <span>CREATDEV</span>
        </a>

        {/* Zone 2: Clean single-line nav links */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[var(--text-muted)]"
        >
          <a
            href="#/home"
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[var(--accent-cobalt)] ${
              isOverview
                ? 'text-[var(--text-main)] underline decoration-[var(--accent-cobalt)] decoration-2 underline-offset-4'
                : ''
            }`}
          >
            Welcome
          </a>
          <a
            href="#/explore"
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[var(--accent-cobalt)] ${
              isExplore
                ? 'text-[var(--text-main)] underline decoration-[var(--accent-cobalt)] decoration-2 underline-offset-4'
                : ''
            }`}
          >
            Explore
          </a>
          <a
            href={`#/u/${FEATURED_CREATOR_USERNAME}`}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[var(--accent-cobalt)] ${
              isFeatured
                ? 'text-[var(--text-main)] underline decoration-[var(--accent-cobalt)] decoration-2 underline-offset-4'
                : ''
            }`}
          >
            Featured
          </a>

          {currentUser ? (
            <>
              <a
                href="#/dashboard"
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-[var(--accent-cobalt)] ${
                  isDashboard
                    ? 'text-[var(--text-main)] underline decoration-[var(--accent-cobalt)] decoration-2 underline-offset-4'
                    : ''
                }`}
              >
                Dashboard
              </a>
              <button
                type="button"
                onClick={onLogout}
                className="whitespace-nowrap shrink-0 text-left text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
              >
                Log out
              </button>
            </>
          ) : (
            <a
              href="#/auth?mode=login"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-[var(--accent-cobalt)] ${
                isAuth
                  ? 'text-[var(--text-main)] underline decoration-[var(--accent-cobalt)] decoration-2 underline-offset-4'
                  : ''
              }`}
            >
              Sign in
            </a>
          )}
        </nav>

        {/* Zone 3: Theme switch + primary CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] text-[var(--text-main)] hover:border-[var(--accent-cobalt)] hover:text-[var(--accent-cobalt)] transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-[#ff9f43]" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          {currentUser ? (
            <a
              href={`#/u/${currentUser.username}`}
              className="hidden md:inline-flex min-h-[38px] items-center justify-center rounded-full bg-[var(--btn-ink)] px-4 py-1.5 text-xs font-semibold text-[var(--btn-ink-text)] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
            >
              View portfolio
            </a>
          ) : (
            <motion.a
              href="#/auth?mode=signup"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              transition={SPRING_SNAPPY}
              className="group relative hidden md:inline-flex min-h-[38px] items-center justify-center gap-1.5 overflow-hidden rounded-full bg-[var(--btn-ink)] px-4 py-1.5 text-xs font-semibold text-[var(--btn-ink-text)] hover:opacity-95 transition-opacity whitespace-nowrap shrink-0"
            >
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
              <span>Get started</span>
            </motion.a>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] text-[var(--text-main)] md:hidden cursor-pointer"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-[var(--border-line)] bg-[var(--bg-surface)] px-4 py-4 md:hidden"
        >
          <div className="flex flex-col gap-2">
            <a
              href="#/home"
              onClick={() => setMobileOpen(false)}
              className="flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
            >
              Welcome
            </a>
            <a
              href="#/explore"
              onClick={() => setMobileOpen(false)}
              className="flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
            >
              Explore talent
            </a>
            <a
              href={`#/u/${FEATURED_CREATOR_USERNAME}`}
              onClick={() => setMobileOpen(false)}
              className="flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
            >
              Featured portfolio
            </a>

            {currentUser ? (
              <>
                <a
                  href="#/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
                >
                  Dashboard
                </a>
                <a
                  href={`#/u/${currentUser.username}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
                >
                  View portfolio
                </a>
                <a
                  href={`#/u/${currentUser.username}/cv`}
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
                >
                  My CV
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onLogout();
                  }}
                  className="flex min-h-[44px] w-full items-center rounded-lg px-3 text-left text-base font-medium text-[var(--danger)] hover:bg-[var(--danger-bg)]"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <a
                  href="#/auth?mode=login"
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium text-[var(--text-main)] hover:bg-[var(--bg-subtle)]"
                >
                  Sign in
                </a>
                <a
                  href="#/auth?mode=signup"
                  onClick={() => setMobileOpen(false)}
                  className="mt-1 flex min-h-[44px] items-center justify-center rounded-xl bg-[var(--btn-cobalt)] px-4 text-base font-semibold text-white"
                >
                  Get started
                </a>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
