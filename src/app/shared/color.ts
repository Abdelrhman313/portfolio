/** `#rrggbb` → `rgba(r,g,b,alpha)`, for the per-item accent tints. */
export function alpha(hex: string, value: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${value})`;
}
