import { useEffect, useRef, useState } from "react";

const PLAN_AMOUNTS = [
  50, 150, 250, 350, 550, 780, 1120, 2238, 3000, 3700, 4200, 5200, 6600, 7900,
  9000, 12800, 15002, 19999,
];

export type TickerData = Record<number, number>; // amount -> % change

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function initTicker(): TickerData {
  const data: TickerData = {};
  for (const amt of PLAN_AMOUNTS) {
    // random initial % between -4.9 and +4.9
    data[amt] = Number.parseFloat((Math.random() * 9.8 - 4.9).toFixed(2));
  }
  return data;
}

export function useMarketTicker(): TickerData {
  const [ticker, setTicker] = useState<TickerData>(() => initTicker());
  const tickerRef = useRef<TickerData>(ticker);

  useEffect(() => {
    const interval = setInterval(() => {
      const next: TickerData = {};
      for (const amt of PLAN_AMOUNTS) {
        const prev = tickerRef.current[amt] ?? 0;
        // random delta between ±0.1 and ±0.5
        const delta =
          (Math.random() * 0.8 - 0.4) * (Math.random() > 0.5 ? 1 : -1);
        const magnitude = 0.1 + Math.random() * 0.4;
        const sign = delta >= 0 ? 1 : -1;
        const change = sign * magnitude;
        next[amt] = Number.parseFloat(
          clamp(prev + change, -9.9, 9.9).toFixed(2),
        );
      }
      tickerRef.current = next;
      setTicker(next);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return ticker;
}
