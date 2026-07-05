"use client";

import { useTheme } from "@/lib/theme/ThemeProvider";

/** The revo fit app icon: rounded square, dark ground, "revo" up top, gold band with "fit" below.
 * This is the one true icon shape — used on splash/onboarding and as the source for the PWA
 * manifest icons (see scripts and public/icons). Keep this in sync with public/icons if you
 * ever change the mark. */
export function AppIcon({ size = 96 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="revo fit">
      <defs>
        <clipPath id="revoIconClip">
          <rect width="180" height="180" rx="40" />
        </clipPath>
      </defs>
      <g clipPath="url(#revoIconClip)">
        <rect width="180" height="180" fill="#16140F" />
        <text x="90" y="70" textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-jost), sans-serif" fontWeight="200" fontSize="44" letterSpacing="1.5" fill="#F0EBE2">
          revo
        </text>
        <rect x="0" y="116" width="180" height="64" fill="#E3C56A" />
        <text x="90" y="149" textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-jost), sans-serif" fontWeight="500" fontSize="34" letterSpacing="1" fill="#16140F">
          fit
        </text>
      </g>
    </svg>
  );
}

/** The text wordmark: "revo" in the current theme's title color + "fit" in gold.
 * Used in headers where the full square icon is too heavy (home header, small headers). */
export function WordmarkSmall({ width = 92 }: { width?: number }) {
  const { theme } = useTheme();
  const revoFill = theme === "dark" ? "#F0EBE2" : "#1A1813";
  const fitFill = theme === "dark" ? "#E3C56A" : "#BA7517";
  return (
    <svg viewBox="0 0 116 30" width={width} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="revo fit">
      <text x="0" y="23" fontFamily="var(--font-jost), sans-serif" fontWeight="200" fontSize="25" letterSpacing="0.5">
        <tspan fill={revoFill}>revo </tspan>
        <tspan fill={fitFill}>fit</tspan>
      </text>
    </svg>
  );
}

/** Large centered wordmark used on welcome/signup/login screens: "revo" + gold "fit". */
export function Wordmark({ size = 54 }: { size?: number }) {
  return (
    <span className="rf-wordmark" style={{ fontSize: size }}>
      <span style={{ color: "var(--text)" }}>revo</span>
      <span className="suffix">fit</span>
    </span>
  );
}
