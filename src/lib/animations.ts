import type { Variants } from 'framer-motion';

// ─── Shared Transition Configs ────────────────────────────────────

export const easeBase = [0.25, 0.1, 0.25, 1] as const;
export const easeSpring = { type: 'spring', stiffness: 300, damping: 30 } as const;
export const easeSoft = { type: 'spring', stiffness: 200, damping: 25 } as const;

// ─── Page Variants ────────────────────────────────────────────────

export const pageVariants: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easeBase } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2, ease: easeBase } },
};

// ─── Stagger Container ────────────────────────────────────────────

export const staggerContainer: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeBase } },
};

// ─── Fade Variants ────────────────────────────────────────────────

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
};

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeBase } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.2 } },
};

// ─── Scale Variants ───────────────────────────────────────────────

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: easeBase } },
  exit:    { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
};

export const scaleUp: Variants = {
  hidden:  { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: easeSoft },
  exit:    { opacity: 0, scale: 0.92, transition: { duration: 0.15 } },
};

// ─── Slide Variants ───────────────────────────────────────────────

export const slideRight: Variants = {
  hidden:  { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: easeBase } },
  exit:    { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

// ─── Card Hover ───────────────────────────────────────────────────

export const cardHover = {
  rest:  { scale: 1, y: 0, transition: { duration: 0.2 } },
  hover: { scale: 1.02, y: -2, transition: { duration: 0.2 } },
};

// ─── Button ───────────────────────────────────────────────────────

export const buttonTap = { scale: 0.97 };
export const buttonHover = { scale: 1.01 };
