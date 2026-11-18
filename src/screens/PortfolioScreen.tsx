import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Check, FileText, Mail, MapPin, Pencil, Share2 } from 'lucide-react';
import {
  FEATURED_CREATOR_USERNAME,
  type CreatorAccount,
  type Project,
} from '../data/mockData';
import { sanitizeText } from '../utils/sanitize';
import { SPRING_SMOOTH, staggerContainer, staggerItem } from '../utils/motion';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectLightboxModal } from '../components/ProjectLightboxModal';
import { EmptyStateIllustration } from '../components/EmptyStateIllustration';

interface PortfolioScreenProps {
  creator: CreatorAccount | null;
  isOwner: boolean;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function PortfolioScreen({ creator, isOwner }: PortfolioScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [inspectedProject, setInspectedProject] = useState<Project | null>(null);

  if (!creator) {
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <EmptyStateIllustration variant="portfolio" />
        <h1 className="font-display text-3xl font-bold text-[var(--text-main)]">
          Portfolio not found
        </h1>
        <p className="mx-auto mt-3 text-base text-[var(--text-muted)]">
          No creator matches this link yet. Check the username or explore the talent directory.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a
            href="#/explore"
            className="inline-flex min-h-[46px] items-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-5 py-2.5 text-sm font-semibold text-[var(--text-main)] hover:border-[var(--accent-cobalt)]"
          >
            Explore talent directory
          </a>
          <a
            href={`#/u/${FEATURED_CREATOR_USERNAME}`}
            className="inline-flex min-h-[46px] items-center rounded-xl bg-[var(--btn-cobalt)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--btn-cobalt-hover)]"
          >
            View featured portfolio
          </a>
        </div>
      </section>
    );
  }

  const confirmedVouches = creator.invites.filter((i) => i.status === 'confirmed');
  const safeName = sanitizeText(creator.fullName, 80);
  const safeHeadline = sanitizeText(creator.headline, 120) || 'Creative builder';
  const safeBio = sanitizeText(creator.bio, 600);
  const safeLocation = sanitizeText(creator.location, 80);
  const safeEmail = sanitizeText(creator.email, 120);
  const safeAvailability = creator.availability ? sanitizeText(creator.availability, 80) : '';
  const showAvatar = Boolean(creator.avatarUrl) && !avatarFailed;

  async function handleCopyEmail() {
    if (!safeEmail) return;
    try {
      await navigator.clipboard.writeText(safeEmail);
    } catch {
      // Fallback visual confirmation
    }
    setCopiedEmail(true);
    window.setTimeout(() => setCopiedEmail(false), 2000);
  }

  async function handleCopyPortfolioLink() {
    if (!creator) return;
    const base = window.location.href.split('#')[0];
    const url = `${base}#/u/${creator.username}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback visual confirmation
    }
    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 2000);
  }

  return (
    <div>
      {/* Portfolio architectural header with shared-element profile anchors */}
      <section className="relative overflow-hidden border-b border-[var(--border-line)] bg-[#10132e] text-white">
        <svg
          viewBox="0 0 420 260"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-6 hidden h-64 w-96 sm:block"
        >
          <g className="animate-orbit-slow" style={{ transformOrigin: '260px 130px' }}>
            <circle
              cx="260"
              cy="130"
              r="96"
              stroke="#f6f7fb"
              strokeOpacity="0.16"
              strokeWidth="1.25"
              strokeDasharray="4 7"
            />
            <circle cx="356" cy="130" r="4" fill="#c9f2dc" />
          </g>
          <circle cx="290" cy="90" r="56" fill="#2f3bd9" fillOpacity="0.48" />
          <circle cx="198" cy="175" r="22" fill="#ff9f43" />
        </svg>

        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <motion.div
              variants={staggerContainer(0.06, 0.04)}
              initial={prefersReducedMotion ? false : 'hidden'}
              animate="visible"
              className="flex flex-col gap-5 sm:flex-row sm:items-start max-w-3xl"
            >
              {showAvatar ? (
                <motion.img
                  layoutId={
                    prefersReducedMotion ? undefined : `creator-avatar-${creator.username}`
                  }
                  transition={{ layout: SPRING_SMOOTH }}
                  src={creator.avatarUrl}
                  alt={`${safeName} studio portrait`}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarFailed(true)}
                  className="h-24 w-24 shrink-0 rounded-2xl object-cover border-2 border-white/25 sm:h-28 sm:w-28"
                />
              ) : (
                <motion.div
                  layoutId={
                    prefersReducedMotion ? undefined : `creator-avatar-${creator.username}`
                  }
                  transition={{ layout: SPRING_SMOOTH }}
                  className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-2 border-[#c9f2dc]/40 bg-[#2f3bd9] font-display text-3xl font-extrabold text-white sm:h-28 sm:w-28"
                  aria-hidden="true"
                >
                  {getInitials(safeName)}
                </motion.div>
              )}

              <div>
                <motion.div
                  variants={staggerItem}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#f6f7fb]/80"
                >
                  {safeLocation && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-[#ff9f43]" aria-hidden="true" />
                      <span>{safeLocation}</span>
                    </span>
                  )}
                  {safeLocation && <span aria-hidden="true">·</span>}
                  <span className="font-semibold text-[#c9f2dc] tabular-nums">
                    {confirmedVouches.length} confirmed{' '}
                    {confirmedVouches.length === 1 ? 'vouch' : 'vouches'}
                  </span>
                  {safeAvailability && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{safeAvailability}</span>
                    </>
                  )}
                </motion.div>

                <motion.h1
                  layoutId={
                    prefersReducedMotion ? undefined : `creator-name-${creator.username}`
                  }
                  transition={{ layout: SPRING_SMOOTH }}
                  className="mt-2 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
                >
                  {safeName}
                </motion.h1>

                <motion.p
                  layoutId={
                    prefersReducedMotion ? undefined : `creator-headline-${creator.username}`
                  }
                  transition={{ layout: SPRING_SMOOTH }}
                  className="mt-1.5 font-display text-xl font-semibold text-[#c9f2dc] sm:text-2xl"
                >
                  {safeHeadline}
                </motion.p>

                {safeBio && (
                  <motion.p
                    variants={staggerItem}
                    className="mt-3.5 text-base leading-relaxed text-[#f6f7fb]/85"
                  >
                    {safeBio}
                  </motion.p>
                )}
              </div>
            </motion.div>

            <motion.div
              variants={staggerContainer(0.05, 0.1)}
              initial={prefersReducedMotion ? false : 'hidden'}
              animate="visible"
              className="flex flex-wrap items-center gap-2.5 shrink-0"
            >
              {safeEmail && (
                <motion.button
                  variants={staggerItem}
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="h-4 w-4 text-[#c9f2dc]" aria-hidden="true" />
                      <span>Email copied</span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" aria-hidden="true" />
                      <span>Copy email</span>
                    </>
                  )}
                </motion.button>
              )}

              <motion.button
                variants={staggerItem}
                type="button"
                onClick={handleCopyPortfolioLink}
                className="inline-flex min-h-[46px] items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-4 w-4 text-[#c9f2dc]" aria-hidden="true" />
                    <span>Link copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                    <span>Share link</span>
                  </>
                )}
              </motion.button>

              {isOwner && (
                <motion.a
                  variants={staggerItem}
                  href="#/dashboard"
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors whitespace-nowrap"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  <span>Edit in dashboard</span>
                </motion.a>
              )}

              <motion.a
                variants={staggerItem}
                href={`#/u/${creator.username}/cv`}
                className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[#c9f2dc] px-5 py-2.5 text-sm font-bold text-[#14163a] hover:bg-white active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                <span>View CV</span>
              </motion.a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Projects & vouches */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-[var(--text-main)]">
            Selected projects
          </h2>
          <span className="text-sm text-[var(--text-muted)] tabular-nums">
            {creator.projects.length}{' '}
            {creator.projects.length === 1 ? 'project' : 'projects'}
          </span>
        </div>

        {creator.projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)] p-10 text-center">
            <EmptyStateIllustration variant="projects" />
            <h3 className="font-display text-xl font-bold text-[var(--text-main)]">
              No projects published yet
            </h3>
            <p className="mx-auto mt-2 text-sm text-[var(--text-muted)]">
              {isOwner
                ? 'Head to your dashboard to add your first project and invite someone to vouch.'
                : `${safeName} is still setting up their portfolio projects.`}
            </p>
            {isOwner && (
              <a
                href="#/dashboard"
                className="mt-5 inline-flex min-h-[44px] items-center rounded-xl bg-[var(--btn-cobalt)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--btn-cobalt-hover)]"
              >
                Add your first project
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {creator.projects.map((project, idx) => {
              const projectVouches = creator.invites.filter(
                (inv) => inv.projectId === project.id && inv.status === 'confirmed'
              );
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  confirmedVouches={projectVouches}
                  featured={idx === 0}
                  index={idx}
                  enableSharedLayout={!inspectedProject}
                  onInspect={(proj) => setInspectedProject(proj)}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Shared-Element Case Study Lightbox */}
      <ProjectLightboxModal
        project={inspectedProject}
        confirmedVouches={
          inspectedProject
            ? creator.invites.filter(
                (i) => i.projectId === inspectedProject.id && i.status === 'confirmed'
              )
            : []
        }
        creatorName={safeName}
        onClose={() => setInspectedProject(null)}
      />
    </div>
  );
}
