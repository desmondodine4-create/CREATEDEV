import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, CheckCircle2, FileText, MapPin, Search } from 'lucide-react';
import {
  DISCIPLINE_OPTIONS,
  type CreatorAccount,
  type DisciplineCategory,
} from '../data/mockData';
import { sanitizeText } from '../utils/sanitize';
import { EASE_STUDIO, SPRING_SMOOTH } from '../utils/motion';
import { EmptyStateIllustration } from '../components/EmptyStateIllustration';

interface ExploreScreenProps {
  accounts: CreatorAccount[];
}

const FILTER_OPTIONS: Array<'All' | DisciplineCategory> = ['All', ...DISCIPLINE_OPTIONS];

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function ExploreScreen({ accounts }: ExploreScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const [query, setQuery] = useState('');
  const [discipline, setDiscipline] = useState<'All' | DisciplineCategory>('All');
  const [failedAvatars, setFailedAvatars] = useState<Record<string, boolean>>({});

  const publicCreators = useMemo(
    () => accounts.filter((acc) => acc.projects.length > 0 || acc.headline.trim().length > 0),
    [accounts]
  );

  const filteredCreators = useMemo(() => {
    const q = query.trim().toLowerCase();
    return publicCreators.filter((creator) => {
      if (discipline !== 'All' && creator.discipline !== discipline) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        creator.fullName,
        creator.headline,
        creator.location,
        ...creator.projects.flatMap((p) => [p.title, p.role, ...p.tools]),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [publicCreators, query, discipline]);

  return (
    <div>
      {/* Header band */}
      <section className="studio-grid-bg border-b border-[var(--border-line)] bg-[var(--bg-canvas)]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[var(--accent-cobalt)]">CREATDEV directory</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[var(--text-main)] sm:text-5xl">
              Verified creatives and engineers ready to ship
            </h1>
            <p className="mt-3 text-base text-[var(--text-muted)]">
              Every badge on these portfolios was confirmed by a real collaborator or paying client.
            </p>
          </div>

          {/* Search & Discipline Filter Bar */}
          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <label htmlFor="explore-search" className="sr-only">
                Search by name, role, or tool
              </label>
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden="true"
              />
              <input
                id="explore-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, city, Figma, React, PHP..."
                className="min-h-[44px] w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] pl-10 pr-4 py-2 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--accent-cobalt)] focus:outline-none"
              />
            </div>

            <div
              role="tablist"
              aria-label="Filter by discipline"
              className="flex flex-wrap items-center gap-1 rounded-xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-1"
            >
              {FILTER_OPTIONS.map((option) => {
                const active = discipline === option;
                return (
                  <button
                    key={option}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setDiscipline(option)}
                    className={`relative z-10 min-h-[38px] rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer sm:text-sm ${
                      active
                        ? 'text-[var(--btn-ink-text)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="explore-filter-pill"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                        className="absolute inset-0 -z-10 rounded-lg bg-[var(--btn-ink)]"
                      />
                    )}
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Creators Grid */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {filteredCreators.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)] p-10 text-center">
            <EmptyStateIllustration variant="portfolio" />
            <h2 className="font-display text-xl font-bold text-[var(--text-main)]">
              No matching creators yet
            </h2>
            <p className="mx-auto mt-2 text-sm text-[var(--text-muted)]">
              Try clearing your search or switching back to “All” disciplines.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setDiscipline('All');
              }}
              className="mt-5 inline-flex min-h-[42px] items-center rounded-xl bg-[var(--btn-cobalt)] px-5 py-2 text-sm font-semibold text-white cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {filteredCreators.map((creator, idx) => {
                const safeName = sanitizeText(creator.fullName, 80);
                const safeHeadline = sanitizeText(creator.headline, 120);
                const safeLocation = sanitizeText(creator.location, 80);
                const confirmedCount = creator.invites.filter(
                  (i) => i.status === 'confirmed'
                ).length;
                const tools = Array.from(
                  new Set(creator.projects.flatMap((p) => p.tools))
                ).slice(0, 5);
                const showAvatar =
                  Boolean(creator.avatarUrl) && !failedAvatars[creator.id];

                return (
                  <motion.article
                    key={creator.id}
                    layout={!prefersReducedMotion}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96 }}
                    transition={{
                      layout: SPRING_SMOOTH,
                      duration: 0.3,
                      delay: prefersReducedMotion ? 0 : idx * 0.05,
                      ease: EASE_STUDIO,
                    }}
                    className="flex flex-col justify-between rounded-2xl border border-[var(--border-line)] bg-[var(--bg-surface)] p-6 transition-colors hover:border-[var(--accent-cobalt)]"
                  >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {showAvatar ? (
                          <motion.img
                            layoutId={
                              prefersReducedMotion
                                ? undefined
                                : `creator-avatar-${creator.username}`
                            }
                            transition={{ layout: SPRING_SMOOTH }}
                            src={creator.avatarUrl}
                            alt={`${safeName} portrait`}
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setFailedAvatars((prev) => ({
                                ...prev,
                                [creator.id]: true,
                              }))
                            }
                            className="h-16 w-16 shrink-0 rounded-xl object-cover border border-[var(--border-line)]"
                          />
                        ) : (
                          <motion.div
                            layoutId={
                              prefersReducedMotion
                                ? undefined
                                : `creator-avatar-${creator.username}`
                            }
                            transition={{ layout: SPRING_SMOOTH }}
                            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#2f3bd9] font-display text-xl font-bold text-white"
                            aria-hidden="true"
                          >
                            {getInitials(safeName)}
                          </motion.div>
                        )}

                        <div>
                          <motion.h2
                            layoutId={
                              prefersReducedMotion
                                ? undefined
                                : `creator-name-${creator.username}`
                            }
                            transition={{ layout: SPRING_SMOOTH }}
                            className="font-display text-xl font-bold text-[var(--text-main)]"
                          >
                            {safeName}
                          </motion.h2>
                          <motion.p
                            layoutId={
                              prefersReducedMotion
                                ? undefined
                                : `creator-headline-${creator.username}`
                            }
                            transition={{ layout: SPRING_SMOOTH }}
                            className="text-sm font-medium text-[var(--accent-cobalt)]"
                          >
                            {safeHeadline}
                          </motion.p>
                          {safeLocation && (
                            <p className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>{safeLocation}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#7fd0a5] bg-[#c9f2dc] px-2.5 py-1 text-xs font-bold text-[#14163a] tabular-nums">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        {confirmedCount} {confirmedCount === 1 ? 'vouch' : 'vouches'}
                      </span>
                    </div>

                    {creator.bio && (
                      <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">
                        {sanitizeText(creator.bio, 220)}
                      </p>
                    )}

                    {tools.length > 0 && (
                      <p className="mt-3 text-xs font-medium text-[var(--text-muted)]">
                        {tools.join(' · ')}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-line)] pt-4">
                    <span className="text-xs font-medium text-[var(--text-muted)]">
                      {creator.availability || `${creator.projects.length} projects`}
                    </span>

                    <div className="flex items-center gap-2.5">
                      <a
                        href={`#/u/${creator.username}/cv`}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[var(--border-line)] bg-[var(--bg-subtle)] px-3.5 py-1.5 text-xs font-semibold text-[var(--text-main)] hover:border-[var(--accent-cobalt)] hover:text-[var(--accent-cobalt)] transition-colors"
                      >
                        <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>View CV</span>
                      </a>
                      <a
                        href={`#/u/${creator.username}`}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[var(--btn-ink)] px-4 py-1.5 text-xs font-semibold text-[var(--btn-ink-text)] hover:bg-[var(--btn-cobalt)] hover:text-white transition-colors"
                      >
                        <span>Open portfolio</span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </motion.article>
              );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}
