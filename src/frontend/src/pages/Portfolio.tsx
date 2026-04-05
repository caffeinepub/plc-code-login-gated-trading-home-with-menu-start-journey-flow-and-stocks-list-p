import { ArrowLeft, Briefcase, TrendingDown, TrendingUp } from "lucide-react";
import { formatInr, getCurrentUser, getPayments } from "../types/fsc";

interface PortfolioProps {
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

const STOCK_PLANS = [
  { amount: 50, name: "Starter Pack" },
  { amount: 150, name: "Basic Plan" },
  { amount: 250, name: "Bronze Plan" },
  { amount: 350, name: "Silver Lite" },
  { amount: 550, name: "Silver Plan" },
  { amount: 780, name: "Silver Plus" },
  { amount: 1120, name: "Gold Lite" },
  { amount: 2238, name: "Gold Plan" },
  { amount: 3000, name: "Gold Plus" },
  { amount: 3700, name: "Platinum Lite" },
  { amount: 4200, name: "Platinum Plan" },
  { amount: 5200, name: "Platinum Plus" },
  { amount: 6600, name: "Diamond Lite" },
  { amount: 7900, name: "Diamond Plan" },
  { amount: 9000, name: "Diamond Plus" },
  { amount: 12800, name: "Elite Plan" },
  { amount: 15002, name: "Elite Plus" },
  { amount: 19999, name: "Royal Plan" },
];

function getPlanName(amount: number): string {
  const plan = STOCK_PLANS.find((p) => p.amount === amount);
  return plan ? plan.name : `Plan ₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function Portfolio({ onBack, onNavigate }: PortfolioProps) {
  const user = getCurrentUser();
  const allPayments = getPayments();
  const investments = allPayments.filter(
    (p) => p.userId === user?.uniqueId && p.status === "approved",
  );

  const totalInvested = investments.reduce((sum, p) => sum + p.amount, 0);
  const growthRate = 0.08;
  const currentValue = totalInvested * (1 + growthRate);
  const profitLoss = currentValue - totalInvested;
  const isProfit = profitLoss >= 0;

  return (
    <div className="page-wrapper bg-grid-pattern">
      <header className="glass-header sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="btn-glass rounded-xl p-2"
            data-ocid="portfolio.back.button"
          >
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <Briefcase
            style={{ width: 20, height: 20, color: "oklch(0.78 0.18 82)" }}
          />
          <div>
            <p
              className="font-display font-bold text-primary"
              style={{ fontSize: "1.05rem" }}
            >
              My Portfolio
            </p>
            <p className="text-muted-foreground text-xs">
              {investments.length} investment
              {investments.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 pt-5 pb-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-5 animate-scale-in">
          {[
            {
              label: "Invested",
              value: formatInr(totalInvested),
              color: "oklch(0.78 0.18 82)",
            },
            {
              label: "Current Value",
              value: formatInr(currentValue),
              color: "oklch(0.78 0.18 82)",
            },
            {
              label: "P&L",
              value: formatInr(Math.abs(profitLoss)),
              color: isProfit ? "oklch(0.65 0.2 145)" : "oklch(0.65 0.22 22)",
              prefix: isProfit ? "+" : "-",
            },
          ].map((card) => (
            <div key={card.label} className="stat-card text-center">
              <p
                className="text-muted-foreground uppercase mb-1"
                style={{ fontSize: "0.58rem", letterSpacing: "0.1em" }}
              >
                {card.label}
              </p>
              <p
                className="font-display font-bold"
                style={{ fontSize: "0.85rem", color: card.color }}
              >
                {card.prefix ?? ""}
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* P&L indicator */}
        {totalInvested > 0 && (
          <div
            className="rounded-xl px-4 py-3 mb-5 flex items-center gap-3 animate-fade-in"
            style={{
              background: isProfit
                ? "oklch(0.65 0.2 145 / 0.08)"
                : "oklch(0.65 0.22 22 / 0.08)",
              border: `1px solid ${isProfit ? "oklch(0.65 0.2 145 / 0.3)" : "oklch(0.65 0.22 22 / 0.3)"}`,
            }}
          >
            {isProfit ? (
              <TrendingUp
                style={{
                  width: 18,
                  height: 18,
                  color: "oklch(0.65 0.2 145)",
                  flexShrink: 0,
                }}
              />
            ) : (
              <TrendingDown
                style={{
                  width: 18,
                  height: 18,
                  color: "oklch(0.65 0.22 22)",
                  flexShrink: 0,
                }}
              />
            )}
            <p
              className="text-sm"
              style={{
                color: isProfit ? "oklch(0.65 0.2 145)" : "oklch(0.65 0.22 22)",
              }}
            >
              {isProfit
                ? `+${growthRate * 100}% estimated annual growth`
                : "Negative returns currently"}
            </p>
          </div>
        )}

        {/* Investments List */}
        {investments.length === 0 ? (
          <div
            className="text-center py-12 animate-fade-in rounded-2xl"
            style={{
              background: "oklch(0.13 0.025 265)",
              border: "1px dashed oklch(0.25 0.04 265)",
            }}
            data-ocid="portfolio.empty_state"
          >
            <TrendingUp
              style={{
                width: 44,
                height: 44,
                margin: "0 auto 12px",
                opacity: 0.25,
                color: "oklch(0.78 0.18 82)",
              }}
            />
            <p className="font-display font-semibold text-muted-foreground text-lg mb-2">
              No Investments Yet
            </p>
            <p className="text-muted-foreground text-sm mb-4">
              Add funds to start investing
            </p>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate("add-funds")}
                className="btn-gold rounded-xl px-6 py-2.5 text-sm font-bold"
              >
                Add Funds
              </button>
            )}
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">
              Investment History
            </p>
            <div className="space-y-3" data-ocid="portfolio.list">
              {investments.map((inv, idx) => (
                <div
                  key={inv.id}
                  className="rounded-xl p-4 flex justify-between items-center"
                  style={{
                    background: "oklch(0.13 0.025 265)",
                    border: "1px solid oklch(0.22 0.035 265)",
                  }}
                  data-ocid={`portfolio.item.${idx + 1}`}
                >
                  <div>
                    <p className="font-semibold text-sm text-foreground mb-0.5">
                      {getPlanName(inv.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(inv.date)} \u00b7 {inv.method}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="font-display font-bold text-primary"
                      style={{ fontSize: "1rem" }}
                    >
                      {formatInr(inv.amount)}
                    </p>
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded"
                      style={{
                        background: "oklch(0.65 0.2 145 / 0.12)",
                        color: "oklch(0.65 0.2 145)",
                      }}
                    >
                      Approved
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
