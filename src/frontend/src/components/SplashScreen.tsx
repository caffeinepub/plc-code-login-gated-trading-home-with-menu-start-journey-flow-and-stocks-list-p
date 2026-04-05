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
        background:
          "radial-gradient(ellipse at 50% 40%, oklch(0.16 0.03 265) 0%, oklch(0.09 0.02 265) 100%)",
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

      <div
        className="glow-pulse"
        style={{
          position: "absolute",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, oklch(0.78 0.18 82 / 0.14) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <img
        src="/assets/generated/fsc-logo-premium-transparent.dim_300x300.png"
        alt="FSC Logo"
        style={{
          width: 140,
          height: 140,
          objectFit: "contain",
          marginBottom: 28,
          filter: "drop-shadow(0 0 28px oklch(0.78 0.18 82 / 0.7))",
        }}
      />

      <h1
        className="font-display"
        style={{
          fontSize: "clamp(3.5rem, 10vw, 6rem)",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          background:
            "linear-gradient(135deg, oklch(0.90 0.18 82) 0%, oklch(0.72 0.20 75) 60%, oklch(0.85 0.18 82) 100%)",
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
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "oklch(0.75 0.10 82)",
          marginBottom: 10,
          textAlign: "center",
        }}
      >
        Foreign Smart Coins
      </p>

      <p
        className="font-display"
        style={{
          fontSize: "0.95rem",
          fontStyle: "italic",
          fontWeight: 400,
          color: "oklch(0.60 0.06 265)",
          marginBottom: 64,
          textAlign: "center",
          letterSpacing: "0.04em",
        }}
      >
        Your Premium Financial Journey Begins
      </p>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "oklch(0.25 0.04 265)",
        }}
      >
        <div
          className="shimmer-bar"
          style={{
            height: "100%",
            background:
              "linear-gradient(90deg, oklch(0.78 0.18 82), oklch(0.90 0.18 82), oklch(0.78 0.18 82))",
            width: 0,
            boxShadow: "0 0 12px oklch(0.78 0.18 82 / 0.8)",
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
            fontSize: "0.7rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "oklch(0.45 0.04 265)",
          }}
        >
          Premium Financial Intelligence
        </p>
      </div>
    </div>
  );
}
