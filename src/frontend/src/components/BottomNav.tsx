import { BarChart2, Briefcase, Grid3X3, Home } from "lucide-react";

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
            onClick={() =>
              item.id === "menu" ? onMenuOpen() : onNavigate(item.id)
            }
            className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-200"
            style={{
              color: isActive ? "oklch(0.78 0.18 82)" : "oklch(0.55 0.02 265)",
              background: isActive
                ? "oklch(0.78 0.18 82 / 0.08)"
                : "transparent",
            }}
            data-ocid={`bottom_nav.${item.id}.tab`}
          >
            <item.Icon
              style={{ width: 22, height: 22 }}
              strokeWidth={isActive ? 2.5 : 1.8}
            />
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: isActive ? 700 : 500,
                letterSpacing: "0.03em",
              }}
            >
              {item.label}
            </span>
            {isActive && (
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "oklch(0.78 0.18 82)",
                  boxShadow: "0 0 6px oklch(0.78 0.18 82 / 0.8)",
                  position: "absolute",
                  bottom: 4,
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
