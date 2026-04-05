import { ArrowDownLeft, ArrowLeft, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import {
  formatInr,
  getCurrentUser,
  getPayments,
  getWithdrawals,
} from "../types/fsc";

interface TransactionHistoryProps {
  onBack: () => void;
}

type Filter = "all" | "deposits" | "withdrawals";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const STATUS_COLORS: Record<
  string,
  { color: string; bg: string; border: string }
> = {
  pending: {
    color: "#f59e0b",
    bg: "oklch(0.70 0.18 82 / 0.1)",
    border: "oklch(0.70 0.18 82 / 0.3)",
  },
  approved: {
    color: "#22c55e",
    bg: "oklch(0.65 0.20 145 / 0.1)",
    border: "oklch(0.65 0.20 145 / 0.3)",
  },
  verified: {
    color: "#22c55e",
    bg: "oklch(0.65 0.20 145 / 0.1)",
    border: "oklch(0.65 0.20 145 / 0.3)",
  },
  rejected: {
    color: "#ef4444",
    bg: "oklch(0.65 0.22 22 / 0.1)",
    border: "oklch(0.65 0.22 22 / 0.3)",
  },
};

export default function TransactionHistory({
  onBack,
}: TransactionHistoryProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const user = getCurrentUser();

  const payments = getPayments()
    .filter((p) => p.userId === user?.uniqueId)
    .map((p) => ({ ...p, type: "deposit" as const }));

  const withdrawals = getWithdrawals()
    .filter((w) => w.userId === user?.uniqueId)
    .map((w) => ({ ...w, type: "withdrawal" as const, method: w.upiId }));

  const all = [...payments, ...withdrawals].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const filtered =
    filter === "all"
      ? all
      : filter === "deposits"
        ? all.filter((t) => t.type === "deposit")
        : all.filter((t) => t.type === "withdrawal");

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "deposits", label: "Deposits" },
    { key: "withdrawals", label: "Withdrawals" },
  ];

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      <header className="glass-header sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            style={{
              background: "transparent",
              border: "1px solid oklch(0.78 0.18 82 / 0.3)",
              borderRadius: 10,
              padding: "8px",
              cursor: "pointer",
              color: "oklch(0.78 0.18 82)",
            }}
          >
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <div>
            <p
              className="font-display font-bold text-primary"
              style={{ fontSize: "1.1rem" }}
            >
              Transaction History
            </p>
            <p
              className="font-sans text-muted-foreground"
              style={{ fontSize: "0.7rem" }}
            >
              {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-xl">
        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                border: `1px solid ${filter === f.key ? "oklch(0.78 0.18 82 / 0.6)" : "oklch(0.78 0.18 82 / 0.15)"}`,
                background:
                  filter === f.key
                    ? "oklch(0.78 0.18 82 / 0.12)"
                    : "transparent",
                color:
                  filter === f.key
                    ? "oklch(0.78 0.18 82)"
                    : "oklch(0.55 0.02 265)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div
            style={{
              background: "oklch(0.13 0.03 265)",
              border: "1px solid oklch(0.78 0.18 82 / 0.1)",
              borderRadius: 16,
              padding: "48px 20px",
              textAlign: "center",
            }}
          >
            <ArrowUpRight
              style={{
                width: 44,
                height: 44,
                margin: "0 auto 16px",
                opacity: 0.25,
                color: "oklch(0.78 0.18 82)",
              }}
            />
            <p
              className="font-display font-semibold"
              style={{
                fontSize: "1.1rem",
                color: "oklch(0.70 0.02 265)",
                marginBottom: 8,
              }}
            >
              No Transactions
            </p>
            <p className="font-sans text-muted-foreground text-sm">
              Your transaction history will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((tx, i) => {
              const isDeposit = tx.type === "deposit";
              const statusKey = (tx.status as string).toLowerCase();
              const statusStyle =
                STATUS_COLORS[statusKey] ?? STATUS_COLORS.pending;
              return (
                <div
                  key={`${tx.id}-${i}`}
                  style={{
                    background: "oklch(0.13 0.03 265)",
                    border: "1px solid oklch(0.78 0.18 82 / 0.12)",
                    borderRadius: 14,
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: isDeposit
                        ? "oklch(0.65 0.20 145 / 0.12)"
                        : "oklch(0.65 0.22 22 / 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {isDeposit ? (
                      <ArrowDownLeft
                        style={{ width: 18, height: 18, color: "#22c55e" }}
                      />
                    ) : (
                      <ArrowUpRight
                        style={{ width: 18, height: 18, color: "#ef4444" }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      className="font-sans font-semibold"
                      style={{
                        fontSize: "0.85rem",
                        color: "oklch(0.88 0.01 80)",
                        marginBottom: 2,
                      }}
                    >
                      {isDeposit ? "Deposit" : "Withdrawal"}
                    </p>
                    <p
                      className="font-sans"
                      style={{
                        fontSize: "0.7rem",
                        color: "oklch(0.50 0.02 265)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(tx.date)}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p
                      className="font-display font-bold"
                      style={{
                        fontSize: "0.95rem",
                        color: isDeposit ? "#22c55e" : "#ef4444",
                        marginBottom: 4,
                      }}
                    >
                      {isDeposit ? "+" : "-"}
                      {formatInr(tx.amount)}
                    </p>
                    <span
                      style={{
                        fontSize: "0.62rem",
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        border: `1px solid ${statusStyle.border}`,
                        borderRadius: 4,
                        padding: "2px 6px",
                        fontWeight: 700,
                        textTransform: "capitalize",
                      }}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-border/50 py-7">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>\u00a9 {new Date().getFullYear()} FSC Foreign Smart Coins.</p>
        </div>
      </footer>
    </div>
  );
}
