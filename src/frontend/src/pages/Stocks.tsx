import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle,
  Lock,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMarketTicker } from "../hooks/useMarketTicker";
import {
  type ActivePlan,
  type FscUser,
  PLAN_HOURLY_RATE,
  PLAN_TARGET_MULTIPLIER,
  formatInr,
  getActivePlan,
  getCurrentUser,
  getCustomPlans,
  saveActivePlan,
  saveUser,
  tickPlanEarnings,
} from "../types/fsc";

const STOCK_PLANS = [
  { amount: 50, name: "Starter Pack", desc: "Perfect for beginners" },
  { amount: 150, name: "Basic Plan", desc: "Low-risk entry" },
  { amount: 250, name: "Bronze Plan", desc: "Small steady growth" },
  { amount: 350, name: "Silver Lite", desc: "Consistent returns" },
  { amount: 550, name: "Silver Plan", desc: "Popular choice" },
  { amount: 780, name: "Silver Plus", desc: "Enhanced returns" },
  { amount: 1120, name: "Gold Lite", desc: "Premium entry level" },
  { amount: 2238, name: "Gold Plan", desc: "High growth potential" },
  { amount: 3000, name: "Gold Plus", desc: "Accelerated growth" },
  { amount: 3700, name: "Platinum Lite", desc: "Elite tier begins" },
  { amount: 4200, name: "Platinum Plan", desc: "Top performer" },
  { amount: 5200, name: "Platinum Plus", desc: "Maximum returns" },
  { amount: 6600, name: "Diamond Lite", desc: "VIP access" },
  { amount: 7900, name: "Diamond Plan", desc: "Premium VIP" },
  { amount: 9000, name: "Diamond Plus", desc: "Elite wealth builder" },
  { amount: 12800, name: "Elite Plan", desc: "Exclusive tier" },
  { amount: 15002, name: "Elite Plus", desc: "Ultra premium" },
  { amount: 19999, name: "Royal Plan", desc: "Highest tier" },
];

function Sparkline({ positive }: { positive: boolean }) {
  const points = [
    [0, 20],
    [8, 14],
    [16, 18],
    [24, 10],
    [32, 13],
    [40, 7],
    [48, 12],
    [56, 5],
    [64, 8],
  ];
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`)
    .join(" ");
  const fillD = `${pathD} L 64 30 L 0 30 Z`;
  const strokeColor = positive ? "#22c55e" : "#ef4444";
  const fillColor = positive
    ? "oklch(0.65 0.20 145 / 0.12)"
    : "oklch(0.65 0.22 22 / 0.12)";
  const transform = positive ? "" : "scale(1,-1) translate(0,-30)";
  return (
    <svg
      width="64"
      height="30"
      viewBox="0 0 64 30"
      fill="none"
      role="img"
      aria-label={`${positive ? "Positive" : "Negative"} trend`}
      style={{ overflow: "visible" }}
    >
      <title>{positive ? "Upward trend" : "Downward trend"}</title>
      <g transform={transform}>
        <path d={fillD} fill={fillColor} />
        <path d={pathD} stroke={strokeColor} strokeWidth="1.5" fill="none" />
      </g>
    </svg>
  );
}

interface StocksProps {
  onBack: () => void;
  onPurchaseSuccess: () => void;
  onViewPlan: () => void;
  onNavigateAddFunds: () => void;
}

interface ConfirmPlan {
  amount: number;
  name: string;
  desc: string;
}

export default function Stocks({
  onBack,
  onPurchaseSuccess,
  onViewPlan,
  onNavigateAddFunds,
}: StocksProps) {
  const ticker = useMarketTicker();
  const [user, setUser] = useState<FscUser | null>(null);
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
  const [confirmPlan, setConfirmPlan] = useState<ConfirmPlan | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [allPlans, setAllPlans] = useState(() => {
    const custom = getCustomPlans();
    const customMapped = custom.map((cp) => ({
      amount: cp.price,
      name: cp.name,
      desc: cp.description || "Custom plan",
    }));
    return [...STOCK_PLANS, ...customMapped];
  });

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    if (u) {
      const raw = getActivePlan(u.uniqueId);
      if (raw) {
        const ticked = tickPlanEarnings(raw);
        saveActivePlan(u.uniqueId, ticked);
        setActivePlan(ticked);
      }
    }
    // Reload custom plans on mount
    const custom = getCustomPlans();
    const customMapped = custom.map((cp) => ({
      amount: cp.price,
      name: cp.name,
      desc: cp.description || "Custom plan",
    }));
    setAllPlans([...STOCK_PLANS, ...customMapped]);
  }, []);

  const hasActivePlan = activePlan && activePlan.status === "active";

  function handleSelectPlan(plan: ConfirmPlan) {
    if (hasActivePlan) return;
    setConfirmPlan(plan);
  }

  function handlePurchase() {
    if (!confirmPlan || !user) return;
    if ((user.balance ?? 0) < confirmPlan.amount) {
      toast.error("Insufficient balance. Please add funds first.");
      return;
    }
    setPurchasing(true);
    setTimeout(() => {
      const bonus = confirmPlan.amount * 0.05;
      const newBalance = (user.balance ?? 0) - confirmPlan.amount + bonus;
      const now = new Date();
      const expiry = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      const newPlan: ActivePlan = {
        id: Date.now().toString(),
        userId: user.uniqueId,
        planName: confirmPlan.name,
        planAmount: confirmPlan.amount,
        purchaseDate: now.toISOString(),
        expiryDate: expiry.toISOString(),
        status: "active",
        earnedSoFar: bonus,
        lastUpdated: now.toISOString(),
      };
      const updatedUser: FscUser = { ...user, balance: newBalance };
      saveUser(updatedUser);
      saveActivePlan(user.uniqueId, newPlan);
      setUser(updatedUser);
      setActivePlan(newPlan);
      setConfirmPlan(null);
      setPurchasing(false);
      toast.success(
        `${confirmPlan.name} purchased! ₹${bonus.toFixed(2)} bonus credited.`,
      );
      onPurchaseSuccess();
    }, 900);
  }

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      <header className="glass-header sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            data-ocid="stocks.close_button"
            onClick={onBack}
            className="text-primary hover:text-primary hover:bg-primary/10 border border-primary/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <img
            src="/assets/generated/fsc-logo-premium-transparent.dim_300x300.png"
            alt="FSC Logo"
            className="w-9 h-9 object-contain"
            style={{ filter: "drop-shadow(0 0 8px oklch(0.78 0.18 82 / 0.5))" }}
          />
          <div className="flex flex-col leading-tight">
            <span
              className="font-display text-primary font-bold tracking-tight"
              style={{ fontSize: "1.05rem" }}
            >
              FSC
            </span>
            <span
              className="text-xs text-muted-foreground font-sans tracking-widest uppercase"
              style={{ fontSize: "0.6rem" }}
            >
              Foreign Smart Coins
            </span>
          </div>
          {/* Balance chip */}
          {user && (
            <div
              className="ml-auto text-right"
              style={{
                background: "oklch(0.78 0.18 82 / 0.1)",
                border: "1px solid oklch(0.78 0.18 82 / 0.25)",
                borderRadius: 10,
                padding: "4px 10px",
              }}
            >
              <p
                className="text-xs text-muted-foreground"
                style={{ fontSize: "0.6rem" }}
              >
                Balance
              </p>
              <p
                className="font-display font-bold text-primary"
                style={{ fontSize: "0.85rem" }}
              >
                {formatInr(user.balance ?? 0)}
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Active plan lock banner */}
      {hasActivePlan && (
        <div className="container mx-auto px-4 pt-4">
          <div
            className="rounded-2xl p-4 flex items-center justify-between gap-3"
            style={{
              background: "oklch(0.78 0.18 82 / 0.08)",
              border: "1px solid oklch(0.78 0.18 82 / 0.3)",
            }}
          >
            <div className="flex items-center gap-3">
              <Lock
                style={{
                  width: 20,
                  height: 20,
                  color: "oklch(0.78 0.18 82)",
                  flexShrink: 0,
                }}
              />
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "oklch(0.85 0.12 82)" }}
                >
                  Active Plan Running
                </p>
                <p className="text-xs text-muted-foreground">
                  Complete your current {activePlan.planName} to unlock a new
                  plan.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={onViewPlan}
              className="btn-gold font-bold text-xs rounded-full px-4 whitespace-nowrap"
            >
              View Plan
            </Button>
          </div>
        </div>
      )}

      <section className="relative pt-8 pb-6 text-center overflow-hidden">
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.78 0.18 82 / 0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center justify-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs font-sans uppercase tracking-[0.3em] text-primary/80">
              Live Investment Plans
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-2 tracking-tight">
            Investment{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.90 0.18 82), oklch(0.72 0.20 75))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Portfolio
            </span>
          </h1>
          <p className="font-sans text-muted-foreground text-sm max-w-md mx-auto">
            Select a plan and purchase using your wallet balance. Funds must be
            added first via Add Funds.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <div
            data-ocid="stocks.list"
            className="grid gap-4 sm:grid-cols-2 md:grid-cols-3"
          >
            {allPlans.map((plan, index) => {
              const pct = ticker[plan.amount];
              const isPositive = pct !== undefined && pct >= 0;
              const pctDisplay =
                pct !== undefined
                  ? `${isPositive ? "+" : ""}${pct.toFixed(2)}%`
                  : "";
              const locked = !!hasActivePlan;
              const insufficientBalance =
                !locked && (user?.balance ?? 0) < plan.amount;

              return (
                <div
                  key={plan.amount}
                  data-ocid={`stocks.item.${index + 1}`}
                  className="stock-card bg-card border border-border rounded-xl p-5"
                  style={{ opacity: locked ? 0.6 : 1 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Badge
                      variant="secondary"
                      className="text-xs font-sans font-semibold bg-secondary text-muted-foreground uppercase tracking-wider"
                    >
                      Plan #{index + 1}
                    </Badge>
                    {pctDisplay && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          color: isPositive ? "#22c55e" : "#ef4444",
                          background: isPositive
                            ? "oklch(0.65 0.20 145 / 0.12)"
                            : "oklch(0.65 0.22 22 / 0.12)",
                          border: `1px solid ${isPositive ? "oklch(0.65 0.20 145 / 0.3)" : "oklch(0.65 0.22 22 / 0.3)"}`,
                          borderRadius: 5,
                          padding: "2px 6px",
                        }}
                      >
                        {isPositive ? (
                          <TrendingUp style={{ width: 10, height: 10 }} />
                        ) : (
                          <TrendingDown style={{ width: 10, height: 10 }} />
                        )}
                        {pctDisplay}
                      </span>
                    )}
                  </div>

                  <p
                    className="font-sans font-semibold"
                    style={{
                      fontSize: "0.78rem",
                      color: "oklch(0.70 0.04 82)",
                      marginBottom: 2,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {plan.name}
                  </p>
                  <div
                    className="font-display font-bold text-primary mb-1"
                    style={{
                      fontSize: "clamp(1.4rem, 3.5vw, 1.9rem)",
                      lineHeight: 1.1,
                    }}
                  >
                    ₹{plan.amount.toLocaleString("en-IN")}
                  </div>
                  <p
                    className="font-sans"
                    style={{
                      fontSize: "0.7rem",
                      color: "oklch(0.48 0.02 265)",
                      marginBottom: 10,
                    }}
                  >
                    {plan.desc}
                  </p>
                  <div style={{ marginBottom: 12, opacity: 0.8 }}>
                    <Sparkline positive={isPositive} />
                  </div>

                  {/* Returns info */}
                  {!locked && (
                    <div
                      className="flex justify-between text-xs mb-3"
                      style={{ color: "oklch(0.60 0.04 265)" }}
                    >
                      <span>
                        Earns: +{(plan.amount * PLAN_HOURLY_RATE).toFixed(2)}/hr
                      </span>
                      <span style={{ color: "oklch(0.65 0.2 145)" }}>
                        +{(plan.amount * PLAN_TARGET_MULTIPLIER).toFixed(0)}{" "}
                        total
                      </span>
                    </div>
                  )}

                  {locked ? (
                    <div className="w-full text-xs font-sans font-semibold uppercase tracking-[0.12em] py-2 rounded-lg border border-border text-muted-foreground flex items-center justify-center gap-1.5 cursor-not-allowed">
                      <Lock style={{ width: 11, height: 11 }} /> Locked
                    </div>
                  ) : insufficientBalance ? (
                    <button
                      type="button"
                      data-ocid={`stocks.addfunds_button.${index + 1}`}
                      onClick={onNavigateAddFunds}
                      className="w-full text-xs font-sans font-semibold uppercase tracking-[0.12em] py-2 rounded-lg border border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10 transition-all duration-200"
                    >
                      Add Funds
                    </button>
                  ) : (
                    <button
                      type="button"
                      data-ocid={`stocks.select_button.${index + 1}`}
                      onClick={() => handleSelectPlan(plan)}
                      className="w-full text-xs font-sans font-semibold uppercase tracking-[0.15em] py-2 rounded-lg border border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/70 transition-all duration-200"
                    >
                      Select Plan
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="border-t border-border/50 py-7">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} FSC Foreign Smart Coins.</p>
        </div>
      </footer>

      {/* Purchase Confirmation Modal */}
      {confirmPlan && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
          style={{
            background: "oklch(0.05 0.01 265 / 0.85)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6"
            style={{
              background: "oklch(0.13 0.025 265)",
              border: "1px solid oklch(0.78 0.18 82 / 0.3)",
              boxShadow: "0 20px 60px oklch(0.78 0.18 82 / 0.15)",
            }}
          >
            {/* Close */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-foreground text-lg">
                Confirm Purchase
              </h3>
              <button
                type="button"
                onClick={() => setConfirmPlan(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            {/* Plan */}
            <div
              className="rounded-xl p-4 mb-4"
              style={{
                background: "oklch(0.15 0.03 265)",
                border: "1px solid oklch(0.78 0.18 82 / 0.2)",
              }}
            >
              <p className="text-xs text-muted-foreground mb-1">
                {confirmPlan.name}
              </p>
              <p
                className="font-display font-bold text-primary"
                style={{ fontSize: "1.8rem" }}
              >
                {formatInr(confirmPlan.amount)}
              </p>
              <p className="text-xs text-muted-foreground">
                {confirmPlan.desc}
              </p>
            </div>

            {/* Details */}
            <div className="space-y-2.5 mb-5">
              {[
                {
                  label: "Your Balance",
                  value: formatInr(user?.balance ?? 0),
                  color: "oklch(0.78 0.18 82)",
                },
                {
                  label: "Plan Cost",
                  value: `- ${formatInr(confirmPlan.amount)}`,
                  color: "oklch(0.65 0.22 22)",
                },
                {
                  label: "Instant 5% Bonus",
                  value: `+ ${formatInr(confirmPlan.amount * 0.05)}`,
                  color: "oklch(0.65 0.2 145)",
                },
                {
                  label: "Hourly Earning",
                  value: `${formatInr(confirmPlan.amount * PLAN_HOURLY_RATE)}/hr`,
                  color: "oklch(0.65 0.2 145)",
                },
                {
                  label: "Total to Earn",
                  value: formatInr(confirmPlan.amount * PLAN_TARGET_MULTIPLIER),
                  color: "oklch(0.78 0.18 82)",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm text-muted-foreground">
                    {row.label}
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: row.color }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
              {/* Divider + balance after */}
              <div className="border-t border-border/50 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-foreground">
                    Balance After Purchase
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{
                      color:
                        (user?.balance ?? 0) -
                          confirmPlan.amount +
                          confirmPlan.amount * 0.05 >=
                        0
                          ? "oklch(0.65 0.2 145)"
                          : "oklch(0.65 0.22 22)",
                    }}
                  >
                    {formatInr(
                      (user?.balance ?? 0) -
                        confirmPlan.amount +
                        confirmPlan.amount * 0.05,
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Insufficient balance warning */}
            {(user?.balance ?? 0) < confirmPlan.amount && (
              <div
                className="rounded-xl p-3 mb-4 text-xs"
                style={{
                  background: "oklch(0.65 0.22 22 / 0.1)",
                  border: "1px solid oklch(0.65 0.22 22 / 0.3)",
                  color: "oklch(0.75 0.15 55)",
                }}
              >
                Insufficient balance. Add funds to continue.
              </div>
            )}

            {/* Buttons */}
            <div className="space-y-2">
              {(user?.balance ?? 0) < confirmPlan.amount ? (
                <Button
                  onClick={() => {
                    setConfirmPlan(null);
                    onNavigateAddFunds();
                  }}
                  className="btn-gold w-full font-bold uppercase tracking-widest rounded-full"
                >
                  Add Funds First
                </Button>
              ) : (
                <Button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="btn-gold w-full font-bold uppercase tracking-widest rounded-full"
                >
                  {purchasing ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle style={{ width: 16, height: 16 }} />
                      Purchase Plan
                    </span>
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => setConfirmPlan(null)}
                className="w-full text-muted-foreground"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
