import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock } from "lucide-react";
import {
  type PaymentSubmission,
  getCurrentUser,
  getPayments,
} from "../types/fsc";

interface VerifyingProps {
  onBack: () => void;
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "#f59e0b",
    bg: "oklch(0.70 0.18 82 / 0.15)",
  },
  approved: {
    label: "Approved",
    color: "#22c55e",
    bg: "oklch(0.65 0.20 145 / 0.15)",
  },
  rejected: {
    label: "Rejected",
    color: "#ef4444",
    bg: "oklch(0.65 0.22 22 / 0.15)",
  },
};

export default function Verifying({ onBack }: VerifyingProps) {
  const user = getCurrentUser();
  const allPayments = getPayments();
  const payments: PaymentSubmission[] = allPayments
    .filter((p) => p.userId === user?.uniqueId)
    .sort((a, b) => (b.id > a.id ? 1 : -1));

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
              Verifying
            </p>
            <p
              className="font-sans text-muted-foreground"
              style={{ fontSize: "0.7rem" }}
            >
              Payment History
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-xl">
        {payments.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "oklch(0.55 0.02 265)",
            }}
          >
            <Clock
              style={{
                width: 48,
                height: 48,
                margin: "0 auto 16px",
                opacity: 0.4,
              }}
            />
            <p
              className="font-display"
              style={{
                fontSize: "1.2rem",
                fontWeight: 600,
                marginBottom: 8,
                color: "oklch(0.70 0.02 265)",
              }}
            >
              No Submissions Yet
            </p>
            <p className="font-sans text-sm">
              Your payment verification history will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((p) => {
              const status = STATUS_CONFIG[p.status];
              return (
                <div
                  key={p.id}
                  style={{
                    background: "oklch(0.13 0.025 265)",
                    border: "1px solid oklch(0.78 0.18 82 / 0.15)",
                    borderRadius: 16,
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <p
                        className="font-display font-bold"
                        style={{
                          fontSize: "1.3rem",
                          background:
                            "linear-gradient(135deg, oklch(0.90 0.18 82), oklch(0.72 0.20 75))",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        ₹{p.amount}
                      </p>
                      <p className="font-sans text-xs text-muted-foreground">
                        {p.method} · {p.date}
                      </p>
                    </div>
                    <Badge
                      style={{
                        background: status.bg,
                        color: status.color,
                        border: `1px solid ${status.color}44`,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      {status.label}
                    </Badge>
                  </div>
                  <div
                    style={{
                      background: "oklch(0.09 0.02 265)",
                      borderRadius: 8,
                      padding: "8px 12px",
                    }}
                  >
                    <p
                      className="font-sans"
                      style={{
                        fontSize: "0.7rem",
                        color: "oklch(0.50 0.02 265)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: 2,
                      }}
                    >
                      UTR
                    </p>
                    <p
                      className="font-sans font-medium"
                      style={{
                        fontSize: "0.85rem",
                        color: "oklch(0.75 0.02 265)",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      {p.utr}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
