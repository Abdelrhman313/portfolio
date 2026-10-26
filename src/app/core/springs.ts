/**
 * A GSAP ease that follows a damped spring (mass 1) released from rest at 0 towards 1,
 * sampled over `duration` seconds. Used to reproduce the reference's motion springs.
 */
export function springEase(stiffness: number, damping: number, duration: number): (progress: number) => number {
  const w0 = Math.sqrt(stiffness);
  const zeta = damping / (2 * w0);

  if (zeta >= 1) {
    // Critically damped (overdamped springs are close enough to treat the same way).
    return (p) => (p >= 1 ? 1 : 1 - (1 + w0 * p * duration) * Math.exp(-w0 * p * duration));
  }

  const wd = w0 * Math.sqrt(1 - zeta * zeta);
  return (p) => {
    if (p >= 1) return 1;
    const t = p * duration;
    return 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t));
  };
}

/** A GSAP ease equivalent to CSS `cubic-bezier(x1, y1, x2, y2)`. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (progress: number) => number {
  const bezier = (t: number, a: number, b: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  const slope = (t: number, a: number, b: number) => 3 * a * (1 - t) ** 2 + 6 * (b - a) * t * (1 - t) + 3 * (1 - b) * t * t;
  return (x) => {
    if (x <= 0 || x >= 1) return x;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const error = bezier(t, x1, x2) - x;
      const d = slope(t, x1, x2);
      if (Math.abs(error) < 1e-5 || d === 0) break;
      t -= error / d;
    }
    return bezier(Math.min(1, Math.max(0, t)), y1, y2);
  };
}

/** Tailwind's default transition timing, cubic-bezier(0.4, 0, 0.2, 1). */
export const EASE_DEFAULT = cubicBezier(0.4, 0, 0.2, 1);

export interface Spring {
  ease: (progress: number) => number;
  duration: number;
}

function spring(stiffness: number, damping: number, duration: number): Spring {
  return { ease: springEase(stiffness, damping, duration), duration };
}

/** Nav link 3D flip (stiffness 100, damping 20). */
export const FLIP_SPRING = spring(100, 20, 0.85);
/** Nav glow scale on hover in (300 / 25). */
export const GLOW_IN_SPRING = spring(300, 25, 0.5);
/** Nav glow scale back to rest (550 / 30). */
export const GLOW_OUT_SPRING = spring(550, 30, 0.35);
/** Active nav indicator (400 / 30). */
export const INDICATOR_SPRING = spring(400, 30, 0.45);
