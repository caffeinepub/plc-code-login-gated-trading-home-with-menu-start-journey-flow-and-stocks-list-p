import { ArrowLeft, Gift } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { playSound, startSpin, stopSpin } from "../hooks/useSounds";
import {
  formatInr,
  getCurrentUser,
  getDailySpinRecord,
  saveDailySpinRecord,
  saveUser,
} from "../types/fsc";

interface DailyRewardsProps {
  onBack: () => void;
}

const REWARDS = [5, 10, 25, 50, 100, 200, 50, 500];
const SEGMENT_COLORS = [
  "#c8973a",
  "#0e1435",
  "#c8973a",
  "#0e1435",
  "#c8973a",
  "#0e1435",
  "#c8973a",
  "#0e1435",
];
const NUM_SEGMENTS = REWARDS.length;
const SEGMENT_ANGLE = (2 * Math.PI) / NUM_SEGMENTS;

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getTimeUntilMidnight(): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { hours, minutes, seconds };
}

export default function DailyRewards({ onBack }: DailyRewardsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());
  const user = getCurrentUser();
  const spinRecord = user
    ? getDailySpinRecord(user.uniqueId)
    : { lastSpinDate: "", totalEarned: 0 };
  const alreadySpun = spinRecord.lastSpinDate === getTodayDate();
  const [totalEarned, setTotalEarned] = useState(spinRecord.totalEarned);

  useEffect(() => {
    drawWheel(rotation);
  }, [rotation]);

  useEffect(() => {
    if (!alreadySpun) return;
    const timer = setInterval(() => {
      setCountdown(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, [alreadySpun]);

  function drawWheel(rot: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 4;

    ctx.clearRect(0, 0, size, size);

    for (let i = 0; i < NUM_SEGMENTS; i++) {
      const startAngle = rot + i * SEGMENT_ANGLE - Math.PI / 2;
      const endAngle = startAngle + SEGMENT_ANGLE;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = SEGMENT_COLORS[i];
      ctx.fill();
      ctx.strokeStyle = "#e8b94f";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      const midAngle = startAngle + SEGMENT_ANGLE / 2;
      const labelR = r * 0.68;
      const lx = cx + Math.cos(midAngle) * labelR;
      const ly = cy + Math.sin(midAngle) * labelR;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(midAngle + Math.PI / 2);
      ctx.fillStyle = i % 2 === 0 ? "#0e1020" : "#e8b94f";
      ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`₹${REWARDS[i]}`, 0, 0);
      ctx.restore();
    }

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.fillStyle = "#0e1020";
    ctx.fill();
    ctx.strokeStyle = "#e8b94f";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#e8b94f";
    ctx.font = "bold 11px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SPIN", cx, cy);
  }

  function handleSpin() {
    if (isSpinning || alreadySpun || !user) return;
    const currentUser = user;

    const winIndex = Math.floor(Math.random() * NUM_SEGMENTS);
    const reward = REWARDS[winIndex];

    const targetSegmentAngle = -(winIndex * SEGMENT_ANGLE) - SEGMENT_ANGLE / 2;
    const fullSpins = Math.PI * 2 * (5 + Math.floor(Math.random() * 3));
    const targetRotation = fullSpins + targetSegmentAngle;

    setIsSpinning(true);
    startSpin();

    const startTime = performance.now();
    const duration = 3500;
    const startRotation = rotation;

    function easeOut(t: number): number {
      return 1 - (1 - t) ** 4;
    }

    function animate(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const currentRot = startRotation + targetRotation * easeOut(t);
      setRotation(currentRot % (Math.PI * 2));

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        stopSpin();
        playSound("win");
        setIsSpinning(false);
        const newTotal = totalEarned + reward;
        setTotalEarned(newTotal);
        saveDailySpinRecord(currentUser.uniqueId, {
          lastSpinDate: getTodayDate(),
          totalEarned: newTotal,
        });
        const updatedUser = {
          ...currentUser,
          balance: currentUser.balance + reward,
        };
        saveUser(updatedUser);
        toast.success(
          `\ud83c\udf89 You won ${formatInr(reward)}! Added to your balance.`,
        );
      }
    }

    requestAnimationFrame(animate);
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
              Daily Rewards
            </p>
            <p
              className="font-sans text-muted-foreground"
              style={{ fontSize: "0.7rem" }}
            >
              Spin once per day to win
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-md">
        {/* Spin wheel */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          {/* Pointer */}
          <div style={{ position: "relative", zIndex: 10, marginBottom: -12 }}>
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderTop: "20px solid #e8b94f",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
              }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <canvas
              ref={canvasRef}
              width={280}
              height={280}
              aria-label="Spin wheel for daily rewards"
              role="img"
              style={{
                borderRadius: "50%",
                boxShadow:
                  "0 0 40px oklch(0.78 0.18 82 / 0.3), 0 8px 32px oklch(0 0 0 / 0.4)",
                cursor: alreadySpun || isSpinning ? "not-allowed" : "pointer",
                opacity: alreadySpun ? 0.7 : 1,
              }}
              onClick={handleSpin}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleSpin();
              }}
            />
          </div>
        </div>

        {/* Spin button */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          {alreadySpun ? (
            <div
              style={{
                background: "oklch(0.13 0.03 265)",
                border: "1px solid oklch(0.78 0.18 82 / 0.2)",
                borderRadius: 14,
                padding: "16px 24px",
              }}
            >
              <p
                className="font-sans font-semibold"
                style={{
                  color: "oklch(0.78 0.18 82)",
                  marginBottom: 4,
                  fontSize: "0.9rem",
                }}
              >
                Come back tomorrow!
              </p>
              <p
                className="font-sans text-muted-foreground"
                style={{ fontSize: "0.8rem" }}
              >
                Next spin in:{" "}
                <strong style={{ color: "oklch(0.78 0.18 82)" }}>
                  {String(countdown.hours).padStart(2, "0")}:
                  {String(countdown.minutes).padStart(2, "0")}:
                  {String(countdown.seconds).padStart(2, "0")}
                </strong>
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSpin}
              disabled={isSpinning}
              className="btn-gold font-sans font-bold uppercase tracking-widest rounded-full px-12 py-4 text-base"
              style={{ opacity: isSpinning ? 0.7 : 1 }}
            >
              <Gift
                style={{
                  width: 18,
                  height: 18,
                  display: "inline",
                  marginRight: 8,
                }}
              />
              {isSpinning ? "Spinning..." : "Spin Now"}
            </button>
          )}
        </div>

        {/* Total earned */}
        <div
          style={{
            background: "oklch(0.13 0.03 265)",
            border: "1px solid oklch(0.78 0.18 82 / 0.15)",
            borderRadius: 14,
            padding: "18px 20px",
            textAlign: "center",
          }}
        >
          <p className="font-sans text-muted-foreground text-xs uppercase tracking-widest mb-1">
            Total Earned from Daily Spins
          </p>
          <p
            className="font-display font-bold"
            style={{
              fontSize: "1.8rem",
              background:
                "linear-gradient(135deg, oklch(0.90 0.18 82), oklch(0.72 0.20 75))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {formatInr(totalEarned)}
          </p>
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
