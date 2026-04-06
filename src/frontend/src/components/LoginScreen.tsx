import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Loader2,
  Mail,
  Shield,
  Smartphone,
  User,
} from "lucide-react";
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

const PARTICLES = [
  { id: "p1", size: 3, left: "8%", top: "15%", delay: "0s", opacity: 0.35 },
  { id: "p2", size: 4, left: "88%", top: "20%", delay: "0.5s", opacity: 0.28 },
  { id: "p3", size: 3, left: "5%", top: "70%", delay: "1.0s", opacity: 0.3 },
  { id: "p4", size: 5, left: "92%", top: "75%", delay: "0.3s", opacity: 0.22 },
  { id: "p5", size: 3, left: "50%", top: "5%", delay: "0.8s", opacity: 0.25 },
  { id: "p6", size: 4, left: "15%", top: "90%", delay: "1.2s", opacity: 0.2 },
  { id: "p7", size: 3, left: "80%", top: "88%", delay: "0.6s", opacity: 0.18 },
];

export default function LoginScreen({
  onLogin,
  onAdminAccess,
}: LoginScreenProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  function handleNameNext() {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) {
      setNameError("Please enter your full name (at least 2 characters)");
      return;
    }
    setNameError("");
    setStep(2);
  }

  async function handleLogin() {
    const cleaned = phone.replace(/\s/g, "");
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setPhoneError("Please enter a valid 10-digit Indian mobile number");
      return;
    }
    setPhoneError("");

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
        setIsLoggingIn(true);
        // Await backend sync with retries to ensure admin panel visibility
        await backendRegisterUser(existing).catch(() => {});
        setIsLoggingIn(false);
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
    setIsLoggingIn(true);
    // Await backend registration to ensure user is visible in admin panel
    await backendRegisterUser(user).catch((e) =>
      console.warn("Backend sync failed:", e),
    );
    setIsLoggingIn(false);
    onLogin();
  }

  return (
    <div
      style={{
        inset: 0,
        background: `
          radial-gradient(ellipse 100% 60% at 50% -10%, oklch(0.40 0.22 215 / 0.22) 0%, transparent 55%),
          radial-gradient(ellipse 60% 50% at 5% 100%, oklch(0.50 0.20 195 / 0.14) 0%, transparent 50%),
          radial-gradient(ellipse 50% 40% at 95% 50%, oklch(0.45 0.22 255 / 0.12) 0%, transparent 50%),
          linear-gradient(165deg, oklch(0.06 0.04 248) 0%, oklch(0.08 0.038 238) 60%, oklch(0.07 0.035 242) 100%)
        `,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        overflowY: "auto",
        position: "relative" as const,
      }}
    >
      {/* Background particles */}
      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className="float-dot"
          style={{
            position: "absolute",
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: "oklch(0.65 0.22 220)",
            opacity: p.opacity,
            animationDelay: p.delay,
          }}
        />
      ))}

      {/* Logo */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 32,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: "relative",
            display: "inline-block",
            marginBottom: 16,
          }}
        >
          {/* Blue ring behind logo */}
          <div
            className="glow-pulse"
            style={{
              position: "absolute",
              inset: -14,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, oklch(0.55 0.20 220 / 0.28) 0%, transparent 70%)",
              border: "1.5px solid oklch(0.65 0.22 220 / 0.38)",
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
                "drop-shadow(0 0 24px oklch(0.65 0.22 220 / 0.80)) drop-shadow(0 0 48px oklch(0.55 0.20 220 / 0.48))",
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
              "linear-gradient(135deg, oklch(0.92 0.12 198), oklch(0.78 0.22 212), oklch(0.68 0.26 228))",
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
            color: "oklch(0.58 0.14 215)",
          }}
        >
          Foreign Smart Coins
        </p>
      </div>

      {/* Step indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.75rem",
            fontWeight: 700,
            background:
              "linear-gradient(135deg, oklch(0.62 0.24 218), oklch(0.52 0.26 232))",
            color: "white",
            boxShadow: "0 0 12px oklch(0.55 0.22 220 / 0.5)",
          }}
        >
          1
        </div>
        <div
          style={{
            width: 32,
            height: 2,
            background:
              step === 2
                ? "linear-gradient(90deg, oklch(0.65 0.22 220), oklch(0.72 0.18 195))"
                : "oklch(0.22 0.06 232)",
            borderRadius: 2,
            transition: "background 0.3s ease",
          }}
        />
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.75rem",
            fontWeight: 700,
            background:
              step === 2
                ? "linear-gradient(135deg, oklch(0.62 0.24 218), oklch(0.52 0.26 232))"
                : "oklch(0.15 0.05 232)",
            color: step === 2 ? "white" : "oklch(0.42 0.06 220)",
            border: step === 2 ? "none" : "1px solid oklch(0.28 0.07 230)",
            boxShadow:
              step === 2 ? "0 0 12px oklch(0.55 0.22 220 / 0.5)" : "none",
            transition: "all 0.3s ease",
          }}
        >
          2
        </div>
      </div>

      {/* Card with blue gradient border */}
      <div
        style={{
          padding: 1,
          borderRadius: 22,
          background:
            "linear-gradient(135deg, oklch(0.65 0.22 220 / 0.55), oklch(0.72 0.18 195 / 0.30), oklch(0.55 0.22 255 / 0.40))",
          boxShadow:
            "0 0 80px oklch(0.55 0.22 220 / 0.15), 0 32px 80px oklch(0 0 0 / 0.55)",
          width: "100%",
          maxWidth: 380,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            background: "oklch(0.10 0.04 238)",
            borderRadius: 21,
            padding: "32px 28px",
          }}
        >
          <h2
            className="font-display"
            style={{
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "oklch(0.96 0.008 200)",
              marginBottom: 6,
            }}
          >
            {step === 1 ? "Welcome Back" : "Verify Identity"}
          </h2>
          <p
            className="font-sans"
            style={{
              fontSize: "0.875rem",
              color: "oklch(0.50 0.05 225)",
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
                    color: "oklch(0.65 0.22 220)",
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
                    background: "oklch(0.14 0.048 240)",
                    borderColor: "oklch(0.28 0.07 230)",
                    color: "oklch(0.96 0.008 200)",
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
                    color: "oklch(0.65 0.22 220)",
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
                    background: "oklch(0.14 0.048 240)",
                    borderColor: "oklch(0.28 0.07 230)",
                    color: "oklch(0.96 0.008 200)",
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
                disabled={isLoggingIn}
                className="btn-gold w-full mt-4 rounded-2xl py-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                style={{
                  fontSize: "0.9rem",
                  opacity: isLoggingIn ? 0.7 : 1,
                  cursor: isLoggingIn ? "not-allowed" : "pointer",
                }}
                data-ocid="login.submit_button"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2
                      style={{ width: 18, height: 18 }}
                      className="animate-spin"
                    />
                    Signing In...
                  </>
                ) : (
                  <>
                    Login <ArrowRight style={{ width: 18, height: 18 }} />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full mt-2 py-2.5 text-sm font-medium transition-colors"
                style={{ color: "oklch(0.48 0.06 225)" }}
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
              borderTop: "1px solid oklch(0.20 0.055 235)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 999,
                background: "oklch(0.65 0.22 220 / 0.08)",
                border: "1px solid oklch(0.65 0.22 220 / 0.18)",
              }}
            >
              <Shield
                style={{
                  width: 12,
                  height: 12,
                  color: "oklch(0.65 0.22 220)",
                }}
              />
              <p
                style={{
                  fontSize: "0.68rem",
                  color: "oklch(0.55 0.08 220)",
                  letterSpacing: "0.02em",
                }}
              >
                256-bit encrypted • Secure blockchain
              </p>
            </div>
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
          padding: "9px 20px",
          borderRadius: 999,
          background: "oklch(0.65 0.22 220 / 0.10)",
          border: "1px solid oklch(0.65 0.22 220 / 0.28)",
          color: "oklch(0.72 0.18 215)",
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.02em",
          textDecoration: "none",
          transition: "all 0.2s ease",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Mail style={{ width: 13, height: 13 }} />
        Customer Care
      </a>

      <p
        className="text-muted-foreground mt-4"
        style={{ fontSize: "0.65rem", position: "relative", zIndex: 1 }}
      >
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
          color: "oklch(0.25 0.04 240)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          letterSpacing: "0.05em",
          position: "relative",
          zIndex: 1,
        }}
        data-ocid="login.admin.link"
      >
        Admin Access
      </button>
    </div>
  );
}
