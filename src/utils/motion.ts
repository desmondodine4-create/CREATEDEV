import type { Transition, Variants } from 'motion/react';

export const EASE_STUDIO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const SPRING_SMOOTH: Transition = {
  type: 'spring',
  stiffness: 340,
  damping: 32,
  mass: 0.9,
};

export const SPRING_SNAPPY: Transition = {
  type: 'spring',
  stiffness: 460,
  damping: 30,
};

export function staggerContainer(stagger = 0.06, delayChildren = 0.04): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren,
      },
    },
  };
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.38,
      ease: EASE_STUDIO,
    },
  },
};

export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: EASE_STUDIO,
      when: 'beforeChildren',
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.18,
      ease: EASE_STUDIO,
    },
  },
};
