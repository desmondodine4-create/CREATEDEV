import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Printer, Star } from 'lucide-react';
import type { CreatorAccount } from '../data/mockData';
import { sanitizeText, sanitizeUrl } from '../utils/sanitize';
import { SPRING_SMOOTH, staggerContainer, staggerItem } from '../utils/motion';
import { EmptyStateIllustration } from '../components/EmptyStateIllustration';

interface CvScreenProps {
  creator: CreatorAccount | null;
}

export function CvScreen({ creator }: CvScreenProps) {
  const prefersReducedMotion = useReducedMotion();

  if (!creator) {
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <EmptyStateIllustration variant="portfolio" />
        <h1 className="font-display text-3xl font-bold text-[var(--text-main)]">CV not found</h1>
        <p className="mx-auto mt-3 text-base text-[var(--text-muted)]">
          We could not find a creator matching this CV link.
        </p>
        <div className="mt-6">
          <a
            href="#/home"
            className="inline-flex min-h-[44px] items-center rounded-xl bg-[var(--btn-cobalt)] px-5 py-2 text-sm font-semibold text-white"
          >
            Back to home
          </a>
        </div>
      </section>
    );
  }

  const safeName = sanitizeText(creator.fullName, 80);
  const safeHeadline = sanitizeText(creator.headline, 120) || 'Creative builder';
  const safeBio = sanitizeText(creator.bio, 600);
  const safeLocation = sanitizeText(creator.location, 80);

  const uniqueTools = Array.from(
    new Set(
      creator.projects.flatMap((p) => p.tools.map((t) => sanitizeText(t, 40))).filter(Boolean)
    )
  );
  const totalConfirmed = creator.invites.filter((i) => i.status === 'confirmed').length;

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Screen-only action bar */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <a
          href={`#/u/${creator.username}`}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-semibold text-[var(--text-main)] hover:border-[var(--accent-cobalt)] hover:text-[var(--accent-cobalt)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to portfolio</span>
        </a>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[var(--btn-cobalt)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--btn-cobalt-hover)] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          <span>Download as PDF</span>
        </button>
      </div>

      {/* Print-friendly CV sheet with shared-element anchors & staggered entrance */}
      <motion.article
        variants={staggerContainer(0.07, 0.04)}
        initial={prefersReducedMotion ? false : 'hidden'}
        animate="visible"
        className="print-sheet rounded-2xl border border-[#14163a]/15 bg-white p-6 text-[#14163a] sm:p-10"
      >
        {/* CV Header */}
        <header className="border-b border-[#14163a]/15 pb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <motion.h1
                layoutId={prefersReducedMotion ? undefined : `creator-name-${creator.username}`}
                transition={{ layout: SPRING_SMOOTH }}
                className="font-display text-3xl font-extrabold tracking-tight text-[#14163a] sm:text-4xl"
              >
                {safeName}
              </motion.h1>
              <motion.p
                layoutId={
                  prefersReducedMotion ? undefined : `creator-headline-${creator.username}`
                }
                transition={{ layout: SPRING_SMOOTH }}
                className="mt-1 font-display text-lg font-semibold text-[#2f3bd9]"
              >
                {safeHeadline}
              </motion.p>
            </div>

            <motion.div variants={staggerItem} className="text-sm text-[#494d72] sm:text-right">
              {safeLocation && <p>{safeLocation}</p>}
              <p>{sanitizeText(creator.email, 120)}</p>
              <p className="font-medium text-[#14163a]">creatdev/#/u/{creator.username}</p>
            </motion.div>
          </div>

          {safeBio && (
            <motion.p
              variants={staggerItem}
              className="mt-5 text-[15px] leading-relaxed text-[#14163a]/85"
            >
              {safeBio}
            </motion.p>
          )}
        </header>

        {/* Tools & Skills */}
        {uniqueTools.length > 0 && (
          <motion.section
            variants={staggerItem}
            className="border-b border-[#14163a]/12 py-5 print-break-inside-avoid"
          >
            <h2 className="font-display text-base font-bold text-[#14163a]">
              Tools and disciplines
            </h2>
            <p className="mt-2 text-sm text-[#14163a]/85">{uniqueTools.join(' · ')}</p>
          </motion.section>
        )}

        {/* Projects & Verified Proof */}
        <motion.section variants={staggerItem} className="pt-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-bold text-[#14163a]">
              Projects and verified vouches
            </h2>
            <span className="text-xs font-semibold text-[#494d72] tabular-nums">
              {totalConfirmed} confirmed {totalConfirmed === 1 ? 'vouch' : 'vouches'}
            </span>
          </div>

          {creator.projects.length === 0 ? (
            <p className="mt-4 text-sm text-[#494d72]">
              No projects listed yet. Add projects in the dashboard to populate this CV.
            </p>
          ) : (
            <div className="mt-5 space-y-6">
              {creator.projects.map((project) => {
                const safeTitle = sanitizeText(project.title, 120);
                const safeRole = sanitizeText(project.role, 100);
                const safeStory = sanitizeText(project.story, 600);
                const safeLink = sanitizeUrl(project.link);
                const vouches = creator.invites.filter(
                  (inv) => inv.projectId === project.id && inv.status === 'confirmed'
                );

                return (
                  <motion.div
                    key={project.id}
                    variants={staggerItem}
                    className="print-break-inside-avoid border-b border-[#14163a]/10 pb-5 last:border-b-0 last:pb-0"
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                      <motion.h3
                        layoutId={
                          prefersReducedMotion ? undefined : `project-card-title-${project.id}`
                        }
                        transition={{ layout: SPRING_SMOOTH }}
                        className="font-display text-lg font-bold text-[#14163a]"
                      >
                        {safeTitle}
                      </motion.h3>
                      <span className="text-sm font-medium text-[#2f3bd9]">{safeRole}</span>
                    </div>

                    {project.tools.length > 0 && (
                      <p className="mt-1 text-xs font-medium text-[#494d72]">
                        {project.tools.map((t) => sanitizeText(t, 40)).join(' · ')}
                      </p>
                    )}

                    {safeStory && (
                      <p className="mt-2 text-sm leading-relaxed text-[#14163a]/85">
                        {safeStory}
                      </p>
                    )}

                    {safeLink && (
                      <p className="mt-1.5 text-xs text-[#2f3bd9]">{safeLink}</p>
                    )}

                    {vouches.length > 0 && (
                      <div className="mt-3 rounded-xl border border-[#8fd9b2] bg-[#c9f2dc]/45 p-3.5">
                        <p className="text-xs font-bold text-[#14163a]">Verified vouches</p>
                        <ul className="mt-2 space-y-2">
                          {vouches.map((v) => (
                            <li key={v.id} className="text-sm text-[#14163a]">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <CheckCircle2
                                  className="h-3.5 w-3.5 text-[#14163a]"
                                  aria-hidden="true"
                                />
                                <span className="font-semibold">
                                  {sanitizeText(v.inviteeName, 80)}
                                </span>
                                <span aria-hidden="true" className="text-[#14163a]/40">
                                  ·
                                </span>
                                <span className="text-xs text-[#14163a]/80">
                                  {v.type === 'client' ? 'Client' : 'Collaborator'}
                                </span>
                                {v.type === 'client' && typeof v.rating === 'number' && (
                                  <span className="inline-flex items-center gap-1 text-xs font-semibold tabular-nums">
                                    <Star
                                      className="h-3 w-3 fill-[#14163a] text-[#14163a]"
                                      aria-hidden="true"
                                    />
                                    {v.rating}/5
                                  </span>
                                )}
                              </div>
                              {v.testimonial && (
                                <p className="mt-0.5 pl-5 text-xs italic text-[#14163a]/85">
                                  “{sanitizeText(v.testimonial, 240)}”
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.section>
      </motion.article>
    </section>
  );
}
