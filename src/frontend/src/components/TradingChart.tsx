import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";

interface TradingChartProps {
  title: string;
  color: "gold" | "emerald";
}

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  time: number;
}

const CANVAS_COLORS = {
  gold: { up: "#e8b94f", down: "#c97f2a", wick: "#e8b94f" },
  emerald: { up: "#22c55e", down: "#ef4444", wick: "#22c55e" },
};

const BG_COLOR = "#0e1020";
const GRID_COLOR = "rgba(255,255,255,0.04)";

function generateCandle(prev: number): Candle {
  const change = (Math.random() - 0.48) * 400;
  const open = prev;
  const close = prev + change;
  const high = Math.max(open, close) + Math.random() * 150;
  const low = Math.min(open, close) - Math.random() * 150;
  return { open, high, low, close, time: Date.now() };
}

export default function TradingChart({ title, color }: TradingChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const basePrice = useRef(Math.random() * 8000 + 30000);
  const [candles, setCandles] = useState<Candle[]>([]);

  useEffect(() => {
    const initial: Candle[] = [];
    let price = basePrice.current;
    for (let i = 0; i < 24; i++) {
      const c = generateCandle(price);
      initial.push(c);
      price = c.close;
    }
    setCandles(initial);

    const interval = setInterval(() => {
      setCandles((prev) => {
        const last = prev[prev.length - 1]?.close ?? basePrice.current;
        const next = [...prev, generateCandle(last)];
        if (next.length > 24) next.shift();
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const pad = { top: 36, right: 16, bottom: 28, left: 58 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;

    const col = CANVAS_COLORS[color];
    const allValues = candles.flatMap((c) => [c.high, c.low]);
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const range = maxVal - minVal || 1;
    const toY = (v: number) =>
      pad.top + chartH - ((v - minVal) / range) * chartH;

    // Background
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (i * chartH) / 4;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(W - pad.right, y);
      ctx.stroke();
      const labelVal = maxVal - (i * range) / 4;
      ctx.fillStyle = "rgba(255,255,255,0.28)";
      ctx.font = "10px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`$${(labelVal / 1000).toFixed(1)}k`, pad.left - 5, y + 4);
    }

    // Candles
    const candleW = Math.max(4, (chartW / candles.length) * 0.6);
    const spacing = chartW / candles.length;

    for (let i = 0; i < candles.length; i++) {
      const c = candles[i];
      const x = pad.left + i * spacing + spacing / 2;
      const isUp = c.close >= c.open;
      const bodyColor = isUp ? col.up : col.down;

      // Wick
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, toY(c.high));
      ctx.lineTo(x, toY(c.low));
      ctx.stroke();

      // Body
      const bodyTop = toY(Math.max(c.open, c.close));
      const bodyBottom = toY(Math.min(c.open, c.close));
      const bodyH = Math.max(1, bodyBottom - bodyTop);

      ctx.fillStyle = bodyColor;
      ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH);
    }

    // Current price label
    const last = candles[candles.length - 1];
    const labelColor = last.close >= last.open ? col.up : col.down;
    ctx.fillStyle = labelColor;
    ctx.font = "bold 12px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`$${last.close.toFixed(2)}`, pad.left, pad.top - 10);
  }, [candles, color]);

  const last = candles[candles.length - 1];
  const first = candles[0];
  const pctChange = first
    ? (((last?.close ?? 0) - first.open) / first.open) * 100
    : 0;
  const isPositive = pctChange >= 0;

  return (
    <Card
      className="border bg-card"
      style={{
        borderColor: "oklch(0.78 0.18 82 / 0.2)",
        boxShadow: "0 4px 32px oklch(0.78 0.18 82 / 0.07)",
      }}
    >
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="font-sans text-base font-semibold text-foreground">
          {title}
        </CardTitle>
        <span
          className="text-xs font-sans font-bold px-2 py-1 rounded-full"
          style={{
            background: isPositive
              ? "oklch(0.65 0.20 145 / 0.15)"
              : "oklch(0.65 0.22 22 / 0.15)",
            color: isPositive ? "#22c55e" : "#ef4444",
          }}
        >
          {isPositive ? "+" : ""}
          {pctChange.toFixed(2)}%
        </span>
      </CardHeader>
      <CardContent className="p-0 pb-2">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ display: "block", height: 288 }}
        />
      </CardContent>
    </Card>
  );
}
