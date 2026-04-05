import { useEffect, useState } from "react";

type ConnType = "WiFi" | "4G" | "3G" | "2G" | "Slow" | "Online" | "Offline";

function getConnectionType(): ConnType {
  const nav = navigator as Navigator & {
    connection?: { effectiveType?: string; downlink?: number };
  };
  if (!navigator.onLine) return "Offline";
  const conn = nav.connection;
  if (!conn) return "Online";
  const type = conn.effectiveType;
  if (type === "4g") return "4G";
  if (type === "3g") return "3G";
  if (type === "2g" || type === "slow-2g") return "Slow";
  return "WiFi";
}

const TYPE_COLORS: Record<ConnType, string> = {
  WiFi: "#22c55e",
  "4G": "#22c55e",
  "3G": "#f59e0b",
  "2G": "#f97316",
  Slow: "#ef4444",
  Online: "#22c55e",
  Offline: "#ef4444",
};

export default function NetworkSpeed() {
  const [connType, setConnType] = useState<ConnType>("Online");

  useEffect(() => {
    setConnType(getConnectionType());
    const interval = setInterval(() => setConnType(getConnectionType()), 5000);
    const onOnline = () => setConnType(getConnectionType());
    const onOffline = () => setConnType("Offline");
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      clearInterval(interval);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const color = TYPE_COLORS[connType];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        background: "oklch(0.13 0.025 265 / 0.8)",
        border: `1px solid ${color}33`,
        borderRadius: 20,
        padding: "3px 10px",
        fontSize: "0.7rem",
        fontWeight: 600,
        fontFamily: "Plus Jakarta Sans, sans-serif",
        letterSpacing: "0.05em",
        color: color,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 6px ${color}`,
          flexShrink: 0,
        }}
      />
      {connType}
    </div>
  );
}
