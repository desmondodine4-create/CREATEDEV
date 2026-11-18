import { motion, useReducedMotion } from 'motion/react';

interface CelebrationBurstProps {
  active: boolean;
}

const PARTICLES = [
  { id: 1, x: -110, y: -82, rotate: -38, color: '#2f3bd9', shape: 'circle', size: 12 },
  { id: 2, x: 102, y: -88, rotate: 48, color: '#ff9f43', shape: 'diamond', size: 14 },
  { id: 3, x: -138, y: 14, rotate: -22, color: '#c9f2dc', shape: 'bar', size: 16 },
  { id: 4, x: 132, y: 20, rotate: 32, color: '#2f3bd9', shape: 'triangle', size: 14 },
  { id: 5, x: -64, y: -128, rotate: 18, color: '#ff9f43', shape: 'circle', size: 10 },
  { id: 6, x: 58, y: -124, rotate: -44, color: '#14163a', shape: 'diamond', size: 12 },
  { id: 7, x: -84, y: 82, rotate: 54, color: '#2f3bd9', shape: 'diamond', size: 13 },
  { id: 8, x: 86, y: 78, rotate: -28, color: '#c9f2dc', shape: 'circle', size: 15 },
  { id: 9, x: 0, y: -136, rotate: 14, color: '#2f3bd9', shape: 'triangle', size: 13 },
  { id: 10, x: -32, y: 104, rotate: -14, color: '#ff9f43', shape: 'bar', size: 14 },
  { id: 11, x: 38, y: 102, rotate: 40, color: '#14163a', shape: 'circle', size: 9 },
  { id: 12, x: -115, y: -32, rotate: 72, color: '#14163a', shape: 'bar', size: 12 },
  { id: 13, x: 116, y: -34, rotate: -65, color: '#c9f2dc', shape: 'triangle', size: 13 },
];

export function CelebrationBurst({ active }: CelebrationBurstProps) {
  const prefersReducedMotion = useReducedMotion();

  if (!active || prefersReducedMotion) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      <div className="relative h-6 w-6">
        {/* Expanding crisp radial seal rings */}
        <motion.div
          initial={{ opacity: 0.75, scale: 0.25 }}
          animate={{ opacity: 0, scale: 4.5 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute -left-10 -top-10 h-24 w-24 rounded-full border-2 border-[#2f3bd9]"
        />
        <motion.div
          initial={{ opacity: 0.8, scale: 0.2 }}
          animate={{ opacity: 0, scale: 3.4 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="absolute -left-10 -top-10 h-24 w-24 rounded-full border-2 border-[#7fd0a5]"
        />

        {PARTICLES.map((p, index) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0.35, rotate: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: p.x * 1.45,
              y: p.y * 1.45,
              scale: [0.35, 1.2, 1, 0.65],
              rotate: p.rotate * 2.2,
            }}
            transition={{
              duration: 1.15,
              ease: [0.16, 1, 0.3, 1],
              delay: index * 0.018,
            }}
            className="absolute left-0 top-0"
          >
            {p.shape === 'circle' && (
              <svg width={p.size} height={p.size} viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="7" fill={p.color} />
              </svg>
            )}
            {p.shape === 'bar' && (
              <svg width={p.size} height={p.size} viewBox="0 0 16 16">
                <rect x="2" y="5" width="12" height="6" rx="3" fill={p.color} />
              </svg>
            )}
            {p.shape === 'diamond' && (
              <svg width={p.size} height={p.size} viewBox="0 0 16 16">
                <path d="M8 0L16 8L8 16L0 8Z" fill={p.color} />
              </svg>
            )}
            {p.shape === 'triangle' && (
              <svg width={p.size} height={p.size} viewBox="0 0 16 16">
                <path d="M8 1L15 14H1L8 1Z" fill={p.color} />
              </svg>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
