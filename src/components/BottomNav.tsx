"use client";
import { IconHome2, IconArrowGuide, IconChartLine, IconPencilPlus, IconAward } from "@tabler/icons-react";
const ICONS = [IconHome2, IconArrowGuide, IconChartLine, IconPencilPlus, IconAward];
export function BottomNav({ labels, activeIndex = 0, onSelect }: { labels: [string, string, string, string, string]; activeIndex?: number; onSelect?: (i: number) => void }) {
  return (
    <nav className="rf-nav">
      {labels.map((label, i) => {
        const Icon = ICONS[i];
        const active = i === activeIndex;
        return (
          <button key={label} onClick={() => onSelect?.(i)} className={`rf-nav-item${active ? " active" : ""}`} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <Icon size={21} color={active ? "var(--accent)" : "var(--text-muted)"} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
