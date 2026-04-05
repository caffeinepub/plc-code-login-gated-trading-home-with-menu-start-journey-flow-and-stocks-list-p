import { Input } from "@/components/ui/input";
import { ArrowRight, Smartphone, User } from "lucide-react";
import { useState } from "react";
import { type FscUser, isBlocked, saveUser } from "../types/fsc";

interface LoginScreenProps {
  onLogin: () => void;
  onAdminAccess?: () => void;
}

export default function LoginScreen({
  onLogin,
  onAdminAccess,
}: LoginScreenProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  function handleNameNext() {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) {
      setNameError("Please enter your full name (at least 2 characters)");
      return;
    }
    setNameError("");
    setStep(2);
  }

  function handleLogin() {
    const cleaned = phone.replace(/\s/g, "");
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setPhoneError("Please enter a valid 10-digit Indian mobile number");
      return;
    }
    setPhoneError("");

    // Check blocklist (Feature 17)
    if (isBlocked(cleaned)) {
      setPhoneError(
        "This number has been blocked. Contact support to resolve this.",
      );
      return;
    }

    const existingRaw = localStorage.getItem(`fsc_user_${cleaned}`);
    if (existingRaw) {
      try {
        const existing = JSON.parse(existingRaw) as FscUser;
        // Check suspension (Feature 5)
        if (existing.suspended) {
          setPhoneError(
            `Your account has been suspended. Reason: ${
              existing.suspensionReason || "Policy violation"
            }. Contact support.`,
          );
          return;
        }
        saveUser(existing);
        onLogin();
        return;
      } catch {
        // fallthrough to create new
      }
    }

    const uniqueId = String(Math.floor(10000000 + Math.random() * 90000000));
    const user: FscUser = {
      name: name.trim(),
      phone: cleaned,
      uniqueId,
      balance: 0,
    };
    saveUser(user);
    onLogin();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background:
          "radial-gradient(ellipse at 50% 30%, oklch(0.16 0.03 265) 0%, oklch(0.09 0.02 265) 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <img
          src="/assets/generated/fsc-logo-premium-transparent.dim_300x300.png"
          alt="FSC"
          style={{
            width: 90,
            height: 90,
            objectFit: "contain",
            margin: "0 auto 16px",
            display: "block",
            filter: "drop-shadow(0 0 20px oklch(0.78 0.18 82 / 0.6))",
          }}
        />
        <h1
          className="font-display"
          style={{
            fontSize: "2.5rem",
            fontWeight: 800,
            background:
              "linear-gradient(135deg, oklch(0.90 0.18 82), oklch(0.72 0.20 75))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: 4,
          }}
        >
          FSC
        </h1>
        <p
          className="font-sans"
          style={{
            fontSize: "0.8rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "oklch(0.60 0.08 82)",
          }}
        >
          Foreign Smart Coins
        </p>
      </div>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "oklch(0.13 0.025 265)",
          border: "1px solid oklch(0.78 0.18 82 / 0.25)",
          borderRadius: 20,
          padding: "32px 28px",
          boxShadow:
            "0 20px 60px oklch(0 0 0 / 0.5), 0 0 40px oklch(0.78 0.18 82 / 0.08)",
        }}
      >
        <h2
          className="font-display"
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "oklch(0.95 0.01 80)",
            marginBottom: 6,
          }}
        >
          {step === 1 ? "Welcome Back" : "Verify Identity"}
        </h2>
        <p
          className="font-sans"
          style={{
            fontSize: "0.875rem",
            color: "oklch(0.55 0.02 265)",
            marginBottom: 28,
          }}
        >
          {step === 1
            ? "Enter your name to get started"
            : "Enter your 10-digit Indian mobile number"}
        </p>

        {step === 1 ? (
          <div>
            <div style={{ position: "relative", marginBottom: 8 }}>
              <User
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 18,
                  height: 18,
                  color: "oklch(0.78 0.18 82)",
                }}
              />
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNameNext()}
                placeholder="Your full name"
                style={{ paddingLeft: 44 }}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                data-ocid="login.name.input"
              />
            </div>
            {nameError && (
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "oklch(0.65 0.22 22)",
                  marginBottom: 8,
                }}
                data-ocid="login.name_error"
              >
                {nameError}
              </p>
            )}
            <button
              type="button"
              onClick={handleNameNext}
              className="btn-gold w-full mt-4 rounded-xl py-3.5 font-bold uppercase tracking-widest flex items-center justify-center gap-2"
              data-ocid="login.name.submit_button"
            >
              Next <ArrowRight style={{ width: 18, height: 18 }} />
            </button>
          </div>
        ) : (
          <div>
            <div style={{ position: "relative", marginBottom: 8 }}>
              <Smartphone
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 18,
                  height: 18,
                  color: "oklch(0.78 0.18 82)",
                }}
              />
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="10-digit mobile number"
                maxLength={10}
                inputMode="numeric"
                style={{ paddingLeft: 44 }}
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                data-ocid="login.phone.input"
              />
            </div>
            {phoneError && (
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "oklch(0.65 0.22 22)",
                  marginBottom: 8,
                  lineHeight: 1.4,
                }}
                data-ocid="login.phone_error"
              >
                {phoneError}
              </p>
            )}
            <button
              type="button"
              onClick={handleLogin}
              className="btn-gold w-full mt-4 rounded-xl py-3.5 font-bold uppercase tracking-widest flex items-center justify-center gap-2"
              data-ocid="login.submit_button"
            >
              Login <ArrowRight style={{ width: 18, height: 18 }} />
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full mt-2 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </button>
          </div>
        )}
      </div>

      <p className="text-muted-foreground mt-8" style={{ fontSize: "0.7rem" }}>
        © {new Date().getFullYear()} FSC Foreign Smart Coins. All rights
        reserved.
      </p>

      {/* Admin Access link */}
      <button
        type="button"
        onClick={() => onAdminAccess?.()}
        style={{
          marginTop: 16,
          fontSize: "0.65rem",
          color: "oklch(0.35 0.02 265)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          letterSpacing: "0.05em",
        }}
        data-ocid="login.admin.link"
      >
        Admin Access
      </button>
    </div>
  );
}
