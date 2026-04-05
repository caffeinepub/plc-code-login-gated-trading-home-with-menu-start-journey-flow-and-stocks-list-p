import { ArrowLeft, BookOpen, Monitor, Smartphone } from "lucide-react";
import { getCurrentUser, getLoginActivity } from "../types/fsc";

interface LoginActivityProps {
  onBack: () => void;
}

export default function LoginActivity({ onBack }: LoginActivityProps) {
  const user = getCurrentUser();
  const activities = user ? getLoginActivity(user.uniqueId) : [];

  return (
    <div className="page-wrapper bg-grid-pattern">
      <header className="glass-header sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="btn-glass rounded-xl p-2"
            data-ocid="activity.back.button"
          >
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <BookOpen
            style={{ width: 20, height: 20, color: "oklch(0.78 0.18 82)" }}
          />
          <h1 className="font-display font-bold text-foreground text-lg">
            Login Activity
          </h1>
        </div>
      </header>

      <main className="px-4 pt-5 pb-8">
        {/* Info Banner */}
        <div
          className="animate-scale-in rounded-2xl p-3 mb-5 flex items-center gap-3"
          style={{
            background: "oklch(0.65 0.2 145 / 0.08)",
            border: "1px solid oklch(0.65 0.2 145 / 0.25)",
          }}
        >
          <BookOpen
            style={{
              width: 18,
              height: 18,
              color: "oklch(0.65 0.2 145)",
              flexShrink: 0,
            }}
          />
          <p className="text-xs text-muted-foreground">
            Last <strong>10 login sessions</strong> are shown. If you see
            unfamiliar activity, contact support immediately.
          </p>
        </div>

        {activities.length === 0 ? (
          <div
            className="text-center py-12 animate-fade-in"
            style={{
              background: "oklch(0.13 0.025 265)",
              border: "1px dashed oklch(0.25 0.04 265)",
              borderRadius: 16,
            }}
            data-ocid="activity.empty_state"
          >
            <BookOpen
              style={{
                width: 40,
                height: 40,
                color: "oklch(0.35 0.02 265)",
                margin: "0 auto 10px",
              }}
            />
            <p className="text-muted-foreground">
              No login activity recorded yet.
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Activity is recorded on each login.
            </p>
          </div>
        ) : (
          <div
            className="space-y-3 animate-fade-in-up"
            data-ocid="activity.list"
          >
            {activities.map((act, actIdx) => (
              <div
                key={`${act.date}-${act.time}-${actIdx}`}
                className="rounded-xl p-4 flex items-start gap-3"
                style={{
                  background:
                    actIdx === 0
                      ? "oklch(0.78 0.18 82 / 0.06)"
                      : "oklch(0.13 0.025 265)",
                  border: `1px solid ${
                    actIdx === 0
                      ? "oklch(0.78 0.18 82 / 0.25)"
                      : "oklch(0.22 0.035 265)"
                  }`,
                }}
                data-ocid={`activity.item.${actIdx + 1}`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      actIdx === 0
                        ? "oklch(0.78 0.18 82 / 0.12)"
                        : "oklch(0.16 0.03 265)",
                  }}
                >
                  {act.device.includes("Desktop") ? (
                    <Monitor
                      style={{
                        width: 18,
                        height: 18,
                        color:
                          actIdx === 0
                            ? "oklch(0.78 0.18 82)"
                            : "oklch(0.55 0.02 265)",
                      }}
                    />
                  ) : (
                    <Smartphone
                      style={{
                        width: 18,
                        height: 18,
                        color:
                          actIdx === 0
                            ? "oklch(0.78 0.18 82)"
                            : "oklch(0.55 0.02 265)",
                      }}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-semibold text-sm text-foreground">
                      {act.device}
                    </p>
                    {actIdx === 0 && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{
                          background: "oklch(0.65 0.2 145 / 0.15)",
                          color: "oklch(0.65 0.2 145)",
                        }}
                      >
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {act.date} at {act.time}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    \uD83D\uDCCD {act.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
