import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

const FLOAT_DOTS = [
  { size: 4, left: "8%", top: "20%", delay: "0s", opacity: 0.5, id: "d1" },
  { size: 6, left: "15%", top: "70%", delay: "0.4s", opacity: 0.4, id: "d2" },
  { size: 3, left: "25%", top: "40%", delay: "0.8s", opacity: 0.6, id: "d3" },
  { size: 5, left: "75%", top: "25%", delay: "0.2s", opacity: 0.5, id: "d4" },
  { size: 4, left: "85%", top: "60%", delay: "0.6s", opacity: 0.4, id: "d5" },
  { size: 7, left: "90%", top: "80%", delay: "1.0s", opacity: 0.3, id: "d6" },
  { size: 3, left: "50%", top: "15%", delay: "1.2s", opacity: 0.5, id: "d7" },
  { size: 5, left: "60%", top: "75%", delay: "0.3s", opacity: 0.4, id: "d8" },
  { size: 4, left: "35%", top: "85%", delay: "0.7s", opacity: 0.3, id: "d9" },
  { size: 6, left: "45%", top: "50%", delay: "1.5s", opacity: 0.25, id: "d10" },
  { size: 3, left: "70%", top: "45%", delay: "0.9s", opacity: 0.35, id: "d11" },
  { size: 5, left: "20%", top: "55%", delay: "1.3s", opacity: 0.3, id: "d12" },
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
          radial-gradient(ellipse 80% 50% at 20% -5%, oklch(0.78 0.18 82 / 0.08) 0%, transparent 55%),
          radial-gradient(ellipse 60% 40% at 80% 100%, oklch(0.65 0.18 200 / 0.05) 0%, transparent 55%),
          radial-gradient(ellipse at 50% 40%, oklch(0.13 0.028 265) 0%, oklch(0.08 0.018 265) 100%)
        `,
        overflow: "hidden",
      }}
    >
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
            background: "oklch(0.78 0.18 82)",
            opacity: dot.opacity,
            animationDelay: dot.delay,
          }}
        />
      ))}

      {/* Ambient glow orb — large background */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, oklch(0.78 0.18 82 / 0.10) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* Inner glow */}
      <div
        className="glow-pulse"
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, oklch(0.78 0.18 82 / 0.16) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Logo container with rings */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 32,
        }}
      >
        {/* Ring 2 — outer */}
        <div
          style={{
            position: "absolute",
            width: 280,
            height: 280,
            borderRadius: "50%",
            border: "1px solid oklch(0.78 0.18 82 / 0.15)",
            animation: "ring-pulse 2s ease-in-out infinite",
            animationDelay: "0.5s",
          }}
        />
        {/* Ring 1 — inner */}
        <div
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: "1px solid oklch(0.78 0.18 82 / 0.3)",
            animation: "ring-pulse 2s ease-in-out infinite",
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
              "drop-shadow(0 0 40px oklch(0.78 0.18 82 / 0.8)) drop-shadow(0 0 80px oklch(0.78 0.18 82 / 0.4))",
            position: "relative",
            zIndex: 1,
          }}
        />
      </div>

      <h1
        className="font-display"
        style={{
          fontSize: "clamp(3.8rem, 11vw, 6.5rem)",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          background:
            "linear-gradient(135deg, oklch(0.96 0.16 95) 0%, oklch(0.84 0.22 84) 50%, oklch(0.88 0.18 86) 100%)",
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
          color: "oklch(0.78 0.12 84)",
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
          color: "oklch(0.55 0.06 265)",
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
          color: "oklch(0.40 0.04 265)",
          marginBottom: 72,
          textAlign: "center",
        }}
      >
        Powered by Internet Computer
      </p>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "oklch(0.18 0.03 265)",
        }}
      >
        <div
          className="shimmer-bar"
          style={{
            height: "100%",
            background:
              "linear-gradient(90deg, oklch(0.68 0.18 82), oklch(0.88 0.20 86), oklch(0.96 0.14 92), oklch(0.88 0.20 86), oklch(0.68 0.18 82))",
            backgroundSize: "200% 100%",
            width: 0,
            boxShadow:
              "0 0 16px oklch(0.78 0.18 82 / 0.9), 0 0 32px oklch(0.78 0.18 82 / 0.5)",
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
            color: "oklch(0.38 0.03 265)",
          }}
        >
          Premium Financial Intelligence
        </p>
      </div>
    </div>
  );
}
