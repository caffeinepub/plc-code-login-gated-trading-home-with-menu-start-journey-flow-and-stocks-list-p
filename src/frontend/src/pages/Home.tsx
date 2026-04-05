import {
  BadgeDollarSign,
  Bell,
  Calculator,
  Coins,
  Menu,
  Rocket,
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
    color: "oklch(0.65 0.22 220)",
    bg: "oklch(0.78 0.18 82 / 0.14)",
  },
  {
    id: "withdrawal",
    label: "Withdraw",
    icon: Wallet,
    color: "oklch(0.68 0.18 145)",
    bg: "oklch(0.68 0.18 145 / 0.12)",
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
          "linear-gradient(90deg, oklch(0.78 0.18 82 / 0.12), oklch(0.72 0.20 75 / 0.12))",
        borderBottom: "1px solid oklch(0.78 0.18 82 / 0.25)",
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
            color: "oklch(0.65 0.22 220)",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "oklch(0.82 0.12 210)",
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
        background: "oklch(0.12 0.026 265)",
        border: "1px solid oklch(0.78 0.18 82 / 0.28)",
        borderRadius: 14,
        padding: "12px 14px",
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        marginBottom: 8,
        boxShadow: "0 4px 16px oklch(0.55 0.22 220 / 0.10)",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: "oklch(0.78 0.18 82 / 0.12)",
          border: "1px solid oklch(0.78 0.18 82 / 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Bell
          style={{
            width: 14,
            height: 14,
            color: "oklch(0.65 0.22 220)",
          }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "oklch(0.88 0.10 210)",
            marginBottom: 2,
          }}
        >
          {broadcast.title}
        </p>
        <p
          style={{
            fontSize: "0.75rem",
            color: "oklch(0.65 0.02 265)",
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
          color: "oklch(0.38 0.04 225)",
          padding: 4,
          flexShrink: 0,
          borderRadius: 6,
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
    <div
      style={{
        minHeight: "100vh",
        paddingBottom: "5rem",
        background: `
          radial-gradient(ellipse 100% 60% at 50% -10%, oklch(0.55 0.22 220 / 0.10) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 90% 80%, oklch(0.65 0.18 200 / 0.05) 0%, transparent 50%),
          oklch(0.07 0.035 240)
        `,
        backgroundAttachment: "fixed",
      }}
    >
      {/* ── Announcement Ticker ── */}
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
                filter: "drop-shadow(0 0 12px oklch(0.78 0.18 82 / 0.6))",
              }}
            />
            <div className="leading-none">
              <div
                className="font-display font-bold text-gold-gradient"
                style={{ fontSize: "1.15rem" }}
              >
                FSC
              </div>
              <div
                className="text-muted-foreground uppercase"
                style={{ fontSize: "0.54rem", letterSpacing: "0.18em" }}
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
        {/* ── Broadcasts ── */}
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
            style={{ color: "oklch(0.45 0.05 225)" }}
          >
            {getGreeting()} ✨
          </p>
          <div className="flex items-center gap-2.5">
            <h1
              className="font-display font-bold text-foreground"
              style={{ fontSize: "1.6rem", lineHeight: 1.1 }}
            >
              {user?.name ? (
                <>
                  <span className="text-foreground">
                    {user.name.split(" ")[0]}&apos;s{" "}
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
                fontSize: "0.6rem",
              }}
            >
              {tierLabel}
            </span>
          </div>
        </div>

        {/* ── Balance Hero Card ── */}
        <div className="balance-hero animate-fade-in-up stagger-2 mb-5 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Coins
                style={{ width: 15, height: 15, color: "oklch(0.65 0.22 220)" }}
              />
              <span
                className="text-xs uppercase tracking-widest font-semibold"
                style={{
                  color: "oklch(0.52 0.06 225)",
                  letterSpacing: "0.14em",
                }}
              >
                My Balance
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Live pulse dot */}
              <span
                className="animate-live-pulse"
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "oklch(0.68 0.18 145)",
                }}
              />
              <span
                className="badge-pill badge-pill-emerald"
                style={{ fontSize: "0.58rem", padding: "2px 8px" }}
              >
                LIVE
              </span>
            </div>
          </div>

          <div className="balance-hero-amount mb-1">
            {formatInr(animatedBalance)}
          </div>
          <p className="text-xs mb-4" style={{ color: "oklch(0.38 0.04 225)" }}>
            Available for withdrawal
          </p>

          {/* Gold divider */}
          <div className="gold-divider mb-4" />

          {totalInvested > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  label: "Invested",
                  value: formatInr(totalInvested),
                  color: "oklch(0.78 0.08 265)",
                },
                {
                  label: "Cur. Value",
                  value: formatInr(currentValue),
                  color: "oklch(0.78 0.08 265)",
                },
                {
                  label: "P&L",
                  value: `${isProfit ? "+" : ""}${formatInr(pl)}`,
                  color: isProfit
                    ? "oklch(0.70 0.20 145)"
                    : "oklch(0.68 0.22 22)",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: "oklch(0.10 0.018 265 / 0.6)",
                    borderRadius: 10,
                    padding: "8px 6px",
                    border: "1px solid oklch(0.22 0.034 265)",
                    textAlign: "center",
                  }}
                >
                  <p
                    className="text-xs mb-1"
                    style={{
                      color: "oklch(0.38 0.04 225)",
                      fontSize: "0.62rem",
                    }}
                  >
                    {stat.label}
                  </p>
                  <p
                    className="font-bold"
                    style={{ fontSize: "0.8rem", color: stat.color }}
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
              className="w-full text-xs font-semibold py-2 rounded-xl transition-all"
              style={{
                color: "oklch(0.78 0.18 215)",
                background: "oklch(0.78 0.18 82 / 0.1)",
                border: "1px solid oklch(0.78 0.18 82 / 0.22)",
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
                    border: `1px solid ${action.color}2a`,
                  }}
                >
                  <action.icon
                    style={{ width: 22, height: 22, color: action.color }}
                  />
                </div>
                <span
                  className="font-semibold leading-tight"
                  style={{ fontSize: "0.67rem", color: "oklch(0.88 0.01 210)" }}
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
            className="btn-gold w-full rounded-2xl py-5 font-display font-bold flex items-center justify-center gap-3"
            style={{ fontSize: "1.15rem" }}
            onClick={() => onNavigate("stocks")}
            data-ocid="home.primary_button"
          >
            <Rocket style={{ width: 22, height: 22 }} />
            Start Your Investment Journey
          </button>
        </div>

        {/* ── Footer ── */}
        <div className="text-center pt-2 pb-1">
          <p style={{ fontSize: "0.62rem", color: "oklch(0.35 0.02 265)" }}>
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
