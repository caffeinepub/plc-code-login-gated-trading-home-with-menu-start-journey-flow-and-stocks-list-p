import { ArrowLeft, CheckCircle2, Copy, Tag, Users } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  type ReferralData,
  formatInr,
  getAppliedReferralCode,
  getCurrentUser,
  getReferralData,
  saveAppliedReferralCode,
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

  // Enter referral code state
  const [appliedCode] = useState<string | null>(() =>
    user ? getAppliedReferralCode(user.uniqueId) : null,
  );
  const [inputCode, setInputCode] = useState("");
  const [refError, setRefError] = useState("");
  const [refApplied, setRefApplied] = useState<string | null>(appliedCode);
  const inputRef = useRef<HTMLInputElement>(null);

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

  function handleApplyCode() {
    if (!user) return;
    const code = inputCode.trim().toUpperCase();
    setRefError("");

    // Validate format: FSC followed by exactly 8 digits
    if (!/^FSC\d{8}$/.test(code)) {
      setRefError("Invalid referral code format. Must be FSCXXXXXXXX");
      return;
    }
    // Can't use own code
    if (code === referralCode) {
      setRefError("You can't use your own referral code");
      return;
    }

    // Apply code and reward ₹50
    saveAppliedReferralCode(user.uniqueId, code);
    const freshUser = getCurrentUser();
    if (freshUser) {
      saveUser({ ...freshUser, balance: freshUser.balance + 50 });
    }
    setRefApplied(code);
    setInputCode("");
    toast.success("Referral code applied! ₹50 bonus added to your balance");
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
            data-ocid="referral.back.button"
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
            data-ocid="referral.copy.button"
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
            <strong style={{ color: "oklch(0.78 0.18 82)" }}>₹50 bonus</strong>.
          </p>
        </div>

        {/* Enter Referral Code Card */}
        <div
          data-ocid="referral.enter_code.card"
          style={{
            background: "oklch(0.13 0.03 265)",
            border: refApplied
              ? "1px solid oklch(0.65 0.20 145 / 0.45)"
              : "1px solid oklch(0.65 0.22 220 / 0.35)",
            borderRadius: 18,
            padding: "22px 20px",
            marginBottom: 20,
            boxShadow: refApplied
              ? "0 0 20px oklch(0.65 0.20 145 / 0.08)"
              : "0 0 20px oklch(0.65 0.22 220 / 0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: refApplied
                  ? "oklch(0.65 0.20 145 / 0.18)"
                  : "oklch(0.65 0.22 220 / 0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {refApplied ? (
                <CheckCircle2
                  style={{
                    width: 18,
                    height: 18,
                    color: "oklch(0.75 0.18 145)",
                  }}
                />
              ) : (
                <Tag
                  style={{
                    width: 18,
                    height: 18,
                    color: "oklch(0.70 0.20 220)",
                  }}
                />
              )}
            </div>
            <div>
              <p
                className="font-display font-bold"
                style={{
                  fontSize: "0.95rem",
                  color: refApplied
                    ? "oklch(0.75 0.18 145)"
                    : "oklch(0.88 0.01 80)",
                }}
              >
                Enter a Referral Code
              </p>
              <p
                className="font-sans"
                style={{ fontSize: "0.7rem", color: "oklch(0.50 0.02 265)" }}
              >
                {refApplied
                  ? "Bonus already applied to your account"
                  : "Get ₹50 bonus when you use a friend's code"}
              </p>
            </div>
          </div>

          {refApplied ? (
            <div
              style={{
                background: "oklch(0.65 0.20 145 / 0.10)",
                border: "1px solid oklch(0.65 0.20 145 / 0.30)",
                borderRadius: 10,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
              data-ocid="referral.applied.success_state"
            >
              <CheckCircle2
                style={{
                  width: 16,
                  height: 16,
                  color: "oklch(0.75 0.18 145)",
                  flexShrink: 0,
                }}
              />
              <div>
                <p
                  className="font-sans font-bold"
                  style={{ fontSize: "0.82rem", color: "oklch(0.75 0.18 145)" }}
                >
                  Applied!
                </p>
                <p
                  className="font-sans"
                  style={{
                    fontSize: "0.72rem",
                    color: "oklch(0.55 0.02 265)",
                    letterSpacing: "0.08em",
                  }}
                >
                  {refApplied}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputCode}
                  onChange={(e) => {
                    setInputCode(e.target.value.toUpperCase());
                    if (refError) setRefError("");
                  }}
                  placeholder="e.g. FSC12345678"
                  maxLength={11}
                  data-ocid="referral.code.input"
                  style={{
                    flex: 1,
                    background: "oklch(0.09 0.02 265)",
                    border: refError
                      ? "1px solid oklch(0.65 0.22 22 / 0.6)"
                      : "1px solid oklch(0.65 0.22 220 / 0.25)",
                    borderRadius: 10,
                    padding: "11px 14px",
                    color: "oklch(0.90 0.01 80)",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontSize: "0.9rem",
                    outline: "none",
                    letterSpacing: "0.08em",
                    fontWeight: 700,
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyCode}
                  disabled={!inputCode.trim()}
                  data-ocid="referral.apply_code.button"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.87 0.17 87), oklch(0.73 0.21 73))",
                    color: "oklch(0.12 0.03 265)",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    padding: "11px 18px",
                    borderRadius: 10,
                    border: "none",
                    cursor: inputCode.trim() ? "pointer" : "not-allowed",
                    opacity: inputCode.trim() ? 1 : 0.5,
                    whiteSpace: "nowrap",
                  }}
                >
                  Apply Code
                </button>
              </div>
              {refError && (
                <p
                  style={{
                    marginTop: 8,
                    fontSize: "0.75rem",
                    color: "oklch(0.72 0.2 22)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  data-ocid="referral.code.error_state"
                >
                  {refError}
                </p>
              )}
            </div>
          )}
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
            data-ocid="referral.transfer.button"
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
              data-ocid="referral.friends.empty_state"
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
            <div className="space-y-3" data-ocid="referral.friends.list">
              {data.referredFriends.map((friend, i) => (
                <div
                  key={`${friend.phone}-${friend.joinedDate}`}
                  data-ocid={`referral.friends.item.${i + 1}`}
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
