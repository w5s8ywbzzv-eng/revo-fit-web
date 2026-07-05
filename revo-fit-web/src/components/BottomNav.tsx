"use client";

import { IconHome2, IconArrowGuide, IconChartLine, IconPencilPlus, IconAward } from "@tabler/icons-react";

const ICONS = [IconHome2, IconArrowGuide, IconChartLine, IconPencilPlus, IconAward];

export function BottomNav({
  labels,
  activeIndex = 0,
  onSelect
}: {
  labels: [string, string, string, string, string];
  activeIndex?: number;
  /** Called with the tapped index. Home (0) and Log (3) are wired to real
   * routes by the pages that use them; other indices (next step, forecast,
   * medals) don't have screens yet, so callers typically show a toast. */
  onSelect?: (index: number) => void;
}) {
  return (
    <nav className="rf-nav">
      {labels.map((label, i) => {
        const Icon = ICONS[i];
        const active = i === activeIndex;
        return (
          <button
            key={label}
            type="button"
            className={`rf-nav-item${active ? " active" : ""}`}
            style={{ background: "transparent", border: "none", cursor: "pointer" }}
            onClick={() => onSelect?.(i)}
          >
            <Icon size={21} color={active ? "var(--accent)" : "var(--text-muted)"} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
