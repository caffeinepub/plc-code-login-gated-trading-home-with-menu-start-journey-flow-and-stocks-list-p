import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, TrendingDown } from "lucide-react";
import {
  type WithdrawalRequest,
  getCurrentUser,
  getWithdrawals,
} from "../types/fsc";

interface WithdrawalHistoryProps {
  onBack: () => void;
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "#f59e0b",
    bg: "oklch(0.70 0.18 82 / 0.12)",
    border: "oklch(0.70 0.18 82 / 0.3)",
  },
  approved: {
    label: "Processed",
    color: "#22c55e",
    bg: "oklch(0.65 0.20 145 / 0.12)",
    border: "oklch(0.65 0.20 145 / 0.3)",
  },
  rejected: {
    label: "Rejected",
    color: "#ef4444",
    bg: "oklch(0.65 0.22 22 / 0.12)",
    border: "oklch(0.65 0.22 22 / 0.3)",
  },
};

function formatDate(isoOrLocale: string): string {
  try {
    const d = new Date(isoOrLocale);
    if (Number.isNaN(d.getTime())) return isoOrLocale;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoOrLocale;
  }
}

export default function WithdrawalHistory({ onBack }: WithdrawalHistoryProps) {
  const user = getCurrentUser();
  const allWithdrawals = getWithdrawals();
  const withdrawals: WithdrawalRequest[] = allWithdrawals
    .filter((w) => w.userId === user?.uniqueId)
    .sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      <header className="glass-header sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            data-ocid="withdrawal_history.close_button"
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
              Withdrawal History
            </p>
            <p
              className="font-sans text-muted-foreground"
              style={{ fontSize: "0.7rem" }}
            >
              {withdrawals.length} request{withdrawals.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-xl">
        {withdrawals.length === 0 ? (
          <div
            data-ocid="withdrawal_history.empty_state"
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "oklch(0.55 0.02 265)",
            }}
          >
            <TrendingDown
              style={{
                width: 52,
                height: 52,
                margin: "0 auto 20px",
                opacity: 0.35,
                color: "oklch(0.78 0.18 82)",
              }}
            />
            <p
              className="font-display"
              style={{
                fontSize: "1.3rem",
                fontWeight: 600,
                marginBottom: 10,
                color: "oklch(0.70 0.02 265)",
              }}
            >
              No Withdrawal Requests Yet
            </p>
            <p className="font-sans text-sm" style={{ lineHeight: 1.6 }}>
              Your withdrawal history will appear here once you submit a
              withdrawal request.
            </p>
            <button
              type="button"
              data-ocid="withdrawal_history.primary_button"
              className="btn-gold font-sans font-bold uppercase tracking-widest rounded-full px-8 py-3 text-sm"
              onClick={onBack}
              style={{ marginTop: 28 }}
            >
              Make a Withdrawal
            </button>
          </div>
        ) : (
          <div data-ocid="withdrawal_history.list" className="space-y-4">
            {withdrawals.map((w, i) => {
              const status =
                STATUS_CONFIG[w.status as keyof typeof STATUS_CONFIG] ??
                STATUS_CONFIG.pending;
              return (
                <div
                  key={w.id}
                  data-ocid={`withdrawal_history.item.${i + 1}`}
                  style={{
                    background: "oklch(0.13 0.025 265)",
                    border: "1px solid oklch(0.78 0.18 82 / 0.15)",
                    borderRadius: 18,
                    padding: "22px 20px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Gold accent line on left */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 3,
                      background:
                        "linear-gradient(180deg, oklch(0.90 0.18 82), oklch(0.65 0.20 75))",
                      borderRadius: "18px 0 0 18px",
                    }}
                  />

                  {/* Header row */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 14,
                      paddingLeft: 8,
                    }}
                  >
                    <div>
                      <p
                        className="font-display font-bold"
                        style={{
                          fontSize: "1.6rem",
                          background:
                            "linear-gradient(135deg, oklch(0.90 0.18 82), oklch(0.72 0.20 75))",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                          lineHeight: 1.1,
                          marginBottom: 2,
                        }}
                      >
                        ₹{w.amount.toLocaleString("en-IN")}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Clock
                          style={{
                            width: 12,
                            height: 12,
                            color: "oklch(0.50 0.02 265)",
                          }}
                        />
                        <p
                          className="font-sans"
                          style={{
                            fontSize: "0.72rem",
                            color: "oklch(0.50 0.02 265)",
                          }}
                        >
                          {formatDate(w.date)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      style={{
                        background: status.bg,
                        color: status.color,
                        border: `1px solid ${status.border}`,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 8,
                      }}
                    >
                      {status.label}
                    </Badge>
                  </div>

                  {/* Detail rows */}
                  <div
                    style={{
                      background: "oklch(0.09 0.02 265)",
                      borderRadius: 10,
                      padding: "12px 14px",
                      paddingLeft: 22,
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px 16px",
                    }}
                  >
                    <div>
                      <p
                        className="font-sans"
                        style={{
                          fontSize: "0.62rem",
                          color: "oklch(0.45 0.02 265)",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          marginBottom: 2,
                        }}
                      >
                        Name
                      </p>
                      <p
                        className="font-sans font-medium"
                        style={{
                          fontSize: "0.82rem",
                          color: "oklch(0.82 0.01 80)",
                        }}
                      >
                        {w.upiName}
                      </p>
                    </div>
                    <div>
                      <p
                        className="font-sans"
                        style={{
                          fontSize: "0.62rem",
                          color: "oklch(0.45 0.02 265)",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          marginBottom: 2,
                        }}
                      >
                        Phone
                      </p>
                      <p
                        className="font-sans font-medium"
                        style={{
                          fontSize: "0.82rem",
                          color: "oklch(0.82 0.01 80)",
                        }}
                      >
                        {user?.phone ?? "—"}
                      </p>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <p
                        className="font-sans"
                        style={{
                          fontSize: "0.62rem",
                          color: "oklch(0.45 0.02 265)",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          marginBottom: 2,
                        }}
                      >
                        UPI Address
                      </p>
                      <p
                        className="font-sans font-medium"
                        style={{
                          fontSize: "0.82rem",
                          color: "oklch(0.72 0.06 265)",
                          fontFamily: "JetBrains Mono, monospace",
                          wordBreak: "break-all",
                        }}
                      >
                        {w.upiId}
                      </p>
                    </div>
                  </div>

                  {/* Processing time note */}
                  {(w.status === "pending" ||
                    w.status === ("Pending" as typeof w.status)) && (
                    <p
                      className="font-sans"
                      style={{
                        fontSize: "0.68rem",
                        color: "oklch(0.55 0.18 55 / 0.9)",
                        marginTop: 10,
                        paddingLeft: 8,
                      }}
                    >
                      ⏳ Processing within 48 hours
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-7">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} FSC Foreign Smart Coins.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "fsc")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
