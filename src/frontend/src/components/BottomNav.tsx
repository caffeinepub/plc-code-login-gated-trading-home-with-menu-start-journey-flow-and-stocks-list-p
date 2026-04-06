import { BarChart2, Briefcase, Grid3X3, Home } from "lucide-react";
import { playSound } from "../hooks/useSounds";

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onMenuOpen: () => void;
}

const NAV_ITEMS = [
  { id: "home", label: "Home", Icon: Home },
  { id: "stocks", label: "Markets", Icon: BarChart2 },
  { id: "portfolio", label: "Portfolio", Icon: Briefcase },
  { id: "menu", label: "Menu", Icon: Grid3X3 },
];

export default function BottomNav({
  currentPage,
  onNavigate,
  onMenuOpen,
}: BottomNavProps) {
  return (
    <nav
      className="bottom-nav fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2 safe-area-pb"
      data-ocid="bottom_nav.panel"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.id !== "menu" && currentPage === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              playSound("tap");
              if (item.id === "menu") {
                onMenuOpen();
              } else {
                onNavigate(item.id);
              }
            }}
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 relative"
            style={{
              color: isActive ? "oklch(0.72 0.20 210)" : "oklch(0.45 0.05 230)",
              background: isActive
                ? "oklch(0.65 0.22 220 / 0.12)"
                : "transparent",
              minWidth: 56,
            }}
            data-ocid={`bottom_nav.${item.id}.tab`}
          >
            {isActive && (
              <span
                style={{
                  position: "absolute",
                  bottom: 2,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "oklch(0.72 0.18 195)",
                  boxShadow: "0 0 8px oklch(0.65 0.22 220 / 0.8)",
                }}
              />
            )}
            <item.Icon
              style={{
                width: isActive ? 24 : 22,
                height: isActive ? 24 : 22,
                transition: "all 0.2s ease",
              }}
              strokeWidth={isActive ? 2.5 : 1.8}
            />
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: isActive ? 700 : 500,
                letterSpacing: "0.03em",
                transition: "all 0.2s ease",
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
