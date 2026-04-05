import { ArrowLeft, Crown, Medal, Trophy } from "lucide-react";
import { getCurrentUser, getPayments } from "../types/fsc";

interface LeaderboardProps {
  onBack: () => void;
}

function maskName(name: string): string {
  if (name.length <= 2) return `${name}****`;
  return `${name.slice(0, 2)}****`;
}

const SEED_LEADERS = [
  { name: "Rahul S", totalInvested: 87400 },
  { name: "Priya K", totalInvested: 74200 },
  { name: "Amit V", totalInvested: 65800 },
  { name: "Sunita M", totalInvested: 52300 },
  { name: "Vijay R", totalInvested: 43100 },
  { name: "Deepa L", totalInvested: 38700 },
  { name: "Kiran B", totalInvested: 29500 },
  { name: "Neha G", totalInvested: 21200 },
  { name: "Suresh P", totalInvested: 15800 },
  { name: "Anita J", totalInvested: 9600 },
].map((e, i) => ({ ...e, rank: i + 1, isCurrentUser: false }));

const RANK_CONFIG = [
  {
    color: "oklch(0.80 0.19 82)",
    shadow: "oklch(0.80 0.19 82 / 0.35)",
    bg: "oklch(0.80 0.19 82 / 0.12)",
    label: "oklch(0.95 0.14 92)",
  },
  {
    color: "oklch(0.78 0.05 265)",
    shadow: "oklch(0.78 0.05 265 / 0.25)",
    bg: "oklch(0.78 0.05 265 / 0.10)",
    label: "oklch(0.88 0.03 265)",
  },
  {
    color: "oklch(0.65 0.13 55)",
    shadow: "oklch(0.65 0.13 55 / 0.28)",
    bg: "oklch(0.65 0.13 55 / 0.10)",
    label: "oklch(0.80 0.10 55)",
  },
];
const RANK_ICONS = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];

export default function Leaderboard({ onBack }: LeaderboardProps) {
  const user = getCurrentUser();
  const allPayments = getPayments();
  const myApproved = user
    ? allPayments.filter(
        (p) => p.userId === user.uniqueId && p.status === "approved",
      )
    : [];
  const myTotal = myApproved.reduce((s, p) => s + p.amount, 0);

  const allEntries = [
    ...SEED_LEADERS,
    {
      name: user?.name ?? "You",
      totalInvested: myTotal,
      rank: 0,
      isCurrentUser: true,
    },
  ]
    .sort((a, b) => b.totalInvested - a.totalInvested)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  const userEntry = allEntries.find((e) => e.isCurrentUser);
  const top10 = allEntries.slice(0, 10);

  return (
    <div className="page-wrapper bg-grid-pattern">
      <header className="glass-header sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="btn-glass rounded-xl p-2"
            data-ocid="leaderboard.back.button"
          >
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <Trophy
            style={{ width: 18, height: 18, color: "oklch(0.78 0.18 82)" }}
          />
          <h1 className="font-display font-bold text-foreground text-lg">
            Leaderboard
          </h1>
        </div>
      </header>

      <main className="px-4 pt-5 pb-8">
        {/* Podium — top 3 */}
        <div className="animate-scale-in mb-6">
          <div className="section-label">
            <Crown style={{ width: 11, height: 11 }} />
            Top Investors
          </div>
          <div className="flex items-end justify-center gap-3">
            {[1, 0, 2].map((i) => {
              const entry = top10[i];
              if (!entry) return null;
              const rc = RANK_CONFIG[i];
              const isFirst = i === 0;
              const podiumH = isFirst ? 64 : i === 1 ? 44 : 30;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center"
                  style={{ flex: isFirst ? "0 0 36%" : "0 0 30%" }}
                >
                  {/* Medal emoji */}
                  <span style={{ fontSize: isFirst ? "2.4rem" : "1.8rem" }}>
                    {RANK_ICONS[i]}
                  </span>

                  {/* Name card */}
                  <div
                    className="card-premium w-full text-center py-2.5 px-2 mt-2"
                    style={{
                      background: rc.bg,
                      borderColor: `${rc.color}44`,
                      boxShadow: `0 4px 20px ${rc.shadow}`,
                    }}
                  >
                    <p
                      className="font-bold text-sm"
                      style={{ color: rc.label }}
                    >
                      {maskName(entry.name)}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(0.50 0.02 265)" }}
                    >
                      ₹{entry.totalInvested.toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* Podium column */}
                  <div
                    className="w-full rounded-t-lg mt-1"
                    style={{
                      height: podiumH,
                      background: `linear-gradient(180deg, ${rc.color}44 0%, ${rc.color}11 100%)`,
                      border: `1px solid ${rc.color}33`,
                      borderBottom: "none",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Full list */}
        <div className="section-label">Full Rankings</div>
        <div
          className="space-y-2 animate-fade-in-up"
          data-ocid="leaderboard.list"
        >
          {top10.map((entry, entryIdx) => {
            const rc = entryIdx < 3 ? RANK_CONFIG[entryIdx] : null;
            return (
              <div
                key={entry.name}
                className="card-premium flex items-center gap-3 px-4 py-3"
                style={{
                  background: entry.isCurrentUser
                    ? "oklch(0.78 0.18 82 / 0.07)"
                    : "oklch(0.13 0.025 265)",
                  borderColor: entry.isCurrentUser
                    ? "oklch(0.78 0.18 82 / 0.35)"
                    : "oklch(0.22 0.035 265)",
                }}
                data-ocid={`leaderboard.item.${entryIdx + 1}`}
              >
                {/* Rank badge */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{
                    background: rc ? rc.bg : "oklch(0.17 0.03 265)",
                    color: rc ? rc.color : "oklch(0.55 0.02 265)",
                  }}
                >
                  {entryIdx < 3 ? (
                    <Medal style={{ width: 14, height: 14 }} />
                  ) : (
                    entry.rank
                  )}
                </div>

                {/* Name */}
                <div className="flex-1">
                  <p className="font-semibold text-sm text-foreground">
                    {entry.isCurrentUser
                      ? `${maskName(entry.name)} \u2014 You`
                      : maskName(entry.name)}
                  </p>
                  {entry.isCurrentUser && (
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.78 0.18 82)" }}
                    >
                      Rank #{entry.rank}
                    </p>
                  )}
                </div>

                {/* Amount */}
                <p
                  className="font-bold text-sm"
                  style={{ color: rc ? rc.label : "oklch(0.72 0.01 80)" }}
                >
                  ₹{entry.totalInvested.toLocaleString("en-IN")}
                </p>
              </div>
            );
          })}
        </div>

        {/* User rank card when outside top 10 */}
        {userEntry && userEntry.rank > 10 && (
          <div
            className="card-premium mt-4 px-4 py-3"
            style={{
              background: "oklch(0.78 0.18 82 / 0.07)",
              borderColor: "oklch(0.78 0.18 82 / 0.3)",
            }}
            data-ocid="leaderboard.your_rank.panel"
          >
            <p
              className="text-xs mb-1"
              style={{ color: "oklch(0.5 0.02 265)" }}
            >
              Your Rank
            </p>
            <div className="flex items-center justify-between">
              <p className="font-bold text-primary">
                #{userEntry.rank} \u2014 {maskName(userEntry.name)} (You)
              </p>
              <p className="font-bold text-sm text-foreground">
                ₹{userEntry.totalInvested.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
