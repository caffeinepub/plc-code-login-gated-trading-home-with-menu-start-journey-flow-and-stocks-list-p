import { ArrowLeft, Headphones, Plus, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { backendSubmitTicket } from "../lib/backendStore";
import {
  type SupportTicketLocal,
  getCurrentUser,
  getSupportTickets,
  saveSupportTickets,
} from "../types/fsc";

interface SupportProps {
  onBack: () => void;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
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

export default function Support({ onBack }: SupportProps) {
  const user = getCurrentUser();
  const [tickets, setTickets] = useState<SupportTicketLocal[]>(() =>
    user ? getSupportTickets(user.uniqueId) : [],
  );
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim() || !user) return;
    setSubmitting(true);

    const newTicket: SupportTicketLocal = {
      id: Date.now().toString(),
      subject: subject.trim(),
      message: message.trim(),
      status: "open",
      date: new Date().toISOString(),
      userId: user.uniqueId,
    };

    setTimeout(() => {
      const updated = [newTicket, ...tickets];
      setTickets(updated);
      saveSupportTickets(user.uniqueId, updated);
      backendSubmitTicket(newTicket).catch(() => {});
      setSubject("");
      setMessage("");
      setShowForm(false);
      setSubmitting(false);
      toast.success("Ticket submitted! We'll respond within 24 hours.");
    }, 600);
  }

  const inputStyle = {
    width: "100%",
    background: "oklch(0.09 0.02 265)",
    border: "1px solid oklch(0.78 0.18 82 / 0.2)",
    borderRadius: 10,
    padding: "12px 14px",
    color: "oklch(0.90 0.01 80)",
    fontFamily: "Plus Jakarta Sans, sans-serif",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box" as const,
  };

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
          <div style={{ flex: 1 }}>
            <p
              className="font-display font-bold text-primary"
              style={{ fontSize: "1.1rem" }}
            >
              Support Center
            </p>
            <p
              className="font-sans text-muted-foreground"
              style={{ fontSize: "0.7rem" }}
            >
              We're here to help
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="btn-gold font-sans font-bold rounded-xl px-4 py-2 text-xs"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            New Ticket
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-xl">
        {/* New ticket form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{
              background: "oklch(0.13 0.03 265)",
              border: "1px solid oklch(0.78 0.18 82 / 0.2)",
              borderRadius: 16,
              padding: "20px",
              marginBottom: 20,
            }}
          >
            <p
              className="font-display font-bold"
              style={{
                fontSize: "1rem",
                color: "oklch(0.88 0.01 80)",
                marginBottom: 14,
              }}
            >
              New Support Ticket
            </p>
            <div style={{ marginBottom: 12 }}>
              <label
                htmlFor="support-subject"
                className="font-sans"
                style={{
                  fontSize: "0.75rem",
                  color: "oklch(0.55 0.02 265)",
                  display: "block",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Subject
              </label>
              <input
                id="support-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                required
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="support-message"
                className="font-sans"
                style={{
                  fontSize: "0.75rem",
                  color: "oklch(0.55 0.02 265)",
                  display: "block",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Message
              </label>
              <textarea
                id="support-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                required
                rows={4}
                style={{ ...inputStyle, resize: "none" }}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: 10,
                  background: "transparent",
                  border: "1px solid oklch(0.78 0.18 82 / 0.2)",
                  color: "oklch(0.55 0.02 265)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-gold font-sans font-bold rounded-xl text-sm"
                style={{
                  flex: 2,
                  padding: "11px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Send style={{ width: 14, height: 14 }} />
                {submitting ? "Submitting..." : "Submit Ticket"}
              </button>
            </div>
          </form>
        )}

        {/* Tickets list */}
        {tickets.length === 0 && !showForm ? (
          <div
            style={{
              background: "oklch(0.13 0.03 265)",
              border: "1px solid oklch(0.78 0.18 82 / 0.1)",
              borderRadius: 16,
              padding: "48px 20px",
              textAlign: "center",
            }}
          >
            <Headphones
              style={{
                width: 44,
                height: 44,
                margin: "0 auto 16px",
                opacity: 0.25,
                color: "oklch(0.78 0.18 82)",
              }}
            />
            <p
              className="font-display font-semibold"
              style={{
                fontSize: "1.1rem",
                color: "oklch(0.70 0.02 265)",
                marginBottom: 8,
              }}
            >
              No Support Tickets
            </p>
            <p className="font-sans text-muted-foreground text-sm">
              Click "New Ticket" to contact our support team.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                style={{
                  background: "oklch(0.13 0.03 265)",
                  border: "1px solid oklch(0.78 0.18 82 / 0.12)",
                  borderRadius: 14,
                  padding: "18px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    background:
                      ticket.status === "open" ? "#f59e0b" : "#22c55e",
                    borderRadius: "14px 0 0 14px",
                  }}
                />
                <div
                  style={{
                    paddingLeft: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <p
                    className="font-sans font-semibold"
                    style={{ fontSize: "0.9rem", color: "oklch(0.88 0.01 80)" }}
                  >
                    {ticket.subject}
                  </p>
                  <span
                    style={{
                      fontSize: "0.62rem",
                      background:
                        ticket.status === "open"
                          ? "oklch(0.70 0.18 82 / 0.12)"
                          : "oklch(0.65 0.20 145 / 0.12)",
                      color: ticket.status === "open" ? "#f59e0b" : "#22c55e",
                      border: `1px solid ${
                        ticket.status === "open"
                          ? "oklch(0.70 0.18 82 / 0.3)"
                          : "oklch(0.65 0.20 145 / 0.3)"
                      }`,
                      borderRadius: 4,
                      padding: "3px 8px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      flexShrink: 0,
                      marginLeft: 8,
                    }}
                  >
                    {ticket.status === "open" ? "Open" : "Resolved"}
                  </span>
                </div>
                <p
                  className="font-sans"
                  style={{
                    paddingLeft: 10,
                    fontSize: "0.78rem",
                    color: "oklch(0.55 0.02 265)",
                    lineHeight: 1.5,
                    marginBottom: 8,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {ticket.message}
                </p>
                <p
                  className="font-sans"
                  style={{
                    paddingLeft: 10,
                    fontSize: "0.65rem",
                    color: "oklch(0.45 0.02 265)",
                  }}
                >
                  {formatDate(ticket.date)}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border/50 py-7">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>\u00a9 {new Date().getFullYear()} FSC Foreign Smart Coins.</p>
        </div>
      </footer>
    </div>
  );
}
