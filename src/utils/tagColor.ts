// Deterministic tag color from slug.
//
// Hashes a slug to an HSL hue (0–360) so the same tag always paints the same
// color across pages, while different tags spread across the wheel. Keeps
// saturation/lightness bounded so badges remain legible in both light and
// dark themes.

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h >>> 0;
}

export interface TagColor {
  hue: number;
  bg: string;
  bgDark: string;
  fg: string;
  fgDark: string;
  border: string;
  borderDark: string;
}

export function tagColor(slug: string): TagColor {
  const hue = hashString(slug) % 360;
  return {
    hue,
    bg: `hsl(${hue} 70% 95%)`,
    bgDark: `hsl(${hue} 35% 22%)`,
    fg: `hsl(${hue} 60% 32%)`,
    fgDark: `hsl(${hue} 60% 78%)`,
    border: `hsl(${hue} 50% 80%)`,
    borderDark: `hsl(${hue} 35% 35%)`,
  };
}

export function tagStyle(slug: string): string {
  const c = tagColor(slug);
  return [
    `--tag-bg:${c.bg}`,
    `--tag-fg:${c.fg}`,
    `--tag-border:${c.border}`,
    `--tag-bg-dark:${c.bgDark}`,
    `--tag-fg-dark:${c.fgDark}`,
    `--tag-border-dark:${c.borderDark}`,
  ].join(';');
}
