import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, X } from 'lucide-react';
import type { Project, VouchInvite } from '../data/mockData';
import { sanitizeText, sanitizeUrl } from '../utils/sanitize';
import { EASE_STUDIO, SPRING_SMOOTH, staggerContainer, staggerItem } from '../utils/motion';
import { VouchBadge } from './VouchBadge';

interface ProjectLightboxModalProps {
  project: Project | null;
  confirmedVouches: VouchInvite[];
  creatorName: string;
  onClose: () => void;
}

export function ProjectLightboxModal({
  project,
  confirmedVouches,
  creatorName,
  onClose,
}: ProjectLightboxModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  const safeTitle = project ? sanitizeText(project.title, 120) : '';
  const safeRole = project ? sanitizeText(project.role, 100) : '';
  const safeStory = project ? sanitizeText(project.story, 600) : '';
  const safeLink = project ? sanitizeUrl(project.link) : '';
  const safeTools = project ? project.tools.map((t) => sanitizeText(t, 40)).filter(Boolean) : [];
  const showPhoto = Boolean(project?.coverImage) && !imageFailed;

  return (
    <AnimatePresence>
      {project && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`lightbox-title-${project.id}`}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE_STUDIO }}
            onClick={onClose}
            className="fixed inset-0 bg-[#050614]/80 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Shared-element expanded case study surface */}
          <motion.article
            layoutId={prefersReducedMotion ? undefined : `project-card-${project.id}`}
            transition={{ layout: SPRING_SMOOTH }}
            className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.65)]"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close case study view"
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-[#10132e]/85 text-white hover:bg-[#3b48e8] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Shared-element cover */}
            <motion.div
              layoutId={prefersReducedMotion ? undefined : `project-cover-${project.id}`}
              transition={{ layout: SPRING_SMOOTH }}
              className={`relative overflow-hidden border-b border-[var(--border-line)] bg-[#14163a] ${
                showPhoto ? 'h-56 sm:h-72' : 'h-32 sm:h-40'
              }`}
            >
              {showPhoto ? (
                <>
                  <img
                    src={project.coverImage}
                    alt={`${safeTitle} expanded preview`}
                    referrerPolicy="no-referrer"
                    onError={() => setImageFailed(true)}
                    className="h-full w-full object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#10132e]/95 via-[#10132e]/35 to-transparent"
                    aria-hidden="true"
                  />
                </>
              ) : (
                <div className="flex h-full items-center justify-center bg-[#14163a] px-6 text-center">
                  <span className="font-display text-lg font-bold text-[#c9f2dc]">
                    {safeTitle}
                  </span>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 px-6 pb-4 text-xs font-medium text-[#f6f7fb]">
                <span>
                  {sanitizeText(creatorName, 80)} · {safeRole}
                </span>
                <span className="font-semibold text-[#c9f2dc] tabular-nums">
                  {confirmedVouches.length} confirmed{' '}
                  {confirmedVouches.length === 1 ? 'vouch' : 'vouches'}
                </span>
              </div>
            </motion.div>

            {/* Staggered modal body */}
            <motion.div
              variants={staggerContainer(0.06, 0.06)}
              initial={prefersReducedMotion ? false : 'hidden'}
              animate="visible"
              className="p-6 sm:p-8"
            >
              {safeTools.length > 0 && (
                <motion.p
                  variants={staggerItem}
                  className="text-sm font-semibold text-[var(--accent-cobalt)]"
                >
                  {safeTools.join(' · ')}
                </motion.p>
              )}

              <motion.h2
                id={`lightbox-title-${project.id}`}
                layoutId={prefersReducedMotion ? undefined : `project-card-title-${project.id}`}
                transition={{ layout: SPRING_SMOOTH }}
                className="mt-1.5 font-display text-2xl font-extrabold tracking-tight text-[var(--text-main)] sm:text-3xl"
              >
                {safeTitle}
              </motion.h2>

              {safeStory && (
                <motion.p
                  variants={staggerItem}
                  className="mt-4 text-base leading-relaxed text-[var(--text-muted)]"
                >
                  {safeStory}
                </motion.p>
              )}

              {safeLink && (
                <motion.div variants={staggerItem} className="mt-5">
                  <a
                    href={safeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-[var(--btn-cobalt)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--btn-cobalt-hover)] transition-colors"
                  >
                    <span>Visit live project</span>
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </motion.div>
              )}

              <motion.div
                variants={staggerItem}
                className="mt-7 border-t border-[var(--border-line)] pt-6"
              >
                <h3 className="font-display text-base font-bold text-[var(--text-main)] mb-3">
                  Verified vouches on this project
                </h3>
                {confirmedVouches.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {confirmedVouches.map((vouch, idx) => (
                      <VouchBadge key={vouch.id} vouch={vouch} index={idx} compact />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">
                    No confirmed vouches published yet.
                  </p>
                )}
              </motion.div>
            </motion.div>
          </motion.article>
        </div>
      )}
    </AnimatePresence>
  );
}
