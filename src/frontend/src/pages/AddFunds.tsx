import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMarketTicker } from "../hooks/useMarketTicker";
import { backendSubmitPayment } from "../lib/backendStore";
import {
  type PaymentSubmission,
  getCurrentUser,
  getPayments,
  savePayments,
} from "../types/fsc";

const STOCK_PLANS = [
  { amount: 50, name: "Starter Pack", desc: "Perfect for beginners" },
  { amount: 150, name: "Basic Plan", desc: "Low-risk entry" },
  { amount: 250, name: "Bronze Plan", desc: "Small steady growth" },
  { amount: 350, name: "Silver Lite", desc: "Consistent returns" },
  { amount: 550, name: "Silver Plan", desc: "Popular choice" },
  { amount: 780, name: "Silver Plus", desc: "Enhanced returns" },
  { amount: 1120, name: "Gold Lite", desc: "Premium entry level" },
  { amount: 2238, name: "Gold Plan", desc: "High growth potential" },
  { amount: 3000, name: "Gold Plus", desc: "Accelerated growth" },
  { amount: 3700, name: "Platinum Lite", desc: "Elite tier begins" },
  { amount: 4200, name: "Platinum Plan", desc: "Top performer" },
  { amount: 5200, name: "Platinum Plus", desc: "Maximum returns" },
  { amount: 6600, name: "Diamond Lite", desc: "VIP access" },
  { amount: 7900, name: "Diamond Plan", desc: "Premium VIP" },
  { amount: 9000, name: "Diamond Plus", desc: "Elite wealth builder" },
  { amount: 12800, name: "Elite Plan", desc: "Exclusive tier" },
  { amount: 15002, name: "Elite Plus", desc: "Ultra premium" },
  { amount: 19999, name: "Royal Plan", desc: "Highest tier" },
];

const BANK_ACCOUNT = "44203021218";
const BANK_IFSC = "SBIN0001478";
const BANK_NAME = "IKHLAS HAMID";
const UPI_VPA = "44203021218@sbi";

const PAYMENT_METHODS = [
  {
    id: "bhim",
    label: "BHIM",
    color: "#1976D2",
    bg: "oklch(0.40 0.15 250 / 0.15)",
    border: "oklch(0.55 0.20 250 / 0.4)",
    scheme: (amount: number) =>
      `upi://pay?pa=${UPI_VPA}&pn=${encodeURIComponent(BANK_NAME)}&am=${amount}&cu=INR&tn=FSCFunds`,
  },
  {
    id: "phonepe",
    label: "PhonePe",
    color: "#5F259F",
    bg: "oklch(0.35 0.15 300 / 0.15)",
    border: "oklch(0.50 0.20 300 / 0.4)",
    scheme: (amount: number) =>
      `phonepe://pay?pa=${UPI_VPA}&pn=${encodeURIComponent(BANK_NAME)}&am=${amount}&cu=INR`,
  },
  {
    id: "paytm",
    label: "Paytm",
    color: "#00BAF2",
    bg: "oklch(0.55 0.15 215 / 0.15)",
    border: "oklch(0.65 0.18 215 / 0.4)",
    scheme: (amount: number) =>
      `paytmmp://pay?pa=${UPI_VPA}&pn=${encodeURIComponent(BANK_NAME)}&am=${amount}&cu=INR`,
  },
  {
    id: "upi",
    label: "UPI",
    color: "#F97316",
    bg: "oklch(0.55 0.18 55 / 0.15)",
    border: "oklch(0.65 0.20 55 / 0.4)",
    scheme: (amount: number) =>
      `upi://pay?pa=${UPI_VPA}&pn=${encodeURIComponent(BANK_NAME)}&am=${amount}&cu=INR&tn=FSCFunds`,
  },
];

interface AddFundsProps {
  initialAmount?: number | null;
  onBack: () => void;
}

type Step = "amount" | "method" | "verify";

export default function AddFunds({ initialAmount, onBack }: AddFundsProps) {
  const ticker = useMarketTicker();
  const [step, setStep] = useState<Step>("amount");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(
    initialAmount ?? null,
  );
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [utr, setUtr] = useState("");
  const [screenshot, setScreenshot] = useState<string>("");
  const [screenshotName, setScreenshotName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // initialAmount is kept for API compatibility but no longer skips to method step
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {}, [initialAmount]);

  function handleAmountSelect(amount: number) {
    setSelectedAmount(amount);
    setStep("method");
  }

  function handleMethodSelect(method: (typeof PAYMENT_METHODS)[number]) {
    setSelectedMethod(method.label);
    const deepLink = method.scheme(selectedAmount!);
    window.location.href = deepLink;
    setTimeout(() => setStep("verify"), 1500);
  }

  function handleScreenshotChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = () => setScreenshot(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    if (!utr.trim()) {
      toast.error("Please enter your UTR / Transaction ID");
      return;
    }
    setIsSubmitting(true);
    const user = getCurrentUser();
    const payments = getPayments();
    const submission: PaymentSubmission = {
      id: Date.now().toString(),
      userId: user?.uniqueId ?? "unknown",
      userName: user?.name ?? "Unknown",
      amount: selectedAmount!,
      method: selectedMethod,
      utr: utr.trim(),
      screenshot,
      status: "pending",
      date: new Date().toLocaleString("en-IN"),
    };
    payments.push(submission);
    savePayments(payments);
    // Fire-and-forget backend sync
    backendSubmitPayment(submission).catch(() => {});
    setTimeout(() => {
      setIsSubmitting(false);
      setDone(true);
    }, 800);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background bg-grid-pattern flex items-center justify-center px-4">
        <div
          style={{
            textAlign: "center",
            background: "oklch(0.13 0.025 265)",
            border: "1px solid oklch(0.65 0.2 145 / 0.4)",
            borderRadius: 20,
            padding: "48px 40px",
            maxWidth: 380,
            boxShadow: "0 0 40px oklch(0.65 0.2 145 / 0.1)",
          }}
        >
          <CheckCircle
            style={{
              width: 56,
              height: 56,
              color: "#22c55e",
              margin: "0 auto 20px",
            }}
          />
          <h2
            className="font-display"
            style={{
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "oklch(0.95 0.01 80)",
              marginBottom: 8,
            }}
          >
            Submitted!
          </h2>
          <p
            className="font-sans"
            style={{
              fontSize: "0.9rem",
              color: "oklch(0.55 0.02 265)",
              marginBottom: 24,
            }}
          >
            Your payment of ₹{selectedAmount?.toLocaleString("en-IN")} is under
            verification. Check status in Verifying.
          </p>
          <button
            type="button"
            className="btn-gold font-sans font-bold uppercase tracking-widest rounded-full px-8 py-3 text-sm"
            onClick={onBack}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      <header className="glass-header sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            data-ocid="add_funds.close_button"
            onClick={() =>
              step === "amount"
                ? onBack()
                : setStep(step === "verify" ? "method" : "amount")
            }
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
              Add Funds
            </p>
            <p
              className="font-sans text-muted-foreground"
              style={{ fontSize: "0.7rem" }}
            >
              Step {step === "amount" ? 1 : step === "method" ? 2 : 3} of 3
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-xl">
        {step === "amount" && (
          <div>
            <h2
              className="font-display font-bold text-foreground mb-2"
              style={{ fontSize: "1.5rem" }}
            >
              Select Plan
            </h2>
            <p className="font-sans text-muted-foreground text-sm mb-6">
              Choose your investment plan (INR ₹)
            </p>
            <div
              data-ocid="add_funds.list"
              className="grid grid-cols-2 gap-3 sm:grid-cols-3"
            >
              {STOCK_PLANS.map((plan, i) => {
                const pct = ticker[plan.amount];
                const isPositive = pct !== undefined && pct >= 0;
                const pctDisplay =
                  pct !== undefined
                    ? `${isPositive ? "+" : ""}${pct.toFixed(2)}%`
                    : "";

                return (
                  <button
                    key={plan.amount}
                    type="button"
                    data-ocid={`add_funds.item.${i + 1}`}
                    onClick={() => handleAmountSelect(plan.amount)}
                    className="stock-card"
                    style={{
                      background: "oklch(0.13 0.025 265)",
                      border: "1px solid oklch(0.78 0.18 82 / 0.22)",
                      borderRadius: 14,
                      padding: "14px 10px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                    }}
                  >
                    {/* Plan name + % badge row */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 6,
                      }}
                    >
                      <p
                        className="font-sans font-semibold"
                        style={{
                          fontSize: "0.72rem",
                          color: "oklch(0.75 0.03 265)",
                          lineHeight: 1.2,
                        }}
                      >
                        {plan.name}
                      </p>
                      {pctDisplay && (
                        <span
                          style={{
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            color: isPositive ? "#22c55e" : "#ef4444",
                            background: isPositive
                              ? "oklch(0.65 0.20 145 / 0.15)"
                              : "oklch(0.65 0.22 22 / 0.15)",
                            border: `1px solid ${
                              isPositive
                                ? "oklch(0.65 0.20 145 / 0.4)"
                                : "oklch(0.65 0.22 22 / 0.4)"
                            }`,
                            borderRadius: 4,
                            padding: "1px 4px",
                            flexShrink: 0,
                          }}
                        >
                          {pctDisplay}
                        </span>
                      )}
                    </div>

                    {/* Amount */}
                    <p
                      className="font-display font-bold"
                      style={{
                        fontSize:
                          plan.amount >= 10000
                            ? "1.05rem"
                            : plan.amount >= 1000
                              ? "1.15rem"
                              : "1.3rem",
                        background:
                          "linear-gradient(135deg, oklch(0.90 0.18 82), oklch(0.72 0.20 75))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        lineHeight: 1.1,
                        marginBottom: 4,
                      }}
                    >
                      ₹{plan.amount.toLocaleString("en-IN")}
                    </p>

                    {/* Description */}
                    <p
                      className="font-sans"
                      style={{
                        fontSize: "0.65rem",
                        color: "oklch(0.48 0.02 265)",
                        lineHeight: 1.3,
                      }}
                    >
                      {plan.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "method" && (
          <div>
            <h2
              className="font-display font-bold text-foreground mb-1"
              style={{ fontSize: "1.5rem" }}
            >
              Select Payment Method
            </h2>
            <p className="font-sans text-muted-foreground text-sm mb-1">
              Paying:{" "}
              <span className="text-primary font-bold">
                ₹{selectedAmount?.toLocaleString("en-IN")}
              </span>
            </p>
            <p className="font-sans text-muted-foreground text-xs mb-6">
              Amount will be pre-filled in the payment app
            </p>

            <div
              style={{
                background: "oklch(0.13 0.025 265)",
                border: "1px solid oklch(0.78 0.18 82 / 0.2)",
                borderRadius: 14,
                padding: "16px",
                marginBottom: 24,
              }}
            >
              <p
                className="font-sans"
                style={{
                  fontSize: "0.7rem",
                  color: "oklch(0.55 0.02 265)",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Bank Details
              </p>
              <p
                className="font-sans font-semibold"
                style={{
                  fontSize: "0.85rem",
                  color: "oklch(0.85 0.01 80)",
                  marginBottom: 2,
                }}
              >
                {BANK_NAME}
              </p>
              <p
                className="font-sans"
                style={{ fontSize: "0.8rem", color: "oklch(0.65 0.02 265)" }}
              >
                Account: {BANK_ACCOUNT}
              </p>
              <p
                className="font-sans"
                style={{ fontSize: "0.8rem", color: "oklch(0.65 0.02 265)" }}
              >
                IFSC: {BANK_IFSC}
              </p>
            </div>

            <div
              data-ocid="add_funds.payment_methods"
              className="grid grid-cols-2 gap-4"
            >
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  data-ocid={`add_funds.${method.id}_button`}
                  onClick={() => handleMethodSelect(method)}
                  style={{
                    background: method.bg,
                    border: `1px solid ${method.border}`,
                    borderRadius: 16,
                    padding: "20px 16px",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.2s",
                  }}
                >
                  <p
                    className="font-display font-bold"
                    style={{
                      fontSize: "1.3rem",
                      color: method.color,
                      marginBottom: 4,
                    }}
                  >
                    {method.label}
                  </p>
                  <p
                    className="font-sans"
                    style={{
                      fontSize: "0.7rem",
                      color: "oklch(0.55 0.02 265)",
                    }}
                  >
                    Tap to Pay
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "verify" && (
          <div>
            <h2
              className="font-display font-bold text-foreground mb-2"
              style={{ fontSize: "1.5rem" }}
            >
              Verify Payment
            </h2>
            <p className="font-sans text-muted-foreground text-sm mb-6">
              Upload proof to complete verification
            </p>

            <div
              style={{
                background: "oklch(0.13 0.025 265)",
                border: "1px solid oklch(0.78 0.18 82 / 0.2)",
                borderRadius: 14,
                padding: "14px 16px",
                marginBottom: 24,
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div>
                <p
                  className="font-sans"
                  style={{
                    fontSize: "0.65rem",
                    color: "oklch(0.50 0.02 265)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Amount
                </p>
                <p className="font-display font-bold text-primary">
                  ₹{selectedAmount?.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p
                  className="font-sans"
                  style={{
                    fontSize: "0.65rem",
                    color: "oklch(0.50 0.02 265)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Method
                </p>
                <p
                  className="font-sans font-semibold"
                  style={{ color: "oklch(0.85 0.01 80)" }}
                >
                  {selectedMethod}
                </p>
              </div>
              <div>
                <p
                  className="font-sans"
                  style={{
                    fontSize: "0.65rem",
                    color: "oklch(0.50 0.02 265)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Account
                </p>
                <p
                  className="font-sans font-semibold"
                  style={{ fontSize: "0.8rem", color: "oklch(0.85 0.01 80)" }}
                >
                  {BANK_ACCOUNT}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label
                htmlFor="utr-input"
                className="font-sans text-sm font-semibold text-foreground"
                style={{ display: "block", marginBottom: 8 }}
              >
                UTR / Transaction ID *
              </label>
              <Input
                id="utr-input"
                data-ocid="add_funds.utr_input"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="Enter 12-digit UTR number"
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <p
                className="font-sans text-sm font-semibold text-foreground"
                style={{ marginBottom: 8 }}
              >
                Payment Screenshot
              </p>
              <label
                htmlFor="screenshot-input"
                data-ocid="add_funds.upload_button"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "oklch(0.13 0.025 265)",
                  border: "2px dashed oklch(0.78 0.18 82 / 0.3)",
                  borderRadius: 14,
                  padding: 28,
                  cursor: "pointer",
                }}
              >
                <Upload
                  style={{
                    width: 28,
                    height: 28,
                    color: "oklch(0.78 0.18 82)",
                  }}
                />
                <p
                  className="font-sans text-sm"
                  style={{ color: "oklch(0.65 0.02 265)" }}
                >
                  {screenshotName || "Click to upload screenshot"}
                </p>
                <input
                  id="screenshot-input"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleScreenshotChange}
                />
              </label>
            </div>

            <Button
              data-ocid="add_funds.submit_button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-gold w-full font-sans font-bold uppercase tracking-widest rounded-full py-3"
            >
              {isSubmitting ? "Submitting..." : "Submit for Verification"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
