import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Award, CheckCircle2, Lock } from "lucide-react";
import {
  getCurrentUser,
  getKycData,
  getPayments,
  getReferralData,
  getWithdrawals,
} from "../types/fsc";

interface AchievementsProps {
  onBack: () => void;
}

export default function Achievements({ onBack }: AchievementsProps) {
  const user = getCurrentUser();
  const payments = getPayments().filter(
    (p) => p.userId === user?.uniqueId && p.status === "approved",
  );
  const withdrawals = getWithdrawals().filter(
    (w) => w.userId === user?.uniqueId,
  );
  const kyc = user ? getKycData(user.uniqueId) : null;
  const referral = user ? getReferralData(user.uniqueId) : null;
  const totalInvested = payments.reduce((s, p) => s + p.amount, 0);
  const spinCount =
    Number(localStorage.getItem(`fsc_spin_count_${user?.uniqueId}`)) || 0;

  const ACHIEVEMENTS = [
    {
      id: "first-deposit",
      icon: "\uD83C\uDF1F",
      title: "First Deposit",
      description: "Make your first deposit",
      unlocked: payments.length > 0,
      progress: { current: Math.min(payments.length, 1), total: 1 },
    },
    {
      id: "social-starter",
      icon: "\uD83D\uDC65",
      title: "Social Starter",
      description: "Refer 5 friends",
      unlocked: (referral?.referredFriends?.length ?? 0) >= 5,
      progress: {
        current: Math.min(referral?.referredFriends?.length ?? 0, 5),
        total: 5,
      },
    },
    {
      id: "big-investor",
      icon: "\uD83D\uDCB0",
      title: "Big Investor",
      description: "Invest \u20B910,000 total",
      unlocked: totalInvested >= 10000,
      progress: { current: Math.min(totalInvested, 10000), total: 10000 },
      formatProgress: (c: number, t: number) =>
        `\u20B9${c.toLocaleString("en-IN")} / \u20B9${t.toLocaleString("en-IN")}`,
    },
    {
      id: "spin-master",
      icon: "\uD83C\uDFB0",
      title: "Spin Master",
      description: "Spin the wheel 10 times",
      unlocked: spinCount >= 10,
      progress: { current: Math.min(spinCount, 10), total: 10 },
    },
    {
      id: "first-withdrawal",
      icon: "\uD83D\uDCB8",
      title: "First Withdrawal",
      description: "Complete your first withdrawal",
      unlocked: withdrawals.length > 0,
      progress: { current: Math.min(withdrawals.length, 1), total: 1 },
    },
    {
      id: "profile-complete",
      icon: "\uD83D\uDC64",
      title: "Profile Complete",
      description: "Fill all profile details",
      unlocked: !!(
        user?.name &&
        user?.phone &&
        user?.profilePic &&
        user?.upiId
      ),
      progress: {
        current: [
          user?.name,
          user?.phone,
          user?.profilePic,
          user?.upiId,
        ].filter(Boolean).length,
        total: 4,
      },
    },
    {
      id: "kyc-verified",
      icon: "\u2705",
      title: "KYC Verified",
      description: "Complete KYC verification",
      unlocked: kyc?.status === "verified",
      progress: { current: kyc ? 1 : 0, total: 1 },
    },
  ];

  const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlocked).length;

  return (
    <div className="page-wrapper bg-grid-pattern">
      <header className="glass-header sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="btn-glass rounded-xl p-2"
            data-ocid="achievements.back.button"
          >
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <Award
            style={{ width: 18, height: 18, color: "oklch(0.78 0.18 82)" }}
          />
          <h1 className="font-display font-bold text-foreground text-lg">
            Achievements
          </h1>
          <span className="ml-auto badge-pill badge-pill-gold">
            {unlockedCount} / {ACHIEVEMENTS.length}
          </span>
        </div>
      </header>

      <main className="px-4 pt-5 pb-8">
        {/* Overall progress */}
        <div className="card-premium p-4 mb-5 animate-scale-in">
          <div className="flex justify-between items-center text-sm mb-2.5">
            <span style={{ color: "oklch(0.55 0.02 265)" }}>
              Overall Progress
            </span>
            <span className="font-bold text-primary">
              {unlockedCount} / {ACHIEVEMENTS.length} Unlocked
            </span>
          </div>
          <Progress
            value={(unlockedCount / ACHIEVEMENTS.length) * 100}
            className="h-2.5 rounded-full"
          />
        </div>

        <div className="section-label">Badges</div>

        <div className="grid grid-cols-1 gap-3" data-ocid="achievements.list">
          {ACHIEVEMENTS.map((ach, idx) => (
            <div
              key={ach.id}
              className="card-premium animate-fade-in-up p-4"
              style={{
                animationDelay: `${idx * 0.055}s`,
                opacity: 0,
                animationFillMode: "forwards",
                background: ach.unlocked
                  ? "oklch(0.78 0.18 82 / 0.05)"
                  : "oklch(0.13 0.025 265)",
                borderColor: ach.unlocked
                  ? "oklch(0.78 0.18 82 / 0.28)"
                  : "oklch(0.22 0.035 265)",
                boxShadow: ach.unlocked
                  ? "0 4px 24px oklch(0.78 0.18 82 / 0.1)"
                  : "none",
              }}
              data-ocid={`achievements.item.${idx + 1}`}
            >
              <div className="flex items-start gap-3.5">
                {/* Icon badge */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 relative"
                  style={{
                    background: ach.unlocked
                      ? "oklch(0.78 0.18 82 / 0.14)"
                      : "oklch(0.16 0.03 265)",
                    border: `1px solid ${ach.unlocked ? "oklch(0.78 0.18 82 / 0.35)" : "oklch(0.22 0.035 265)"}`,
                    boxShadow: ach.unlocked
                      ? "0 0 18px oklch(0.78 0.18 82 / 0.25)"
                      : "none",
                    filter: ach.unlocked
                      ? "none"
                      : "grayscale(0.8) opacity(0.5)",
                  }}
                >
                  {ach.unlocked ? (
                    ach.icon
                  ) : (
                    <Lock
                      style={{
                        width: 15,
                        height: 15,
                        color: "oklch(0.4 0.02 265)",
                      }}
                    />
                  )}
                  {ach.unlocked && (
                    <CheckCircle2
                      style={{
                        width: 14,
                        height: 14,
                        color: "oklch(0.65 0.2 145)",
                        position: "absolute",
                        bottom: -4,
                        right: -4,
                        background: "oklch(0.13 0.025 265)",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground mb-0.5">
                    {ach.title}
                  </p>
                  <p
                    className="text-xs mb-2"
                    style={{ color: "oklch(0.50 0.02 265)" }}
                  >
                    {ach.description}
                  </p>
                  {ach.progress && (
                    <>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: "oklch(0.48 0.02 265)" }}>
                          {"formatProgress" in ach &&
                          typeof ach.formatProgress === "function"
                            ? ach.formatProgress(
                                ach.progress.current,
                                ach.progress.total,
                              )
                            : `${ach.progress.current} / ${ach.progress.total}`}
                        </span>
                        <span
                          style={{
                            color: ach.unlocked
                              ? "oklch(0.65 0.2 145)"
                              : "oklch(0.50 0.02 265)",
                            fontWeight: 600,
                          }}
                        >
                          {Math.round(
                            (ach.progress.current / ach.progress.total) * 100,
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          (ach.progress.current / ach.progress.total) * 100
                        }
                        className="h-1.5 rounded-full"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
