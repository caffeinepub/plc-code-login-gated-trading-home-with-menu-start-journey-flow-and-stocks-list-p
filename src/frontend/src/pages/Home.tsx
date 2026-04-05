import {
  BadgeDollarSign,
  Bell,
  Calculator,
  Coins,
  Menu,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AppMenu from "../components/AppMenu";
import NetworkSpeed from "../components/NetworkSpeed";
import TradingChart from "../components/TradingChart";
import {
  type Broadcast,
  type FscUser,
  formatInr,
  getAnnouncement,
  getBroadcasts,
  getCurrentUser,
  getPayments,
  getVipTier,
  getVipTierColor,
  getVipTierLabel,
  markBroadcastRead,
} from "../types/fsc";

interface HomeProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    function step(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - 2 ** (-10 * progress);
      setValue(target * eased);
      if (progress < 1) raf.current = requestAnimationFrame(step);
    }
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return value;
}

const QUICK_ACTIONS = [
  {
    id: "add-funds",
    label: "Add Funds",
    icon: BadgeDollarSign,
    color: "oklch(0.78 0.18 82)",
    bg: "oklch(0.78 0.18 82 / 0.14)",
  },
  {
    id: "withdrawal",
    label: "Withdraw",
    icon: Wallet,
    color: "oklch(0.65 0.2 145)",
    bg: "oklch(0.65 0.2 145 / 0.12)",
  },
  {
    id: "referral",
    label: "Referral",
    icon: Users,
    color: "oklch(0.65 0.18 200)",
    bg: "oklch(0.65 0.18 200 / 0.12)",
  },
  {
    id: "earning-calculator",
    label: "Calculator",
    icon: Calculator,
    color: "oklch(0.70 0.18 290)",
    bg: "oklch(0.70 0.18 290 / 0.12)",
  },
];

function AnnouncementTicker({ text }: { text: string }) {
  return (
    <div
      style={{
        background:
          "linear-gradient(90deg, oklch(0.78 0.18 82 / 0.15), oklch(0.72 0.20 75 / 0.15))",
        borderBottom: "1px solid oklch(0.78 0.18 82 / 0.3)",
        padding: "8px 0",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          animation: "ticker-scroll 20s linear infinite",
          whiteSpace: "nowrap",
          paddingLeft: "100%",
        }}
      >
        <Bell
          style={{
            width: 12,
            height: 12,
            color: "oklch(0.78 0.18 82)",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "oklch(0.88 0.12 82)",
            letterSpacing: "0.03em",
          }}
        >
          {text}
        </span>
      </div>
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-200%); }
        }
      `}</style>
    </div>
  );
}

function BroadcastCard({
  broadcast,
  onDismiss,
}: { broadcast: Broadcast; onDismiss: () => void }) {
  return (
    <div
      style={{
        background: "oklch(0.14 0.03 265)",
        border: "1px solid oklch(0.78 0.18 82 / 0.3)",
        borderRadius: 12,
        padding: "12px 14px",
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        marginBottom: 8,
      }}
    >
      <Bell
        style={{
          width: 16,
          height: 16,
          color: "oklch(0.78 0.18 82)",
          marginTop: 2,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "oklch(0.88 0.12 82)",
            marginBottom: 2,
          }}
        >
          {broadcast.title}
        </p>
        <p
          style={{
            fontSize: "0.75rem",
            color: "oklch(0.70 0.02 265)",
            lineHeight: 1.4,
          }}
        >
          {broadcast.message}
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "oklch(0.45 0.02 265)",
          padding: 2,
          flexShrink: 0,
        }}
        aria-label="Dismiss notification"
      >
        <X style={{ width: 14, height: 14 }} />
      </button>
    </div>
  );
}

export default function Home({
  onNavigate,
  onLogout,
  menuOpen,
  setMenuOpen,
}: HomeProps) {
  const [user, setUser] = useState<FscUser | null>(() => getCurrentUser());
  const [announcement, setAnnouncementText] = useState<string | null>(null);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);

  useEffect(() => {
    setAnnouncementText(getAnnouncement());

    const user = getCurrentUser();
    if (!user) return;
    const allBroadcasts = getBroadcasts();
    const myTier = getVipTier(
      getPayments()
        .filter((p) => p.userId === user.uniqueId && p.status === "approved")
        .reduce((s, p) => s + p.amount, 0),
    );
    const unread = allBroadcasts.filter(
      (b) =>
        !b.read.includes(user.uniqueId) &&
        (b.target === "all" || b.target === myTier),
    );
    setBroadcasts(unread);
  }, []);

  function handleDismissBroadcast(broadcastId: string) {
    const user = getCurrentUser();
    if (!user) return;
    markBroadcastRead(broadcastId, user.uniqueId);
    setBroadcasts((prev) => prev.filter((b) => b.id !== broadcastId));
  }

  function handleMenuOpenChange(open: boolean) {
    setMenuOpen(open);
    if (!open) setUser(getCurrentUser());
  }

  const balance = user?.balance ?? 0;
  const animatedBalance = useCountUp(balance);

  const allPayments = getPayments();
  const myApproved = user
    ? allPayments.filter(
        (p) => p.userId === user.uniqueId && p.status === "approved",
      )
    : [];
  const totalInvested = myApproved.reduce((s, p) => s + p.amount, 0);
  const currentValue = totalInvested * 1.08;
  const pl = currentValue - totalInvested;
  const isProfit = pl >= 0;

  const tier = getVipTier(totalInvested);
  const tierColor = getVipTierColor(tier);
  const tierLabel = getVipTierLabel(tier);

  return (
    <div className="page-wrapper bg-grid-pattern bg-radial-glow">
      {/* ── Announcement Ticker (Feature 14) ── */}
      {announcement && <AnnouncementTicker text={announcement} />}

      {/* ── Header ── */}
      <header className="glass-header sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/fsc-logo-premium-transparent.dim_300x300.png"
              alt="FSC"
              className="w-9 h-9 object-contain"
              style={{
                filter: "drop-shadow(0 0 10px oklch(0.78 0.18 82 / 0.55))",
              }}
            />
            <div className="leading-none">
              <div
                className="font-display font-bold text-gold-gradient"
                style={{ fontSize: "1.1rem" }}
              >
                FSC
              </div>
              <div
                className="text-muted-foreground uppercase"
                style={{ fontSize: "0.56rem", letterSpacing: "0.16em" }}
              >
                Foreign Smart Coins
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <NetworkSpeed />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="btn-glass rounded-xl p-2"
              data-ocid="home.open_modal_button"
            >
              <Menu style={{ width: 20, height: 20 }} />
            </button>
          </div>
        </div>
      </header>

      <AppMenu
        isOpen={menuOpen}
        onOpenChange={handleMenuOpenChange}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="px-4 pt-5 pb-4">
        {/* ── Broadcasts (Feature 12) ── */}
        {broadcasts.length > 0 && (
          <div className="animate-fade-in-up stagger-1 mb-4">
            {broadcasts.map((b) => (
              <BroadcastCard
                key={b.id}
                broadcast={b}
                onDismiss={() => handleDismissBroadcast(b.id)}
              />
            ))}
          </div>
        )}

        {/* ── Greeting ── */}
        <div className="animate-fade-in-up stagger-1 mb-4">
          <p
            className="text-sm mb-0.5"
            style={{ color: "oklch(0.55 0.03 265)" }}
          >
            {getGreeting()} ✨
          </p>
          <div className="flex items-center gap-2.5">
            <h1
              className="font-display font-bold text-foreground"
              style={{ fontSize: "1.55rem", lineHeight: 1.1 }}
            >
              {user?.name ? (
                <>
                  <span className="text-foreground">
                    {user.name.split(" ")[0]}'s{" "}
                  </span>
                  <span className="text-gold-gradient">Portfolio</span>
                </>
              ) : (
                <span className="text-gold-gradient">Welcome Back</span>
              )}
            </h1>
            <span
              className="badge-pill flex-shrink-0"
              style={{
                background: `${tierColor}18`,
                color: tierColor,
                borderColor: `${tierColor}44`,
              }}
            >
              {tierLabel}
            </span>
          </div>
        </div>

        {/* ── Balance Hero Card ── */}
        <div className="balance-hero animate-fade-in-up stagger-2 mb-5 p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Coins
                style={{ width: 14, height: 14, color: "oklch(0.78 0.18 82)" }}
              />
              <span
                className="text-xs uppercase tracking-widest"
                style={{ color: "oklch(0.55 0.03 265)" }}
              >
                Total Balance
              </span>
            </div>
            <span
              className="badge-pill badge-pill-emerald"
              style={{ fontSize: "0.6rem" }}
            >
              ● LIVE
            </span>
          </div>

          <div className="balance-hero-amount mb-1">
            {formatInr(animatedBalance)}
          </div>
          <p className="text-xs mb-4" style={{ color: "oklch(0.45 0.02 265)" }}>
            Available for withdrawal
          </p>

          {totalInvested > 0 && (
            <div
              className="grid grid-cols-3 gap-2 pt-3"
              style={{ borderTop: "1px solid oklch(0.78 0.18 82 / 0.1)" }}
            >
              {[
                {
                  label: "Invested",
                  value: formatInr(totalInvested),
                  color: "oklch(0.75 0.01 80)",
                },
                {
                  label: "Cur. Value",
                  value: formatInr(currentValue),
                  color: "oklch(0.75 0.01 80)",
                },
                {
                  label: "P&L",
                  value: `${isProfit ? "+" : ""}${formatInr(pl)}`,
                  color: isProfit
                    ? "oklch(0.70 0.20 145)"
                    : "oklch(0.68 0.22 22)",
                },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p
                    className="text-xs mb-0.5"
                    style={{ color: "oklch(0.45 0.02 265)" }}
                  >
                    {stat.label}
                  </p>
                  <p
                    className="font-bold"
                    style={{ fontSize: "0.78rem", color: stat.color }}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {totalInvested === 0 && (
            <button
              type="button"
              onClick={() => onNavigate("add-funds")}
              className="w-full text-xs font-semibold py-1.5 rounded-lg transition-colors"
              style={{
                color: "oklch(0.78 0.18 82)",
                background: "oklch(0.78 0.18 82 / 0.08)",
                border: "1px solid oklch(0.78 0.18 82 / 0.2)",
              }}
            >
              Add funds to start investing →
            </button>
          )}
        </div>

        {/* ── Quick Actions ── */}
        <div className="animate-fade-in-up stagger-3 mb-6">
          <div className="section-label">Quick Actions</div>
          <div className="grid grid-cols-4 gap-2.5">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => onNavigate(action.id)}
                className="quick-action"
                data-ocid={`home.${action.id}.button`}
              >
                <div
                  className="quick-action-icon"
                  style={{
                    background: action.bg,
                    border: `1px solid ${action.color}33`,
                  }}
                >
                  <action.icon
                    style={{ width: 20, height: 20, color: action.color }}
                  />
                </div>
                <span
                  className="font-semibold leading-tight"
                  style={{ fontSize: "0.64rem", color: "oklch(0.82 0.01 80)" }}
                >
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Live Markets ── */}
        <div className="animate-fade-in-up stagger-4 mb-6">
          <div className="section-label">
            <TrendingUp style={{ width: 12, height: 12 }} />
            Live Markets
          </div>
          <div className="grid gap-3">
            <TradingChart title="BTC/INR" color="gold" />
            <TradingChart title="ETH/INR" color="emerald" />
          </div>
        </div>

        {/* ── Start Journey CTA ── */}
        <div className="animate-fade-in-up stagger-5 mb-6">
          <button
            type="button"
            className="btn-gold w-full rounded-2xl py-4 font-display font-bold text-lg"
            onClick={() => onNavigate("stocks")}
            data-ocid="home.primary_button"
          >
            🚀 Start Your Investment Journey
          </button>
        </div>

        {/* ── Footer ── */}
        <div className="text-center pt-2 pb-1">
          <p style={{ fontSize: "0.63rem", color: "oklch(0.38 0.02 265)" }}>
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
