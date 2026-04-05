import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

const FLOAT_DOTS = [
  {
    size: 4,
    left: "8%",
    top: "20%",
    delay: "0s",
    opacity: 0.5,
    id: "d1",
    color: "oklch(0.65 0.22 220)",
  },
  {
    size: 6,
    left: "15%",
    top: "70%",
    delay: "0.4s",
    opacity: 0.4,
    id: "d2",
    color: "oklch(0.72 0.18 195)",
  },
  {
    size: 3,
    left: "25%",
    top: "40%",
    delay: "0.8s",
    opacity: 0.6,
    id: "d3",
    color: "oklch(0.65 0.22 220)",
  },
  {
    size: 5,
    left: "75%",
    top: "25%",
    delay: "0.2s",
    opacity: 0.5,
    id: "d4",
    color: "oklch(0.55 0.20 260)",
  },
  {
    size: 4,
    left: "85%",
    top: "60%",
    delay: "0.6s",
    opacity: 0.4,
    id: "d5",
    color: "oklch(0.72 0.18 195)",
  },
  {
    size: 7,
    left: "90%",
    top: "80%",
    delay: "1.0s",
    opacity: 0.35,
    id: "d6",
    color: "oklch(0.65 0.22 220)",
  },
  {
    size: 3,
    left: "50%",
    top: "12%",
    delay: "1.2s",
    opacity: 0.55,
    id: "d7",
    color: "oklch(0.78 0.16 205)",
  },
  {
    size: 5,
    left: "60%",
    top: "75%",
    delay: "0.3s",
    opacity: 0.4,
    id: "d8",
    color: "oklch(0.55 0.20 260)",
  },
  {
    size: 4,
    left: "35%",
    top: "85%",
    delay: "0.7s",
    opacity: 0.3,
    id: "d9",
    color: "oklch(0.72 0.18 195)",
  },
  {
    size: 6,
    left: "45%",
    top: "50%",
    delay: "1.5s",
    opacity: 0.22,
    id: "d10",
    color: "oklch(0.65 0.22 220)",
  },
  {
    size: 3,
    left: "70%",
    top: "45%",
    delay: "0.9s",
    opacity: 0.38,
    id: "d11",
    color: "oklch(0.78 0.16 205)",
  },
  {
    size: 5,
    left: "20%",
    top: "55%",
    delay: "1.3s",
    opacity: 0.3,
    id: "d12",
    color: "oklch(0.55 0.20 260)",
  },
  {
    size: 8,
    left: "5%",
    top: "48%",
    delay: "0.5s",
    opacity: 0.2,
    id: "d13",
    color: "oklch(0.65 0.22 220)",
  },
  {
    size: 4,
    left: "95%",
    top: "35%",
    delay: "1.1s",
    opacity: 0.28,
    id: "d14",
    color: "oklch(0.72 0.18 195)",
  },
];

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), 5500);
    const doneTimer = setTimeout(() => onComplete(), 6000);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={exiting ? "splash-exit" : "splash-enter"}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `
          radial-gradient(ellipse 80% 60% at 50% -20%, oklch(0.35 0.18 220 / 0.28) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 10% 90%, oklch(0.50 0.20 195 / 0.14) 0%, transparent 55%),
          radial-gradient(ellipse 50% 40% at 90% 20%, oklch(0.45 0.22 260 / 0.12) 0%, transparent 50%),
          linear-gradient(180deg, oklch(0.06 0.04 245) 0%, oklch(0.08 0.038 238) 50%, oklch(0.07 0.035 240) 100%)
        `,
        overflow: "hidden",
      }}
    >
      {/* Floating particles */}
      {FLOAT_DOTS.map((dot) => (
        <span
          key={dot.id}
          className="float-dot"
          style={{
            position: "absolute",
            left: dot.left,
            top: dot.top,
            width: dot.size,
            height: dot.size,
            borderRadius: "50%",
            background: dot.color,
            opacity: dot.opacity,
            animationDelay: dot.delay,
          }}
        />
      ))}

      {/* Large ambient glow orb */}
      <div
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, oklch(0.55 0.22 220 / 0.12) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* Inner glow pulse */}
      <div
        className="glow-pulse"
        style={{
          position: "absolute",
          width: 340,
          height: 340,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, oklch(0.65 0.22 220 / 0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Logo container with concentric rings */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 32,
        }}
      >
        {/* Outer ring */}
        <div
          className="ring-pulse"
          style={{
            position: "absolute",
            width: 230,
            height: 230,
            borderRadius: "50%",
            border: "1.5px solid oklch(0.65 0.22 220 / 0.28)",
            pointerEvents: "none",
          }}
        />
        {/* Inner ring */}
        <div
          className="ring-pulse"
          style={{
            position: "absolute",
            width: 185,
            height: 185,
            borderRadius: "50%",
            border: "1px solid oklch(0.72 0.18 195 / 0.38)",
            animationDelay: "0.4s",
            pointerEvents: "none",
          }}
        />

        <img
          src="/assets/generated/fsc-logo-premium-transparent.dim_300x300.png"
          alt="FSC Logo"
          style={{
            width: 160,
            height: 160,
            objectFit: "contain",
            filter:
              "drop-shadow(0 0 40px oklch(0.65 0.22 220 / 0.90)) drop-shadow(0 0 80px oklch(0.55 0.20 220 / 0.55)) drop-shadow(0 0 120px oklch(0.45 0.18 240 / 0.35))",
            position: "relative",
            zIndex: 1,
          }}
        />
      </div>

      {/* FSC Text */}
      <h1
        className="font-display"
        style={{
          fontSize: "clamp(3.8rem, 11vw, 6.5rem)",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          background:
            "linear-gradient(135deg, oklch(0.92 0.12 198) 0%, oklch(0.78 0.22 212) 50%, oklch(0.68 0.26 228) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        FSC
      </h1>

      <p
        className="font-sans"
        style={{
          fontSize: "1.125rem",
          fontWeight: 500,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "oklch(0.68 0.16 210)",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        Foreign Smart Coins
      </p>

      <p
        className="font-display"
        style={{
          fontSize: "0.92rem",
          fontStyle: "italic",
          fontWeight: 400,
          color: "oklch(0.50 0.10 225)",
          marginBottom: 10,
          textAlign: "center",
          letterSpacing: "0.04em",
        }}
      >
        Your Premium Financial Journey Begins
      </p>

      <p
        style={{
          fontSize: "0.65rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "oklch(0.38 0.06 235)",
          marginBottom: 72,
          textAlign: "center",
        }}
      >
        Powered by Internet Computer
      </p>

      {/* Bottom wave decoration */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          background:
            "linear-gradient(0deg, oklch(0.55 0.22 220 / 0.06) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "oklch(0.15 0.05 235)",
        }}
      >
        <div
          className="shimmer-bar"
          style={{
            height: "100%",
            background:
              "linear-gradient(90deg, oklch(0.45 0.22 235), oklch(0.65 0.24 218), oklch(0.82 0.18 200), oklch(0.65 0.24 218), oklch(0.45 0.22 235))",
            backgroundSize: "200% 100%",
            width: 0,
            boxShadow:
              "0 0 16px oklch(0.65 0.22 220 / 0.9), 0 0 32px oklch(0.55 0.22 220 / 0.5)",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 16,
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "oklch(0.35 0.05 230)",
          }}
        >
          Premium Financial Intelligence
        </p>
      </div>
    </div>
  );
}
