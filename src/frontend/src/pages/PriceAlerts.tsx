import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Bell,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useMarketTicker } from "../hooks/useMarketTicker";
import {
  type PriceAlert,
  getCurrentUser,
  getPriceAlerts,
  savePriceAlerts,
} from "../types/fsc";

interface PriceAlertsProps {
  onBack: () => void;
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

export default function PriceAlerts({ onBack }: PriceAlertsProps) {
  const user = getCurrentUser();
  const ticker = useMarketTicker();
  const [alerts, setAlerts] = useState<PriceAlert[]>(() =>
    user ? getPriceAlerts(user.uniqueId) : [],
  );
  const [selectedPlan, setSelectedPlan] = useState("");
  const [targetPrice, setTargetPrice] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !selectedPlan || !targetPrice) return;
    const plan = STOCK_PLANS.find((p) => p.amount.toString() === selectedPlan);
    if (!plan) return;
    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      planName: plan.name,
      targetPrice: Number(targetPrice),
      currentPrice: plan.amount * (1 + (ticker[plan.amount] ?? 0) / 100),
      status: "active",
      createdDate: new Date().toLocaleDateString("en-IN"),
    };
    const updated = [newAlert, ...alerts];
    setAlerts(updated);
    savePriceAlerts(user.uniqueId, updated);
    setSelectedPlan("");
    setTargetPrice("");
    toast.success(`Alert set for ${plan.name} at ₹${targetPrice}`);
  }

  function handleDelete(id: string) {
    if (!user) return;
    const updated = alerts.filter((a) => a.id !== id);
    setAlerts(updated);
    savePriceAlerts(user.uniqueId, updated);
    toast.success("Alert removed");
  }

  // Check triggered alerts
  const enrichedAlerts = alerts.map((alert) => {
    const plan = STOCK_PLANS.find((p) => p.name === alert.planName);
    const current = plan
      ? plan.amount * (1 + (ticker[plan.amount] ?? 0) / 100)
      : (alert.currentPrice ?? 0);
    const triggered = current >= alert.targetPrice;
    return {
      ...alert,
      currentPrice: current,
      status: triggered ? ("triggered" as const) : ("active" as const),
    };
  });

  return (
    <div className="page-wrapper bg-grid-pattern">
      <header className="glass-header sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="btn-glass rounded-xl p-2"
            data-ocid="alerts.back.button"
          >
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <Bell
            style={{ width: 20, height: 20, color: "oklch(0.78 0.18 82)" }}
          />
          <h1 className="font-display font-bold text-foreground text-lg">
            Price Alerts
          </h1>
        </div>
      </header>

      <main className="px-4 pt-5 pb-8">
        {/* Add Alert Form */}
        <div className="glass-card p-4 mb-5 animate-scale-in">
          <h2 className="font-display font-bold text-foreground mb-4">
            Set New Alert
          </h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">
                Select Plan
              </Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger
                  className="rounded-xl"
                  style={{
                    background: "oklch(0.15 0.025 265)",
                    border: "1px solid oklch(0.25 0.04 265)",
                  }}
                  data-ocid="alerts.plan.select"
                >
                  <SelectValue placeholder="Choose a plan..." />
                </SelectTrigger>
                <SelectContent style={{ background: "oklch(0.16 0.03 265)" }}>
                  {STOCK_PLANS.map((p) => (
                    <SelectItem key={p.amount} value={p.amount.toString()}>
                      {p.name} (₹{p.amount.toLocaleString("en-IN")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1.5 block">
                Target Price (₹)
              </Label>
              <Input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="Enter target price"
                className="rounded-xl"
                style={{
                  background: "oklch(0.15 0.025 265)",
                  border: "1px solid oklch(0.25 0.04 265)",
                }}
                data-ocid="alerts.price.input"
                required
              />
            </div>
            <button
              type="submit"
              className="btn-gold w-full rounded-xl py-3 font-bold"
              disabled={!selectedPlan || !targetPrice}
              data-ocid="alerts.add.button"
            >
              Set Alert
            </button>
          </form>
        </div>

        {/* Alert List */}
        <div className="animate-fade-in-up">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">
            Active Alerts ({enrichedAlerts.length})
          </p>
          {enrichedAlerts.length === 0 ? (
            <div
              className="text-center py-10"
              style={{
                background: "oklch(0.13 0.025 265)",
                border: "1px dashed oklch(0.25 0.04 265)",
                borderRadius: 16,
              }}
              data-ocid="alerts.empty_state"
            >
              <Bell
                style={{
                  width: 36,
                  height: 36,
                  color: "oklch(0.35 0.02 265)",
                  margin: "0 auto 8px",
                }}
              />
              <p className="text-muted-foreground text-sm">No alerts set yet</p>
            </div>
          ) : (
            <div className="space-y-3" data-ocid="alerts.list">
              {enrichedAlerts.map((alert, idx) => {
                const pct =
                  ((alert.currentPrice ?? 0) / alert.targetPrice) * 100;
                const isTriggered = alert.status === "triggered";
                return (
                  <div
                    key={alert.id}
                    className="rounded-xl p-4 flex items-center gap-3 transition-all"
                    style={{
                      background: isTriggered
                        ? "oklch(0.65 0.2 145 / 0.08)"
                        : "oklch(0.13 0.025 265)",
                      border: `1px solid ${isTriggered ? "oklch(0.65 0.2 145 / 0.4)" : "oklch(0.22 0.035 265)"}`,
                    }}
                    data-ocid={`alerts.item.${idx + 1}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm text-foreground">
                          {alert.planName}
                        </p>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                          style={{
                            background: isTriggered
                              ? "oklch(0.65 0.2 145 / 0.15)"
                              : "oklch(0.78 0.18 82 / 0.1)",
                            color: isTriggered
                              ? "oklch(0.65 0.2 145)"
                              : "oklch(0.78 0.18 82)",
                          }}
                        >
                          {isTriggered ? "\u2713 Hit" : "Watching"}
                        </span>
                      </div>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span>
                          Target: ₹{alert.targetPrice.toLocaleString("en-IN")}
                        </span>
                        <span
                          className="flex items-center gap-0.5"
                          style={{
                            color:
                              pct >= 100
                                ? "oklch(0.65 0.2 145)"
                                : "oklch(0.75 0.01 80)",
                          }}
                        >
                          {pct >= 100 ? (
                            <TrendingUp style={{ width: 12, height: 12 }} />
                          ) : (
                            <TrendingDown style={{ width: 12, height: 12 }} />
                          )}
                          Current: ₹{(alert.currentPrice ?? 0).toFixed(0)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(alert.id)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: "oklch(0.65 0.22 22)" }}
                      data-ocid={`alerts.delete_button.${idx + 1}`}
                    >
                      <Trash2 style={{ width: 16, height: 16 }} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
