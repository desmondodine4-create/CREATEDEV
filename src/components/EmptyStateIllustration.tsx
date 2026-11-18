import { motion, useReducedMotion } from 'motion/react';

interface EmptyStateIllustrationProps {
  variant: 'projects' | 'vouches' | 'portfolio';
}

export function EmptyStateIllustration({ variant }: EmptyStateIllustrationProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="mx-auto mb-5 flex h-28 w-36 items-center justify-center" aria-hidden="true">
      <svg
        width="140"
        height="112"
        viewBox="0 0 140 112"
        fill="none"
        className="overflow-visible"
      >
        <g className="animate-orbit-slow" style={{ transformOrigin: '70px 56px' }}>
          <circle
            cx="70"
            cy="56"
            r="44"
            className="stroke-[#14163a]/20 dark:stroke-[#f4f6fc]/25"
            strokeWidth="1.25"
            strokeDasharray="4 6"
          />
          <circle cx="114" cy="56" r="4" fill="#ff9f43" />
        </g>

        {variant === 'projects' && (
          <g className="animate-float-gentle">
            <rect
              x="34"
              y="28"
              width="66"
              height="52"
              rx="10"
              fill="#ffffff"
              stroke="#14163a"
              strokeWidth="2"
            />
            <path d="M34 42H100" stroke="#14163a" strokeOpacity="0.15" strokeWidth="1.5" />
            <motion.path
              d="M44 54H82"
              stroke="#2f3bd9"
              strokeWidth="3.5"
              strokeLinecap="round"
              initial={prefersReducedMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.path
              d="M44 64H68"
              stroke="#14163a"
              strokeOpacity="0.28"
              strokeWidth="3"
              strokeLinecap="round"
              initial={prefersReducedMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            />
            <circle cx="98" cy="28" r="12" fill="#2f3bd9" />
            <path
              d="M98 23V33M93 28H103"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </g>
        )}

        {variant === 'vouches' && (
          <g className="animate-float-gentle">
            <rect
              x="30"
              y="32"
              width="76"
              height="46"
              rx="10"
              fill="#ffffff"
              stroke="#14163a"
              strokeWidth="2"
            />
            <circle cx="50" cy="55" r="9" fill="#c9f2dc" stroke="#14163a" strokeWidth="1.8" />
            <motion.path
              d="M46.5 55L49 57.5L54 52"
              stroke="#14163a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={prefersReducedMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.55, delay: 0.15 }}
            />
            <rect x="66" y="48" width="28" height="5" rx="2.5" fill="#14163a" />
            <rect x="66" y="58" width="18" height="4" rx="2" fill="#14163a" fillOpacity="0.25" />
          </g>
        )}

        {variant === 'portfolio' && (
          <g className="animate-float-gentle">
            <rect
              x="36"
              y="22"
              width="68"
              height="66"
              rx="10"
              fill="#ffffff"
              stroke="#14163a"
              strokeWidth="2"
            />
            <rect x="46" y="34" width="22" height="22" rx="6" fill="#2f3bd9" />
            <rect x="74" y="36" width="20" height="5" rx="2.5" fill="#14163a" />
            <rect x="74" y="46" width="14" height="4" rx="2" fill="#14163a" fillOpacity="0.25" />
            <rect x="46" y="64" width="48" height="14" rx="6" fill="#c9f2dc" stroke="#7fd0a5" />
          </g>
        )}
      </svg>
    </div>
  );
}
