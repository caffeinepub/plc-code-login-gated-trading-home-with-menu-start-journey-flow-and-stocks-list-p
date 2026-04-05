import { ArrowLeft, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  type AdminDm,
  getAdminDms,
  getCurrentUser,
  markAllDmsRead,
} from "../types/fsc";

interface MessagesProps {
  onBack: () => void;
}

const S = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(ellipse at 50% 0%, oklch(0.14 0.03 265) 0%, oklch(0.09 0.02 265) 60%)",
    color: "oklch(0.95 0.01 80)",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  } as React.CSSProperties,
  header: {
    background: "oklch(0.11 0.022 265 / 0.95)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    borderBottom: "1px solid oklch(0.78 0.18 82 / 0.18)",
    padding: "0 16px",
    height: 60,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky" as const,
    top: 0,
    zIndex: 50,
  } as React.CSSProperties,
};

export default function Messages({ onBack }: MessagesProps) {
  const user = getCurrentUser();
  const [dms, setDms] = useState<AdminDm[]>([]);

  useEffect(() => {
    if (!user) return;
    const msgs = getAdminDms(user.uniqueId);
    setDms(msgs.slice().reverse());
    markAllDmsRead(user.uniqueId);
  }, [user]);

  function formatDate(iso: string) {
    try {
      const d = new Date(iso);
      return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  }

  return (
    <div style={S.page} data-ocid="messages.page">
      <header style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              background: "transparent",
              border: "1px solid oklch(0.78 0.18 82 / 0.3)",
              borderRadius: 10,
              padding: "6px 10px",
              color: "oklch(0.78 0.18 82)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
            data-ocid="messages.close_button"
          >
            <ArrowLeft style={{ width: 16, height: 16 }} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MessageCircle
              style={{ width: 18, height: 18, color: "oklch(0.78 0.18 82)" }}
            />
            <p
              style={{
                fontSize: "1rem",
                fontWeight: 800,
                background:
                  "linear-gradient(135deg, oklch(0.90 0.18 82), oklch(0.72 0.20 75))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Messages
            </p>
          </div>
        </div>
        <span
          style={{
            fontSize: "0.7rem",
            color: "oklch(0.50 0.02 265)",
            letterSpacing: "0.05em",
          }}
        >
          From FSC Admin
        </span>
      </header>

      <main style={{ padding: "16px", maxWidth: 600, margin: "0 auto" }}>
        {dms.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 24px",
              color: "oklch(0.45 0.02 265)",
            }}
            data-ocid="messages.empty_state"
          >
            <MessageCircle
              style={{
                width: 48,
                height: 48,
                margin: "0 auto 16px",
                opacity: 0.3,
              }}
            />
            <p style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 8 }}>
              No messages yet
            </p>
            <p style={{ fontSize: "0.85rem" }}>
              Messages from the FSC admin team will appear here.
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
            data-ocid="messages.list"
          >
            {dms.map((dm, i) => (
              <div
                key={dm.id}
                style={{
                  background: "oklch(0.13 0.025 265)",
                  border: "1px solid oklch(0.78 0.18 82 / 0.2)",
                  borderRadius: 16,
                  padding: "16px",
                  position: "relative",
                }}
                data-ocid={`messages.item.${i + 1}`}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, oklch(0.90 0.18 82), oklch(0.72 0.20 75))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.65rem",
                      fontWeight: 900,
                      color: "oklch(0.1 0.02 265)",
                      flexShrink: 0,
                    }}
                  >
                    FSC
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: "oklch(0.78 0.18 82)",
                        marginBottom: 1,
                      }}
                    >
                      FSC Admin
                    </p>
                    <p
                      style={{
                        fontSize: "0.65rem",
                        color: "oklch(0.45 0.02 265)",
                      }}
                    >
                      {formatDate(dm.date)}
                    </p>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "oklch(0.82 0.01 80)",
                    lineHeight: 1.6,
                    background: "oklch(0.10 0.02 265)",
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  {dm.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
