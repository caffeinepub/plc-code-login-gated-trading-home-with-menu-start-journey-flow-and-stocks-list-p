import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calculator, TrendingUp } from "lucide-react";
import { useState } from "react";
import { formatInr } from "../types/fsc";

interface EarningCalculatorProps {
  onBack: () => void;
}

const DURATIONS = [
  { label: "7 Days", days: 7 },
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
  { label: "1 Year", days: 365 },
];

const RATES = [
  {
    label: "Conservative",
    annual: 0.03,
    color: "oklch(0.68 0.18 160)",
    bg: "oklch(0.68 0.18 160 / 0.1)",
  },
  {
    label: "Moderate",
    annual: 0.05,
    color: "oklch(0.68 0.20 145)",
    bg: "oklch(0.68 0.20 145 / 0.1)",
  },
  {
    label: "Growth",
    annual: 0.08,
    color: "oklch(0.78 0.18 82)",
    bg: "oklch(0.78 0.18 82 / 0.1)",
  },
  {
    label: "Premium",
    annual: 0.12,
    color: "oklch(0.72 0.20 62)",
    bg: "oklch(0.72 0.20 62 / 0.1)",
  },
  {
    label: "Elite",
    annual: 0.18,
    color: "oklch(0.70 0.20 290)",
    bg: "oklch(0.70 0.20 290 / 0.1)",
  },
];

function calcReturn(principal: number, annualRate: number, days: number) {
  return principal * (annualRate / 365) * days;
}

export default function EarningCalculator({ onBack }: EarningCalculatorProps) {
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState(DURATIONS[1]);

  const principal = Number(amount) || 0;

  return (
    <div className="page-wrapper bg-grid-pattern">
      <header className="glass-header sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="btn-glass rounded-xl p-2"
            data-ocid="calc.back.button"
          >
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <Calculator
            style={{ width: 18, height: 18, color: "oklch(0.78 0.18 82)" }}
          />
          <h1 className="font-display font-bold text-foreground text-lg">
            Earning Calculator
          </h1>
        </div>
      </header>

      <main className="px-4 pt-5 pb-8">
        {/* Hero amount display */}
        <div className="balance-hero animate-scale-in p-5 mb-5 text-center">
          <p
            className="text-xs uppercase tracking-widest mb-2"
            style={{ color: "oklch(0.5 0.02 265)" }}
          >
            Investment Amount
          </p>
          {principal > 0 ? (
            <div className="balance-hero-amount">{formatInr(principal)}</div>
          ) : (
            <p
              className="font-display font-bold"
              style={{ fontSize: "2rem", color: "oklch(0.32 0.02 265)" }}
            >
              ₹ 0.00
            </p>
          )}
          {principal > 0 && (
            <p
              className="text-xs mt-1"
              style={{ color: "oklch(0.48 0.02 265)" }}
            >
              over {duration.label}
            </p>
          )}
        </div>

        {/* Input + Duration */}
        <div className="card-premium p-4 mb-5 animate-fade-in-up">
          <Label
            className="text-xs font-semibold uppercase tracking-wider mb-2 block"
            style={{ color: "oklch(0.55 0.02 265)" }}
          >
            Enter Amount (₹)
          </Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 5000"
            className="rounded-xl mb-4 font-bold text-lg"
            style={{
              background: "oklch(0.15 0.025 265)",
              border: "1px solid oklch(0.26 0.04 265)",
              color: "oklch(0.92 0.01 80)",
            }}
            data-ocid="calc.amount.input"
          />

          <Label
            className="text-xs font-semibold uppercase tracking-wider mb-2 block"
            style={{ color: "oklch(0.55 0.02 265)" }}
          >
            Duration
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {DURATIONS.map((d) => {
              const isActive = duration.days === d.days;
              return (
                <button
                  key={d.days}
                  type="button"
                  onClick={() => setDuration(d)}
                  className="rounded-xl py-2.5 text-xs font-bold transition-all"
                  style={{
                    background: isActive
                      ? "oklch(0.78 0.18 82 / 0.15)"
                      : "oklch(0.15 0.025 265)",
                    border: `1px solid ${isActive ? "oklch(0.78 0.18 82 / 0.55)" : "oklch(0.24 0.04 265)"}`,
                    color: isActive
                      ? "oklch(0.88 0.16 84)"
                      : "oklch(0.65 0.01 80)",
                    boxShadow: isActive
                      ? "0 0 14px oklch(0.78 0.18 82 / 0.2)"
                      : "none",
                  }}
                  data-ocid={`calc.duration.${d.days}.button`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results */}
        <div className="section-label">
          <TrendingUp style={{ width: 11, height: 11 }} />
          Projected Returns \u2014 {duration.label}
        </div>

        <div className="space-y-2.5">
          {RATES.map((rate, idx) => {
            const earned = calcReturn(principal, rate.annual, duration.days);
            const total = principal + earned;
            return (
              <div
                key={rate.label}
                className="card-premium animate-fade-in-up px-4 py-3.5 flex items-center justify-between"
                style={{
                  animationDelay: `${idx * 0.055}s`,
                  opacity: 0,
                  animationFillMode: "forwards",
                  background: rate.bg,
                  borderColor: `${rate.color}33`,
                }}
                data-ocid={`calc.rate.${idx + 1}.card`}
              >
                <div>
                  <p
                    className="font-bold text-sm"
                    style={{ color: rate.color }}
                  >
                    {rate.label}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "oklch(0.48 0.02 265)" }}
                  >
                    {(rate.annual * 100).toFixed(0)}% annual
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-foreground">
                    {principal > 0 ? formatInr(total) : "\u2014"}
                  </p>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: rate.color }}
                  >
                    {principal > 0 ? `+${formatInr(earned)}` : "Enter amount"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div
          className="mt-5 rounded-xl p-3"
          style={{
            background: "oklch(0.14 0.025 265)",
            border: "1px solid oklch(0.22 0.035 265)",
          }}
        >
          <p
            className="text-xs leading-relaxed"
            style={{ color: "oklch(0.50 0.02 265)" }}
          >
            \u26A0\uFE0F <strong>Disclaimer:</strong> Projected returns are
            illustrative only. Actual returns may vary. Past performance does
            not guarantee future results.
          </p>
        </div>
      </main>
    </div>
  );
}
