import { Input } from "@/components/ui/input";
import { ArrowRight, Mail, Smartphone, User } from "lucide-react";
import { useState } from "react";
import { backendRegisterUser } from "../lib/backendStore";
import {
  type FscUser,
  isBlocked,
  registerUserGlobally,
  saveUser,
} from "../types/fsc";

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
        registerUserGlobally(cleaned);
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
    registerUserGlobally(cleaned);
    // Fire-and-forget backend registration
    backendRegisterUser(user).catch(() => {});
    onLogin();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: `
          radial-gradient(ellipse 80% 50% at 20% -5%, oklch(0.78 0.18 82 / 0.07) 0%, transparent 55%),
          radial-gradient(ellipse 60% 40% at 80% 100%, oklch(0.65 0.18 200 / 0.04) 0%, transparent 55%),
          radial-gradient(ellipse at 50% 30%, oklch(0.14 0.028 265) 0%, oklch(0.08 0.018 265) 100%)
        `,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div
          style={{
            position: "relative",
            display: "inline-block",
            marginBottom: 16,
          }}
        >
          {/* Golden ring behind logo */}
          <div
            className="glow-pulse"
            style={{
              position: "absolute",
              inset: -12,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, oklch(0.78 0.18 82 / 0.2) 0%, transparent 65%)",
              border: "1px solid oklch(0.78 0.18 82 / 0.3)",
            }}
          />
          <img
            src="/assets/generated/fsc-logo-premium-transparent.dim_300x300.png"
            alt="FSC"
            style={{
              width: 96,
              height: 96,
              objectFit: "contain",
              display: "block",
              filter:
                "drop-shadow(0 0 24px oklch(0.78 0.18 82 / 0.7)) drop-shadow(0 0 48px oklch(0.78 0.18 82 / 0.35))",
              position: "relative",
              zIndex: 1,
            }}
          />
        </div>
        <h1
          className="font-display"
          style={{
            fontSize: "3rem",
            fontWeight: 800,
            background:
              "linear-gradient(135deg, oklch(0.96 0.16 95), oklch(0.84 0.22 84), oklch(0.74 0.20 76))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: 4,
            lineHeight: 1,
          }}
        >
          FSC
        </h1>
        <p
          className="font-sans"
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "oklch(0.62 0.09 84)",
          }}
        >
          Foreign Smart Coins
        </p>
      </div>

      {/* Card with gradient border */}
      <div
        style={{
          padding: 1,
          borderRadius: 22,
          background:
            "linear-gradient(135deg, oklch(0.78 0.18 82 / 0.5), oklch(0.55 0.18 200 / 0.25), oklch(0.78 0.18 82 / 0.5))",
          boxShadow:
            "0 0 60px oklch(0.78 0.18 82 / 0.12), 0 24px 80px oklch(0 0 0 / 0.6)",
          width: "100%",
          maxWidth: 380,
        }}
      >
        <div
          style={{
            background: "oklch(0.12 0.024 265)",
            borderRadius: 21,
            padding: "32px 28px",
          }}
        >
          <h2
            className="font-display"
            style={{
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "oklch(0.96 0.005 80)",
              marginBottom: 6,
            }}
          >
            {step === 1 ? "Welcome Back" : "Verify Identity"}
          </h2>
          <p
            className="font-sans"
            style={{
              fontSize: "0.875rem",
              color: "oklch(0.50 0.02 265)",
              marginBottom: 28,
              lineHeight: 1.5,
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
                    zIndex: 1,
                  }}
                />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNameNext()}
                  placeholder="Your full name"
                  style={{
                    paddingLeft: 44,
                    background: "oklch(0.16 0.028 265)",
                    borderColor: "oklch(0.28 0.042 265)",
                    color: "oklch(0.96 0.005 80)",
                    borderRadius: 14,
                    height: 48,
                    fontSize: "0.95rem",
                  }}
                  className="placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  data-ocid="login.name.input"
                />
              </div>
              {nameError && (
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "oklch(0.65 0.22 22)",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                  data-ocid="login.name_error"
                >
                  {nameError}
                </p>
              )}
              <button
                type="button"
                onClick={handleNameNext}
                className="btn-gold w-full mt-4 rounded-2xl py-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                style={{ fontSize: "0.9rem" }}
                data-ocid="login.name.submit_button"
              >
                Continue <ArrowRight style={{ width: 18, height: 18 }} />
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
                    zIndex: 1,
                  }}
                />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  inputMode="numeric"
                  style={{
                    paddingLeft: 44,
                    background: "oklch(0.16 0.028 265)",
                    borderColor: "oklch(0.28 0.042 265)",
                    color: "oklch(0.96 0.005 80)",
                    borderRadius: 14,
                    height: 48,
                    fontSize: "0.95rem",
                  }}
                  className="placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
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
                className="btn-gold w-full mt-4 rounded-2xl py-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                style={{ fontSize: "0.9rem" }}
                data-ocid="login.submit_button"
              >
                Login <ArrowRight style={{ width: 18, height: 18 }} />
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full mt-2 py-2.5 text-sm font-medium transition-colors"
                style={{ color: "oklch(0.50 0.02 265)" }}
              >
                ← Back
              </button>
            </div>
          )}

          {/* Trust indicator */}
          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid oklch(0.22 0.034 265)",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "0.68rem",
                color: "oklch(0.42 0.02 265)",
                letterSpacing: "0.02em",
              }}
            >
              🔐 256-bit encrypted • Secure transactions
            </p>
          </div>
        </div>
      </div>

      {/* Customer Care Button */}
      <a
        href="https://mail.google.com/mail/?view=cm&to=99999diamonds@gmail.com&su=FSC%20Support%20Request&body=Hello%20FSC%20Support%2C%0A%0A"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          marginTop: 20,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 18px",
          borderRadius: 999,
          background: "oklch(0.78 0.18 82 / 0.1)",
          border: "1px solid oklch(0.78 0.18 82 / 0.25)",
          color: "oklch(0.82 0.12 84)",
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.02em",
          textDecoration: "none",
          transition: "all 0.2s ease",
        }}
      >
        <Mail style={{ width: 13, height: 13 }} />
        Customer Care
      </a>

      <p className="text-muted-foreground mt-4" style={{ fontSize: "0.65rem" }}>
        © {new Date().getFullYear()} FSC Foreign Smart Coins. All rights
        reserved.
      </p>

      {/* Admin Access link */}
      <button
        type="button"
        onClick={() => onAdminAccess?.()}
        style={{
          marginTop: 10,
          fontSize: "0.6rem",
          color: "oklch(0.28 0.02 265)",
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
