import { useState } from 'react';
import { ArrowUpRight, Maximize2 } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { Project, VouchInvite } from '../data/mockData';
import { sanitizeText, sanitizeUrl } from '../utils/sanitize';
import { EASE_STUDIO, SPRING_SMOOTH } from '../utils/motion';
import { VouchBadge } from './VouchBadge';

interface ProjectCardProps {
  project: Project;
  confirmedVouches: VouchInvite[];
  featured?: boolean;
  index?: number;
  enableSharedLayout?: boolean;
  onInspect?: (project: Project) => void;
}

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) % 997;
  }
  return h;
}

export function ProjectCard({
  project,
  confirmedVouches,
  featured = false,
  index = 0,
  enableSharedLayout = true,
  onInspect,
}: ProjectCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [imageFailed, setImageFailed] = useState(false);

  const safeTitle = sanitizeText(project.title, 120);
  const safeRole = sanitizeText(project.role, 100);
  const safeStory = sanitizeText(project.story, 600);
  const safeLink = sanitizeUrl(project.link);
  const safeTools = project.tools.map((t) => sanitizeText(t, 40)).filter(Boolean);
  const showPhoto = Boolean(project.coverImage) && !imageFailed;

  const seed = hashSeed(safeTitle + safeRole);
  const cx1 = 220 + (seed % 90);
  const cy1 = 36 + (seed % 44);
  const cx2 = 75 + (seed % 60);

  return (
    <motion.article
      layoutId={enableSharedLayout && !prefersReducedMotion ? `project-card-${project.id}` : undefined}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        layout: SPRING_SMOOTH,
        duration: 0.42,
        delay: prefersReducedMotion ? 0 : Math.min(index * 0.07, 0.28),
        ease: EASE_STUDIO,
      }}
      className="group overflow-hidden rounded-2xl border border-[var(--border-line)] bg-[var(--bg-surface)] transition-colors duration-200 hover:border-[var(--accent-cobalt)]"
    >
      {/* Visual cover */}
      <motion.div
        layoutId={enableSharedLayout && !prefersReducedMotion ? `project-cover-${project.id}` : undefined}
        transition={{ layout: SPRING_SMOOTH }}
        className={`relative overflow-hidden border-b border-[var(--border-line)] bg-[#14163a] ${
          showPhoto ? 'h-48 sm:h-60' : 'h-28 sm:h-32'
        }`}
      >
        {showPhoto ? (
          <>
            <img
              src={project.coverImage}
              alt={`${safeTitle} project showcase`}
              referrerPolicy="no-referrer"
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#14163a]/90 via-[#14163a]/35 to-transparent"
              aria-hidden="true"
            />
          </>
        ) : (
          <svg
            viewBox="0 0 640 140"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
          >
            <path
              d="M0 70H640M160 0V140M480 0V140"
              stroke="#f6f7fb"
              strokeOpacity="0.1"
              strokeWidth="1"
            />
            <g className="transition-transform duration-500 ease-out group-hover:translate-x-2 group-hover:-translate-y-1">
              <path
                d={`M${cx1 - 90} 140C${cx1 - 45} 30 ${cx1 + 85} 18 ${cx1 + 170} 140H${cx1 - 90}Z`}
                fill="#2f3bd9"
              />
            </g>
            <g className="transition-transform duration-500 ease-out group-hover:-translate-x-2 group-hover:translate-y-1">
              <circle cx={cx1 + 115} cy={cy1} r="22" fill="#ff9f43" />
            </g>
            <path
              d={`M${cx2} 130C${cx2 + 65} 25 ${cx2 + 225} 20 ${cx2 + 310} 95`}
              stroke="#c9f2dc"
              strokeOpacity="0.65"
              strokeWidth="1.75"
            />
            <circle cx={cx2 + 310} cy="95" r="5" fill="#c9f2dc" />
          </svg>
        )}

        <div className="relative z-10 flex h-full items-end justify-between px-6 pb-4">
          <p className="text-xs font-medium tracking-wide text-[#f6f7fb]">
            Case study · {safeRole}
          </p>
          <p className="text-xs font-semibold text-[#c9f2dc] tabular-nums">
            {confirmedVouches.length} confirmed{' '}
            {confirmedVouches.length === 1 ? 'vouch' : 'vouches'}
          </p>
        </div>
      </motion.div>

      <div className={`grid gap-6 lg:grid-cols-12 lg:gap-8 ${featured ? 'p-6 sm:p-8' : 'p-5 sm:p-7'}`}>
        {/* Left / primary project narrative */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            {safeTools.length > 0 && (
              <p className="text-sm font-medium text-[var(--accent-cobalt)]">
                {safeTools.join(' · ')}
              </p>
            )}

            <motion.h3
              layoutId={
                enableSharedLayout && !prefersReducedMotion
                  ? `project-card-title-${project.id}`
                  : undefined
              }
              transition={{ layout: SPRING_SMOOTH }}
              className="mt-2 font-display text-2xl font-bold tracking-tight text-[var(--text-main)] sm:text-[1.85rem]"
            >
              {safeTitle}
            </motion.h3>

            {safeStory && (
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--text-muted)]">
                {safeStory}
              </p>
            )}
          </div>

          {(safeLink || onInspect) && (
            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-[var(--border-line)] pt-4">
              {onInspect && (
                <button
                  type="button"
                  onClick={() => onInspect(project)}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-3.5 py-1.5 text-xs font-semibold text-[var(--text-main)] hover:border-[var(--accent-cobalt)] hover:text-[var(--accent-cobalt)] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Inspect case study</span>
                </button>
              )}

              {safeLink && (
                <a
                  href={safeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent-cobalt)] hover:text-[var(--text-main)] transition-colors whitespace-nowrap"
                >
                  <span>Visit live project</span>
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Right / hero proof column */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {confirmedVouches.length > 0 ? (
            <div className="flex flex-col gap-3">
              {confirmedVouches.map((vouch, idx) => (
                <VouchBadge key={vouch.id} vouch={vouch} index={idx} compact />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-subtle)] p-4 text-sm text-[var(--text-muted)]">
              No confirmed vouches yet. Send an invite from your dashboard to collect proof.
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
