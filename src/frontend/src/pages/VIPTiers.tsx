import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, Star } from "lucide-react";
import {
  type VipTier,
  getCurrentUser,
  getPayments,
  getVipTier,
} from "../types/fsc";

interface VIPTiersProps {
  onBack: () => void;
}

const TIERS: Array<{
  id: VipTier;
  name: string;
  icon: string;
  range: string;
  min: number;
  max: number | null;
  color: string;
  dimColor: string;
  perks: string[];
}> = [
  {
    id: "bronze",
    name: "Bronze",
    icon: "\uD83E\uDD49",
    range: "\u20B90 \u2013 \u20B94,999",
    min: 0,
    max: 5000,
    color: "oklch(0.65 0.13 55)",
    dimColor: "oklch(0.65 0.13 55 / 0.15)",
    perks: [
      "Basic market access",
      "Standard withdrawal (48h)",
      "Email support",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    icon: "\uD83E\uDD48",
    range: "\u20B95,000 \u2013 \u20B919,999",
    min: 5000,
    max: 20000,
    color: "oklch(0.78 0.05 265)",
    dimColor: "oklch(0.78 0.05 265 / 0.14)",
    perks: [
      "All Bronze perks",
      "Faster withdrawals (24h)",
      "Priority support",
      "Higher earning rates",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    icon: "\uD83E\uDD47",
    range: "\u20B920,000 \u2013 \u20B949,999",
    min: 20000,
    max: 50000,
    color: "oklch(0.80 0.19 82)",
    dimColor: "oklch(0.80 0.19 82 / 0.14)",
    perks: [
      "All Silver perks",
      "12h withdrawal processing",
      "Dedicated account manager",
      "Exclusive Gold plans",
      "Monthly bonus rewards",
    ],
  },
  {
    id: "platinum",
    name: "Platinum",
    icon: "\uD83D\uDC8E",
    range: "\u20B950,000+",
    min: 50000,
    max: null,
    color: "oklch(0.70 0.20 290)",
    dimColor: "oklch(0.70 0.20 290 / 0.14)",
    perks: [
      "All Gold perks",
      "Instant withdrawals",
      "Personal VIP advisor",
      "Platinum-only plans (20%+)",
      "Zero transaction fees",
      "Annual bonus up to \u20B925,000",
    ],
  },
];

export default function VIPTiers({ onBack }: VIPTiersProps) {
  const user = getCurrentUser();
  const allPayments = getPayments();
  const myApproved = user
    ? allPayments.filter(
        (p) => p.userId === user.uniqueId && p.status === "approved",
      )
    : [];
  const totalInvested = myApproved.reduce((s, p) => s + p.amount, 0);
  const currentTier = getVipTier(totalInvested);

  const currentIdx = TIERS.findIndex((t) => t.id === currentTier);
  const nextTier = TIERS[currentIdx + 1] ?? null;
  const progressToNext = nextTier
    ? Math.min(
        ((totalInvested - TIERS[currentIdx].min) /
          (nextTier.min - TIERS[currentIdx].min)) *
          100,
        100,
      )
    : 100;
  const amountToNext = nextTier ? Math.max(nextTier.min - totalInvested, 0) : 0;

  return (
    <div className="page-wrapper bg-grid-pattern">
      <header className="glass-header sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="btn-glass rounded-xl p-2"
            data-ocid="vip.back.button"
          >
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <Star
            style={{ width: 18, height: 18, color: "oklch(0.78 0.18 82)" }}
          />
          <h1 className="font-display font-bold text-foreground text-lg">
            VIP Tiers
          </h1>
        </div>
      </header>

      <main className="px-4 pt-5 pb-8">
        {/* Current Tier Hero */}
        <div
          className="card-premium animate-scale-in p-5 mb-6"
          style={{
            background: `linear-gradient(145deg, ${TIERS[currentIdx].dimColor}, oklch(0.13 0.025 265))`,
            borderColor: `${TIERS[currentIdx].color}30`,
            boxShadow: `0 12px 48px ${TIERS[currentIdx].color.replace(")", " / 0.18)")}, 0 2px 0 ${TIERS[currentIdx].color.replace(")", " / 0.08)")} inset`,
          }}
          data-ocid="vip.current.panel"
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{
                background: TIERS[currentIdx].dimColor,
                border: `1px solid ${TIERS[currentIdx].color}44`,
                boxShadow: `0 0 24px ${TIERS[currentIdx].color.replace(")", " / 0.25)")}`,
              }}
            >
              {TIERS[currentIdx].icon}
            </div>
            <div>
              <p
                className="text-xs uppercase tracking-widest mb-0.5"
                style={{ color: "oklch(0.5 0.02 265)" }}
              >
                Your Current Tier
              </p>
              <p
                className="font-display font-bold text-3xl"
                style={{
                  background: `linear-gradient(135deg, ${TIERS[currentIdx].color}, oklch(0.95 0.08 88))`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {TIERS[currentIdx].name}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm mb-3">
            <span style={{ color: "oklch(0.55 0.02 265)" }}>
              Total Invested
            </span>
            <span
              className="font-bold"
              style={{ color: "oklch(0.88 0.01 80)" }}
            >
              \u20B9{totalInvested.toLocaleString("en-IN")}
            </span>
          </div>

          {nextTier ? (
            <>
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: "oklch(0.5 0.02 265)" }}>
                  Progress to {nextTier.name}
                </span>
                <span className="font-bold" style={{ color: nextTier.color }}>
                  \u20B9{amountToNext.toLocaleString("en-IN")} more
                </span>
              </div>
              <Progress
                value={progressToNext}
                className="h-2 rounded-full"
                style={{ background: "oklch(0.18 0.03 265)" }}
              />
            </>
          ) : (
            <p
              className="text-sm font-bold"
              style={{ color: TIERS[currentIdx].color }}
            >
              \u2728 Highest tier achieved!
            </p>
          )}
        </div>

        {/* Tier Cards */}
        <div className="section-label">All Tiers</div>
        <div className="space-y-3">
          {TIERS.map((tier, idx) => {
            const isActive = tier.id === currentTier;
            return (
              <div
                key={tier.id}
                className="card-premium animate-fade-in-up p-4"
                style={{
                  animationDelay: `${idx * 0.07}s`,
                  opacity: 0,
                  animationFillMode: "forwards",
                  background: isActive
                    ? `linear-gradient(145deg, ${tier.dimColor}, oklch(0.135 0.026 265))`
                    : "oklch(0.13 0.025 265)",
                  borderColor: isActive
                    ? `${tier.color}40`
                    : "oklch(0.22 0.035 265)",
                  boxShadow: isActive
                    ? `0 6px 28px ${tier.color.replace(")", " / 0.14)")}`
                    : "none",
                }}
                data-ocid={`vip.${tier.id}.card`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      background: tier.dimColor,
                      border: `1px solid ${tier.color}33`,
                    }}
                  >
                    {tier.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className="font-display font-bold text-base"
                        style={{ color: tier.color }}
                      >
                        {tier.name}
                      </p>
                      {isActive && (
                        <span
                          className="badge-pill"
                          style={{
                            background: tier.dimColor,
                            color: tier.color,
                            borderColor: `${tier.color}44`,
                            fontSize: "0.6rem",
                          }}
                        >
                          \u2022 Current
                        </span>
                      )}
                    </div>
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.48 0.02 265)" }}
                    >
                      {tier.range}
                    </p>
                  </div>
                </div>

                {/* Perk list */}
                <ul className="space-y-1">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-sm">
                      <CheckCircle2
                        style={{
                          width: 13,
                          height: 13,
                          color: tier.color,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ color: "oklch(0.70 0.01 80)" }}>
                        {perk}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
