"use client";

import { IconHome2, IconArrowGuide, IconChartLine, IconPencilPlus, IconAward } from "@tabler/icons-react";

const ICONS = [IconHome2, IconArrowGuide, IconChartLine, IconPencilPlus, IconAward];

export function BottomNav({ labels, activeIndex = 0 }: { labels: [string, string, string, string, string]; activeIndex?: number }) {
  return (
    <nav className="rf-nav">
      {labels.map((label, i) => {
        const Icon = ICONS[i];
        const active = i === activeIndex;
        return (
          <div key={label} className={`rf-nav-item${active ? " active" : ""}`}>
            <Icon size={21} color={active ? "var(--accent)" : "var(--text-muted)"} />
            <span>{label}</span>
          </div>
        );
      })}
    </nav>
  );
}
