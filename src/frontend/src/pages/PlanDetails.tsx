import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  type ActivePlan,
  type FscUser,
  PLAN_HOURLY_RATE,
  PLAN_TARGET_MULTIPLIER,
  formatInr,
  getActivePlan,
  getCurrentUser,
  saveActivePlan,
  saveUser,
  tickPlanEarnings,
} from "../types/fsc";

interface PlanDetailsProps {
  onBack: () => void;
  onNavigateStocks: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTimeLeft(expiryIso: string) {
  const now = Date.now();
  const end = new Date(expiryIso).getTime();
  const diff = Math.max(0, end - now);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, expired: diff === 0 };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function PlanDetails({
  onBack,
  onNavigateStocks,
}: PlanDetailsProps) {
  const [plan, setPlan] = useState<ActivePlan | null>(null);
  const [_user, setUser] = useState<FscUser | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });
  const tickInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  function loadAndTick() {
    const u = getCurrentUser();
    if (!u) return;
    setUser(u);
    const raw = getActivePlan(u.uniqueId);
    if (!raw) {
      setPlan(null);
      return;
    }
    const updated = tickPlanEarnings(raw);
    // Credit newly earned amount to balance
    const newlyEarned = updated.earnedSoFar - raw.earnedSoFar;
    if (newlyEarned > 0) {
      const updatedUser: FscUser = {
        ...u,
        balance: (u.balance ?? 0) + newlyEarned,
      };
      saveUser(updatedUser);
      setUser(updatedUser);
    }
    saveActivePlan(u.uniqueId, updated);
    setPlan(updated);
    setTimeLeft(getTimeLeft(updated.expiryDate));
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: loadAndTick is stable
  useEffect(() => {
    loadAndTick();
    // Tick earnings every minute
    tickInterval.current = setInterval(loadAndTick, 60 * 1000);
    // Countdown every second
    countdownInterval.current = setInterval(() => {
      setPlan((prev) => {
        if (prev) setTimeLeft(getTimeLeft(prev.expiryDate));
        return prev;
      });
    }, 1000);
    return () => {
      if (tickInterval.current) clearInterval(tickInterval.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, []);

  if (!plan) {
    return (
      <div className="min-h-screen bg-background bg-grid-pattern flex flex-col items-center justify-center px-6 text-center">
        <div
          style={{
            background: "oklch(0.13 0.025 265)",
            border: "1px solid oklch(0.78 0.18 82 / 0.2)",
            borderRadius: 20,
            padding: "48px 36px",
            maxWidth: 360,
          }}
        >
          <TrendingUp
            style={{
              width: 56,
              height: 56,
              color: "oklch(0.78 0.18 82)",
              margin: "0 auto 16px",
            }}
          />
          <h2
            className="font-display font-bold text-foreground"
            style={{ fontSize: "1.4rem", marginBottom: 10 }}
          >
            No Active Plan
          </h2>
          <p
            className="text-muted-foreground text-sm"
            style={{ marginBottom: 28 }}
          >
            You don't have an active investment plan. Go to Markets, deposit
            funds, then purchase a plan.
          </p>
          <Button
            onClick={onNavigateStocks}
            className="btn-gold w-full font-bold uppercase tracking-widest rounded-full"
          >
            Browse Plans
          </Button>
          <Button
            variant="ghost"
            onClick={onBack}
            className="w-full mt-2 text-muted-foreground"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const target = plan.planAmount * PLAN_TARGET_MULTIPLIER;
  const progressPct = Math.min(100, (plan.earnedSoFar / target) * 100);
  const hourlyEarning = plan.planAmount * PLAN_HOURLY_RATE;
  const remaining = Math.max(0, target - plan.earnedSoFar);
  const isClosed = plan.status === "closed";

  const PLAN_FEATURES = [
    { icon: Zap, text: "5% instant bonus on purchase" },
    { icon: TrendingUp, text: "2% earnings per hour, auto-credited" },
    { icon: Trophy, text: "140% total return (100% + 40% bonus)" },
    { icon: Wallet, text: "Earnings direct to your balance" },
    { icon: Clock, text: "24/7 active earning, no manual steps" },
    { icon: CheckCircle2, text: "Priority withdrawal access" },
  ];

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
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
              My Active Plan
            </span>
            <span
              className="text-xs text-muted-foreground font-sans tracking-widest uppercase"
              style={{ fontSize: "0.6rem" }}
            >
              FSC Foreign Smart Coins
            </span>
          </div>
          {/* Status badge */}
          <div className="ml-auto">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest"
              style={{
                background: isClosed
                  ? "oklch(0.78 0.18 82 / 0.15)"
                  : "oklch(0.65 0.2 145 / 0.15)",
                color: isClosed ? "oklch(0.78 0.18 82)" : "oklch(0.65 0.2 145)",
                border: `1px solid ${isClosed ? "oklch(0.78 0.18 82 / 0.35)" : "oklch(0.65 0.2 145 / 0.35)"}`,
              }}
            >
              {isClosed ? "CLOSED" : "ACTIVE"}
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-24 pt-6 max-w-lg">
        {/* Closed Banner */}
        {isClosed && (
          <div
            className="mb-6 rounded-2xl p-6 text-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.18 0.06 82), oklch(0.14 0.04 82))",
              border: "1px solid oklch(0.78 0.18 82 / 0.4)",
              boxShadow: "0 0 40px oklch(0.78 0.18 82 / 0.12)",
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>🎉</div>
            <h2
              className="font-display font-bold"
              style={{
                fontSize: "1.5rem",
                background:
                  "linear-gradient(135deg, oklch(0.90 0.18 82), oklch(0.72 0.20 75))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginBottom: 6,
              }}
            >
              Plan Completed!
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your earnings of {formatInr(plan.earnedSoFar)} have been credited
              to your balance.
            </p>
            <Button
              onClick={onNavigateStocks}
              className="btn-gold font-bold uppercase tracking-widest rounded-full px-8"
            >
              Purchase New Plan
            </Button>
          </div>
        )}

        {/* Plan Info Card */}
        <div
          className="rounded-2xl p-5 mb-4"
          style={{
            background: "oklch(0.13 0.025 265)",
            border: "1px solid oklch(0.78 0.18 82 / 0.2)",
            boxShadow: "0 4px 24px oklch(0.78 0.18 82 / 0.06)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                {plan.planName}
              </p>
              <div
                className="font-display font-bold"
                style={{
                  fontSize: "2rem",
                  background:
                    "linear-gradient(135deg, oklch(0.90 0.18 82), oklch(0.72 0.20 75))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {formatInr(plan.planAmount)}
              </div>
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: "oklch(0.78 0.18 82 / 0.12)",
                border: "1px solid oklch(0.78 0.18 82 / 0.25)",
              }}
            >
              <TrendingUp
                style={{ width: 28, height: 28, color: "oklch(0.78 0.18 82)" }}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-xl p-3"
              style={{
                background: "oklch(0.15 0.03 265)",
                border: "1px solid oklch(0.25 0.04 265)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar
                  style={{
                    width: 12,
                    height: 12,
                    color: "oklch(0.65 0.2 145)",
                  }}
                />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Purchased
                </span>
              </div>
              <p className="font-semibold text-foreground text-sm">
                {formatDate(plan.purchaseDate)}
              </p>
            </div>
            <div
              className="rounded-xl p-3"
              style={{
                background: "oklch(0.15 0.03 265)",
                border: "1px solid oklch(0.25 0.04 265)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar
                  style={{
                    width: 12,
                    height: 12,
                    color: "oklch(0.65 0.22 22)",
                  }}
                />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Expires
                </span>
              </div>
              <p className="font-semibold text-foreground text-sm">
                {formatDate(plan.expiryDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        {!isClosed && (
          <div
            className="rounded-2xl p-5 mb-4 text-center"
            style={{
              background: "oklch(0.13 0.025 265)",
              border: "1px solid oklch(0.78 0.18 82 / 0.15)",
            }}
          >
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
              Time Remaining
            </p>
            <div className="flex items-center justify-center gap-2">
              {[
                { val: timeLeft.days, label: "Days" },
                { val: timeLeft.hours, label: "Hours" },
                { val: timeLeft.minutes, label: "Mins" },
                { val: timeLeft.seconds, label: "Secs" },
              ].map((unit, i) => (
                <>
                  {i > 0 && (
                    <span
                      key={`sep-${unit.label}`}
                      className="font-display font-bold"
                      style={{
                        fontSize: "1.6rem",
                        color: "oklch(0.78 0.18 82 / 0.5)",
                        lineHeight: 1,
                      }}
                    >
                      :
                    </span>
                  )}
                  <div key={unit.label} className="flex flex-col items-center">
                    <div
                      className="font-display font-bold"
                      style={{
                        fontSize: "2rem",
                        lineHeight: 1,
                        background:
                          "linear-gradient(135deg, oklch(0.90 0.18 82), oklch(0.72 0.20 75))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        minWidth: 44,
                        textAlign: "center",
                      }}
                    >
                      {pad(unit.val)}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                      {unit.label}
                    </span>
                  </div>
                </>
              ))}
            </div>
          </div>
        )}

        {/* Earnings Progress */}
        <div
          className="rounded-2xl p-5 mb-4"
          style={{
            background: "oklch(0.13 0.025 265)",
            border: "1px solid oklch(0.78 0.18 82 / 0.15)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">
              Earnings Progress
            </p>
            <span
              className="text-xs font-bold"
              style={{
                color:
                  progressPct >= 100
                    ? "oklch(0.78 0.18 82)"
                    : "oklch(0.65 0.2 145)",
              }}
            >
              {progressPct.toFixed(1)}%
            </span>
          </div>
          <div className="relative mb-2">
            <Progress
              value={progressPct}
              className="h-3 rounded-full"
              style={{ background: "oklch(0.18 0.03 265)" }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatInr(plan.earnedSoFar)} earned</span>
            <span>Target: {formatInr(target)}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            {
              label: "Earned So Far",
              value: formatInr(plan.earnedSoFar),
              color: "oklch(0.65 0.2 145)",
            },
            {
              label: "Hourly Rate",
              value: `${formatInr(hourlyEarning)}/hr`,
              color: "oklch(0.78 0.18 82)",
            },
            {
              label: "Total Target",
              value: formatInr(target),
              color: "oklch(0.72 0.18 290)",
            },
            {
              label: "Still to Earn",
              value: formatInr(remaining),
              color: isClosed ? "oklch(0.50 0.02 265)" : "oklch(0.65 0.22 22)",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-4"
              style={{
                background: "oklch(0.15 0.03 265)",
                border: "1px solid oklch(0.25 0.04 265)",
              }}
            >
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                {stat.label}
              </p>
              <p
                className="font-display font-bold text-sm"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Plan Features */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "oklch(0.13 0.025 265)",
            border: "1px solid oklch(0.78 0.18 82 / 0.15)",
          }}
        >
          <p className="text-sm font-semibold text-foreground mb-4">
            Plan Features
          </p>
          <div className="space-y-3">
            {PLAN_FEATURES.map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "oklch(0.65 0.2 145 / 0.12)",
                    border: "1px solid oklch(0.65 0.2 145 / 0.25)",
                  }}
                >
                  <f.icon
                    style={{
                      width: 14,
                      height: 14,
                      color: "oklch(0.65 0.2 145)",
                    }}
                  />
                </div>
                <span className="text-sm text-foreground/80">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
