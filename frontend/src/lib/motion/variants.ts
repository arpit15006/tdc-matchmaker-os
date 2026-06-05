import type { Variants } from 'framer-motion';

const EDITORIAL_EASE = [0.22, 1, 0.36, 1] as const;

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: EDITORIAL_EASE } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15, ease: 'easeIn' } },
};

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EDITORIAL_EASE } },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.22, ease: EDITORIAL_EASE } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.14 } },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EDITORIAL_EASE } },
};

export const cardHover = {
  rest: { y: 0 },
  hover: { y: -3, transition: { duration: 0.2, ease: EDITORIAL_EASE } },
};
