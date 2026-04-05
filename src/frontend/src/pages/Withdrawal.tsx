import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Lock, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type FscUser,
  type WithdrawalRequest,
  getCurrentUser,
  getWithdrawals,
  saveUser,
  saveWithdrawals,
} from "../types/fsc";

const MIN_WITHDRAWAL = 800;

interface WithdrawalProps {
  onBack: () => void;
}

type WStep = "setup" | "amount" | "pin" | "done";

export default function Withdrawal({ onBack }: WithdrawalProps) {
  const [user, setUser] = useState<FscUser | null>(() => getCurrentUser());
  const [wStep, setWStep] = useState<WStep>(() => {
    const u = getCurrentUser();
    return u?.upiId && u?.upiName ? "amount" : "setup";
  });
  const [upiId, setUpiId] = useState("");
  const [upiName, setUpiName] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [submittedAmount, setSubmittedAmount] = useState(0);

  const hasUpi = !!(user?.upiId && user?.upiName);

  // auto-hide banner after 3s
  useEffect(() => {
    if (showBanner) {
      const t = setTimeout(() => {
        setShowBanner(false);
        onBack();
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [showBanner, onBack]);

  function handleSaveUpi() {
    if (!upiId.trim() || !upiName.trim()) {
      toast.error("Please fill in both UPI ID and name");
      return;
    }
    if (!user) return;
    const updated: FscUser = {
      ...user,
      upiId: upiId.trim(),
      upiName: upiName.trim(),
    };
    saveUser(updated);
    setUser(updated);
    toast.success("UPI details saved permanently!");
    setWStep("amount");
  }

  function handleAmountNext() {
    const amt = Number.parseFloat(amount);
    if (!amount || Number.isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amt < MIN_WITHDRAWAL) {
      toast.error(`Minimum withdrawal is ₹${MIN_WITHDRAWAL}`);
      return;
    }
    if (user && amt > user.balance) {
      toast.error("Insufficient balance");
      return;
    }
    setWStep("pin");
  }

  function handleGetVdf() {
    if (!pin.trim()) {
      setPinError("Please enter your PIN (Unique ID)");
      return;
    }
    if (pin.trim() !== user?.uniqueId) {
      setPinError("Incorrect PIN. Your PIN is your 8-digit Unique ID.");
      return;
    }
    setPinError("");
    setSaving(true);
    const amt = Number.parseFloat(amount);
    const withdrawals = getWithdrawals();
    const req: WithdrawalRequest = {
      id: Date.now().toString(),
      userId: user?.uniqueId ?? "unknown",
      amount: amt,
      upiId: user?.upiId ?? "",
      upiName: user?.upiName ?? "",
      status: "pending",
      date: new Date().toLocaleString("en-IN"),
    };
    withdrawals.push(req);
    saveWithdrawals(withdrawals);
    setSubmittedAmount(amt);
    setTimeout(() => {
      setSaving(false);
      setWStep("done");
      setShowBanner(true);
    }, 800);
  }

  return (
    <div
      className="min-h-screen bg-background bg-grid-pattern"
      style={{ position: "relative" }}
    >
      {/* 3-second success banner */}
      {showBanner && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg, oklch(0.12 0.03 265), oklch(0.16 0.04 265))",
              border: "2px solid oklch(0.65 0.20 145 / 0.6)",
              borderRadius: 24,
              padding: "36px 32px",
              maxWidth: 400,
              width: "100%",
              textAlign: "center",
              boxShadow:
                "0 0 60px oklch(0.65 0.20 145 / 0.25), 0 0 120px oklch(0.65 0.20 145 / 0.1)",
              animation: "fadeInScale 0.4s ease",
            }}
          >
            {/* Green checkmark pulse */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "oklch(0.55 0.20 145 / 0.15)",
                border: "2px solid oklch(0.65 0.20 145 / 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <title>Success</title>
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <p
              className="font-sans"
              style={{
                fontSize: "0.65rem",
                color: "oklch(0.65 0.20 145)",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: 6,
              }}
            >
              Withdrawal Submitted
            </p>
            <h2
              className="font-display font-bold"
              style={{
                fontSize: "1.3rem",
                color: "oklch(0.95 0.01 80)",
                marginBottom: 16,
                lineHeight: 1.3,
              }}
            >
              Your withdrawal order has been successfully sent to Financial Team
            </h2>

            <div
              style={{
                background: "oklch(0.10 0.02 265)",
                border: "1px solid oklch(0.78 0.18 82 / 0.2)",
                borderRadius: 12,
                padding: "12px 16px",
                marginBottom: 16,
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span
                  className="font-sans"
                  style={{ fontSize: "0.75rem", color: "oklch(0.55 0.02 265)" }}
                >
                  Amount
                </span>
                <span
                  className="font-display font-bold"
                  style={{ fontSize: "0.95rem", color: "oklch(0.90 0.18 82)" }}
                >
                  ₹{submittedAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span
                  className="font-sans"
                  style={{ fontSize: "0.75rem", color: "oklch(0.55 0.02 265)" }}
                >
                  Name
                </span>
                <span
                  className="font-sans font-semibold"
                  style={{ fontSize: "0.85rem", color: "oklch(0.85 0.01 80)" }}
                >
                  {user?.name}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span
                  className="font-sans"
                  style={{ fontSize: "0.75rem", color: "oklch(0.55 0.02 265)" }}
                >
                  Phone
                </span>
                <span
                  className="font-sans font-semibold"
                  style={{ fontSize: "0.85rem", color: "oklch(0.85 0.01 80)" }}
                >
                  {user?.phone}
                </span>
              </div>
            </div>

            <p
              className="font-sans"
              style={{
                fontSize: "0.78rem",
                color: "oklch(0.55 0.02 265)",
                lineHeight: 1.5,
              }}
            >
              It will take maximum{" "}
              <span style={{ color: "oklch(0.78 0.18 82)", fontWeight: 600 }}>
                48 Hours
              </span>{" "}
              to successfully credited to your UPI or Crypto Address.
            </p>
          </div>
        </div>
      )}

      <header className="glass-header sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (wStep === "pin") setWStep("amount");
              else onBack();
            }}
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
              Withdrawal
            </p>
            <p
              className="font-sans text-muted-foreground"
              style={{ fontSize: "0.7rem" }}
            >
              Min. ₹{MIN_WITHDRAWAL} required
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-md">
        {/* STEP: Setup UPI */}
        {wStep === "setup" && (
          <div>
            <h2
              className="font-display font-bold text-foreground mb-2"
              style={{ fontSize: "1.4rem" }}
            >
              Setup UPI Details
            </h2>
            <p className="font-sans text-muted-foreground text-sm mb-6">
              Your UPI details will be saved permanently. Only admin can modify
              them later.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="upi-id-input"
                className="font-sans text-sm font-semibold text-foreground"
                style={{ display: "block", marginBottom: 8 }}
              >
                UPI ID
              </label>
              <Input
                id="upi-id-input"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label
                htmlFor="upi-name-input"
                className="font-sans text-sm font-semibold text-foreground"
                style={{ display: "block", marginBottom: 8 }}
              >
                Account Holder Name
              </label>
              <Input
                id="upi-name-input"
                value={upiName}
                onChange={(e) => setUpiName(e.target.value)}
                placeholder="Full name as in bank"
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <Button
              onClick={handleSaveUpi}
              className="btn-gold w-full font-sans font-bold uppercase tracking-widest rounded-full py-3"
            >
              Save UPI Details
            </Button>
          </div>
        )}

        {/* STEP: Enter amount */}
        {wStep === "amount" && (
          <div>
            {/* UPI info (locked) */}
            {hasUpi && (
              <div
                style={{
                  background: "oklch(0.13 0.025 265)",
                  border: "1px solid oklch(0.78 0.18 82 / 0.2)",
                  borderRadius: 14,
                  padding: "16px 20px",
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <Lock
                    style={{
                      width: 16,
                      height: 16,
                      color: "oklch(0.78 0.18 82)",
                    }}
                  />
                  <p
                    className="font-sans"
                    style={{
                      fontSize: "0.7rem",
                      color: "oklch(0.55 0.02 265)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Saved UPI Details
                  </p>
                </div>
                <p
                  className="font-sans font-semibold"
                  style={{ color: "oklch(0.90 0.01 80)", marginBottom: 4 }}
                >
                  {user?.upiName}
                </p>
                <p
                  className="font-sans"
                  style={{ fontSize: "0.85rem", color: "oklch(0.65 0.02 265)" }}
                >
                  {user?.upiId}
                </p>
              </div>
            )}

            {/* Balance */}
            <div
              style={{
                background: "oklch(0.13 0.025 265)",
                border: "1px solid oklch(0.78 0.18 82 / 0.2)",
                borderRadius: 14,
                padding: "16px 20px",
                marginBottom: 20,
              }}
            >
              <p className="font-sans text-xs text-muted-foreground uppercase tracking-widest mb-1">
                Available Balance
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
                ₹{user?.balance?.toLocaleString("en-IN") ?? "0"}
              </p>
            </div>

            <div style={{ marginBottom: 8 }}>
              <label
                htmlFor="withdraw-amount-input"
                className="font-sans text-sm font-semibold text-foreground"
                style={{ display: "block", marginBottom: 8 }}
              >
                Amount to Withdraw (₹)
              </label>
              <Input
                id="withdraw-amount-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                placeholder={`Minimum ₹${MIN_WITHDRAWAL}`}
                type="text"
                inputMode="numeric"
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              />
              <p
                className="font-sans"
                style={{
                  fontSize: "0.72rem",
                  color: "oklch(0.55 0.18 55)",
                  marginTop: 6,
                }}
              >
                Minimum withdrawal: ₹{MIN_WITHDRAWAL}
              </p>
            </div>

            <div style={{ marginBottom: 28 }} />

            <Button
              onClick={handleAmountNext}
              className="btn-gold w-full font-sans font-bold uppercase tracking-widest rounded-full py-3"
            >
              Next
            </Button>
          </div>
        )}

        {/* STEP: Enter PIN */}
        {wStep === "pin" && (
          <div>
            <div
              style={{
                textAlign: "center",
                marginBottom: 32,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "oklch(0.78 0.18 82 / 0.1)",
                  border: "1px solid oklch(0.78 0.18 82 / 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Shield
                  style={{
                    width: 28,
                    height: 28,
                    color: "oklch(0.78 0.18 82)",
                  }}
                />
              </div>
              <h2
                className="font-display font-bold text-foreground"
                style={{ fontSize: "1.4rem", marginBottom: 6 }}
              >
                Enter PIN
              </h2>
              <p className="font-sans text-muted-foreground text-sm">
                Your PIN is your 8-digit Unique ID shown in the menu
              </p>
            </div>

            <div
              style={{
                background: "oklch(0.13 0.025 265)",
                border: "1px solid oklch(0.78 0.18 82 / 0.2)",
                borderRadius: 14,
                padding: "14px 16px",
                marginBottom: 24,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span className="font-sans text-sm text-muted-foreground">
                Withdrawal Amount
              </span>
              <span
                className="font-display font-bold text-primary"
                style={{ fontSize: "1.1rem" }}
              >
                ₹{Number(amount).toLocaleString("en-IN")}
              </span>
            </div>

            <div style={{ marginBottom: 8 }}>
              <label
                htmlFor="pin-input"
                className="font-sans text-sm font-semibold text-foreground"
                style={{ display: "block", marginBottom: 8 }}
              >
                Account PIN (Unique ID)
              </label>
              <Input
                id="pin-input"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, "").slice(0, 8));
                  setPinError("");
                }}
                placeholder="Enter your 8-digit Unique ID"
                type="password"
                inputMode="numeric"
                maxLength={8}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground text-center text-xl tracking-widest"
              />
              {pinError && (
                <p
                  className="font-sans"
                  style={{
                    fontSize: "0.75rem",
                    color: "#ef4444",
                    marginTop: 6,
                  }}
                >
                  {pinError}
                </p>
              )}
            </div>

            <div style={{ marginBottom: 28 }} />

            <Button
              onClick={handleGetVdf}
              disabled={saving}
              className="btn-gold w-full font-sans font-bold uppercase tracking-widest rounded-full py-3"
              style={{ fontSize: "1rem" }}
            >
              {saving ? "Processing..." : "GET VDF"}
            </Button>
          </div>
        )}

        {/* STEP: done (banner is shown as overlay, this is just a placeholder) */}
        {wStep === "done" && !showBanner && (
          <div
            className="flex items-center justify-center"
            style={{ minHeight: 300 }}
          >
            <div style={{ textAlign: "center" }}>
              <p className="font-sans text-muted-foreground text-sm">
                Redirecting...
              </p>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
