import { ArrowLeft, Copy, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type ReferralData,
  formatInr,
  getCurrentUser,
  getReferralData,
  saveReferralData,
  saveUser,
} from "../types/fsc";

interface ReferralProps {
  onBack: () => void;
}

export default function Referral({ onBack }: ReferralProps) {
  const user = getCurrentUser();
  const referralCode = user ? `FSC${user.uniqueId}` : "FSC00000000";

  const defaultData: ReferralData = {
    referralCode,
    referredFriends: [],
    referralEarnings: 0,
  };

  const [data, setData] = useState<ReferralData>(() => {
    if (!user) return defaultData;
    return getReferralData(user.uniqueId) ?? defaultData;
  });
  const [codeCopied, setCodeCopied] = useState(false);

  function handleCopyCode() {
    navigator.clipboard.writeText(data.referralCode).then(() => {
      setCodeCopied(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCodeCopied(false), 2000);
    });
  }

  function handleTransfer() {
    if (!user || data.referralEarnings <= 0) return;
    const updated = { ...user, balance: user.balance + data.referralEarnings };
    saveUser(updated);
    const updatedData = { ...data, referralEarnings: 0 };
    saveReferralData(user.uniqueId, updatedData);
    setData(updatedData);
    toast.success(
      `${formatInr(data.referralEarnings)} transferred to your main balance!`,
    );
  }

  function maskPhone(phone: string): string {
    if (phone.length < 4) return phone;
    return phone[0] + "X".repeat(phone.length - 4) + phone.slice(-3);
  }

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
              Referral Program
            </p>
            <p
              className="font-sans text-muted-foreground"
              style={{ fontSize: "0.7rem" }}
            >
              Invite friends &amp; earn rewards
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-xl">
        {/* Referral code card */}
        <div
          style={{
            background: "oklch(0.13 0.03 265)",
            border: "1px solid oklch(0.78 0.18 82 / 0.3)",
            borderRadius: 20,
            padding: "28px 24px",
            textAlign: "center",
            marginBottom: 20,
            boxShadow: "0 0 30px oklch(0.78 0.18 82 / 0.08)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "oklch(0.78 0.18 82 / 0.15)",
              marginBottom: 16,
            }}
          >
            <Users
              style={{ width: 24, height: 24, color: "oklch(0.78 0.18 82)" }}
            />
          </div>
          <p className="font-sans text-muted-foreground text-xs uppercase tracking-widest mb-2">
            Your Referral Code
          </p>
          <p
            className="font-display font-bold"
            style={{
              fontSize: "2rem",
              background:
                "linear-gradient(135deg, oklch(0.90 0.18 82), oklch(0.72 0.20 75))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "0.15em",
              marginBottom: 16,
            }}
          >
            {data.referralCode}
          </p>
          <button
            type="button"
            onClick={handleCopyCode}
            className="btn-gold font-sans font-bold rounded-full px-6 py-2 text-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <Copy style={{ width: 14, height: 14 }} />
            {codeCopied ? "Copied!" : "Copy Code"}
          </button>
          <p
            className="font-sans text-muted-foreground text-xs mt-4"
            style={{ lineHeight: 1.6 }}
          >
            Share this code with friends. When they join FSC using your code,
            you both earn{" "}
            <strong style={{ color: "oklch(0.78 0.18 82)" }}>
              \u20b950 bonus
            </strong>
            .
          </p>
        </div>

        {/* Referral Earnings Wallet */}
        <div
          style={{
            background: "oklch(0.13 0.03 265)",
            border: "1px solid oklch(0.78 0.18 82 / 0.2)",
            borderRadius: 16,
            padding: "20px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p className="font-sans text-muted-foreground text-xs uppercase tracking-widest mb-1">
              Referral Earnings
            </p>
            <p
              className="font-display font-bold"
              style={{
                fontSize: "1.6rem",
                background:
                  "linear-gradient(135deg, oklch(0.90 0.18 82), oklch(0.72 0.20 75))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {formatInr(data.referralEarnings)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleTransfer}
            disabled={data.referralEarnings <= 0}
            className="btn-gold font-sans font-bold rounded-xl px-5 py-2 text-sm"
            style={{
              opacity: data.referralEarnings <= 0 ? 0.4 : 1,
              cursor: data.referralEarnings <= 0 ? "not-allowed" : "pointer",
            }}
          >
            Transfer to Balance
          </button>
        </div>

        {/* Friends list */}
        <div style={{ marginBottom: 8 }}>
          <p
            className="font-sans font-semibold text-foreground mb-3"
            style={{ fontSize: "0.9rem" }}
          >
            Referred Friends ({data.referredFriends.length})
          </p>
          {data.referredFriends.length === 0 ? (
            <div
              style={{
                background: "oklch(0.13 0.03 265)",
                border: "1px solid oklch(0.78 0.18 82 / 0.1)",
                borderRadius: 14,
                padding: "32px 20px",
                textAlign: "center",
              }}
            >
              <Users
                style={{
                  width: 36,
                  height: 36,
                  margin: "0 auto 12px",
                  opacity: 0.3,
                  color: "oklch(0.78 0.18 82)",
                }}
              />
              <p className="font-sans text-muted-foreground text-sm">
                No referrals yet. Share your code to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.referredFriends.map((friend) => (
                <div
                  key={`${friend.phone}-${friend.joinedDate}`}
                  style={{
                    background: "oklch(0.13 0.03 265)",
                    border: "1px solid oklch(0.78 0.18 82 / 0.12)",
                    borderRadius: 12,
                    padding: "14px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <p
                      className="font-sans font-medium"
                      style={{
                        fontSize: "0.9rem",
                        color: "oklch(0.88 0.01 80)",
                      }}
                    >
                      {friend.name}
                    </p>
                    <p
                      className="font-sans"
                      style={{
                        fontSize: "0.72rem",
                        color: "oklch(0.50 0.02 265)",
                      }}
                    >
                      {maskPhone(friend.phone)}
                    </p>
                  </div>
                  <p
                    className="font-sans"
                    style={{
                      fontSize: "0.72rem",
                      color: "oklch(0.55 0.02 265)",
                    }}
                  >
                    {friend.joinedDate}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border/50 py-7">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>\u00a9 {new Date().getFullYear()} FSC Foreign Smart Coins.</p>
        </div>
      </footer>
    </div>
  );
}
