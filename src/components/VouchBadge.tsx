import { motion, useReducedMotion } from 'motion/react';
import { Star } from 'lucide-react';
import type { VouchInvite } from '../data/mockData';
import { sanitizeText } from '../utils/sanitize';

interface VouchBadgeProps {
  vouch: VouchInvite;
  index?: number;
  compact?: boolean;
}

export function VouchBadge({ vouch, index = 0, compact = false }: VouchBadgeProps) {
  const prefersReducedMotion = useReducedMotion();
  const safeName = sanitizeText(vouch.inviteeName, 80);
  const safeQuote = vouch.testimonial ? sanitizeText(vouch.testimonial, 240) : '';
  const roleLabel = vouch.type === 'client' ? 'Client vouch' : 'Collaborator vouch';
  const baseDelay = prefersReducedMotion ? 0 : index * 0.1;

  return (
    <motion.article
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.92, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 380,
        damping: 24,
        delay: baseDelay,
      }}
      whileHover={prefersReducedMotion ? undefined : { y: -3, transition: { duration: 0.16 } }}
      className={`group relative overflow-hidden rounded-xl border border-[#7fd0a5] bg-[#c9f2dc] text-[#14163a] shadow-[0_8px_22px_-14px_rgba(20,22,58,0.28)] ${
        compact ? 'p-4' : 'p-5 sm:p-6'
      }`}
      aria-label={`${roleLabel} from ${safeName}`}
    >
      {/* Subtle architectural corner tick */}
      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 opacity-20"
      >
        <path d="M44 0V44M0 0H44" stroke="#14163a" strokeWidth="1" />
        <circle cx="30" cy="14" r="18" stroke="#14163a" strokeWidth="1" strokeDasharray="3 3" />
      </svg>

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 min-w-0">
          {/* Animated SVG Vouch Seal */}
          <span
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#14163a] text-[#c9f2dc] transition-transform duration-200 group-hover:scale-105"
            aria-hidden="true"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <motion.path
                d="M12 2.5L14.7 4.7L18.2 4.5L19.3 7.8L22 10L20.8 13.3L22 16.5L19.1 18.4L17.9 21.6L14.4 21.2L11.8 23.2L9.2 21.2L5.7 21.6L4.5 18.4L1.6 16.5L2.8 13.3L1.6 10L4.3 7.8L5.4 4.5L8.9 4.7L12 2.5Z"
                fill="currentColor"
                fillOpacity="0.16"
                initial={prefersReducedMotion ? false : { rotate: -25, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 20, delay: baseDelay + 0.08 }}
                style={{ originX: '12px', originY: '12px' }}
              />
              <motion.path
                d="M7.5 12.3L10.6 15.4L16.8 9.2"
                stroke="#c9f2dc"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={prefersReducedMotion ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1], delay: baseDelay + 0.16 }}
              />
            </svg>
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <p className="font-display text-base font-bold leading-snug text-[#14163a]">
                {safeName}
              </p>
              <span aria-hidden="true" className="text-[#14163a]/45">
                ·
              </span>
              <span className="text-xs font-medium text-[#14163a]/85">{roleLabel}</span>
            </div>

            {vouch.type === 'client' && typeof vouch.rating === 'number' && (
              <div
                className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-[#14163a] tabular-nums"
                aria-label={`Rated ${vouch.rating} out of 5`}
              >
                <span className="inline-flex items-center gap-0.5" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((star, starIdx) => (
                    <motion.span
                      key={star}
                      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 460,
                        damping: 20,
                        delay: baseDelay + 0.2 + starIdx * 0.045,
                      }}
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${
                          star <= (vouch.rating ?? 0)
                            ? 'fill-[#14163a] text-[#14163a]'
                            : 'text-[#14163a]/25'
                        }`}
                      />
                    </motion.span>
                  ))}
                </span>
                <span className="ml-1.5 font-bold">{vouch.rating}/5</span>
              </div>
            )}
          </div>
        </div>

        <span className="shrink-0 text-xs font-semibold tracking-tight text-[#14163a]">
          Confirmed
        </span>
      </div>

      {safeQuote && (
        <blockquote className="mt-3.5 border-t border-[#14163a]/12 pt-3 text-sm leading-relaxed text-[#14163a]/90">
          “{safeQuote}”
        </blockquote>
      )}
    </motion.article>
  );
}
