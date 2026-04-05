import {
  AlertCircle,
  ArrowLeftRight,
  BarChart2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileText,
  Headphones,
  Lock,
  LogOut,
  MessageSquare,
  Send,
  Shield,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  type AdminKyc,
  type AdminPayment,
  type AdminTicket,
  type AdminUser,
  type AdminWithdrawal,
  backendApprovePayment as backendApprovePaymentFn,
  backendGetAllKyc,
  backendGetAllPayments,
  backendGetAllTickets,
  backendGetAllUsers,
  backendGetAllWithdrawals,
  backendRejectPayment as backendRejectPaymentFn,
  backendUpdateWithdrawal as backendUpdateWithdrawalFn,
} from "../lib/backendStore";
import {
  ADMIN_PIN,
  type Broadcast,
  type FscUser,
  type KycData,
  type PaymentSubmission,
  type SupportTicketLocal,
  type WithdrawalRequest,
  adminAdjustBalance,
  adminApproveKyc,
  adminApprovePayment,
  adminCloseTicket,
  adminRejectKyc,
  adminRejectPayment,
  adminSuspendUser,
  adminUnsuspendUser,
  adminUpdateUpi,
  adminUpdateWithdrawal,
  formatInr,
  getAllKycAdmin,
  getAllPaymentsAdmin,
  getAllTicketsAdmin,
  getAllUsers,
  getAllWithdrawalsAdmin,
  getBroadcasts,
  getVipTier,
  getVipTierLabel,
  isMaintenanceMode,
  saveBroadcasts,
  setMaintenanceMode,
} from "../types/fsc";

interface AdminPanelProps {
  onBack: () => void;
}

type AdminTab =
  | "dashboard"
  | "payments"
  | "withdrawals"
  | "users"
  | "tickets"
  | "kyc"
  | "transactions"
  | "messages";

const TABS: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: BarChart2 },
  { id: "payments", label: "Payments", icon: FileText },
  { id: "withdrawals", label: "Withdrawals", icon: Wallet },
  { id: "users", label: "Users", icon: Users },
  { id: "tickets", label: "Tickets", icon: Headphones },
  { id: "kyc", label: "KYC", icon: ClipboardList },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { id: "messages", label: "Messages", icon: MessageSquare },
];

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
  card: {
    background: "oklch(0.13 0.025 265)",
    border: "1px solid oklch(0.78 0.18 82 / 0.15)",
    borderRadius: 16,
    padding: "16px",
  } as React.CSSProperties,
  input: {
    background: "oklch(0.18 0.03 265)",
    border: "1px solid oklch(0.28 0.04 265)",
    borderRadius: 10,
    padding: "10px 14px",
    color: "oklch(0.95 0.01 80)",
    fontSize: "0.875rem",
    outline: "none",
    width: "100%",
  } as React.CSSProperties,
  btnGold: {
    background:
      "linear-gradient(135deg, oklch(0.87 0.17 87), oklch(0.73 0.21 73))",
    color: "oklch(0.12 0.03 265)",
    fontWeight: 700,
    fontSize: "0.8rem",
    padding: "7px 14px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    letterSpacing: "0.03em",
  } as React.CSSProperties,
  btnGreen: {
    background: "oklch(0.65 0.2 145 / 0.15)",
    color: "oklch(0.75 0.18 145)",
    border: "1px solid oklch(0.65 0.2 145 / 0.35)",
    fontWeight: 700,
    fontSize: "0.75rem",
    padding: "6px 12px",
    borderRadius: 8,
    cursor: "pointer",
  } as React.CSSProperties,
  btnRed: {
    background: "oklch(0.65 0.22 22 / 0.15)",
    color: "oklch(0.72 0.2 22)",
    border: "1px solid oklch(0.65 0.22 22 / 0.35)",
    fontWeight: 700,
    fontSize: "0.75rem",
    padding: "6px 12px",
    borderRadius: 8,
    cursor: "pointer",
  } as React.CSSProperties,
};

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { color: string; bg: string; border: string }> =
    {
      pending: {
        color: "oklch(0.80 0.16 65)",
        bg: "oklch(0.70 0.18 65 / 0.12)",
        border: "oklch(0.70 0.18 65 / 0.35)",
      },
      approved: {
        color: "oklch(0.75 0.18 145)",
        bg: "oklch(0.65 0.2 145 / 0.12)",
        border: "oklch(0.65 0.2 145 / 0.35)",
      },
      verified: {
        color: "oklch(0.75 0.18 145)",
        bg: "oklch(0.65 0.2 145 / 0.12)",
        border: "oklch(0.65 0.2 145 / 0.35)",
      },
      rejected: {
        color: "oklch(0.72 0.2 22)",
        bg: "oklch(0.65 0.22 22 / 0.12)",
        border: "oklch(0.65 0.22 22 / 0.35)",
      },
      open: {
        color: "oklch(0.80 0.16 65)",
        bg: "oklch(0.70 0.18 65 / 0.12)",
        border: "oklch(0.70 0.18 65 / 0.35)",
      },
      resolved: {
        color: "oklch(0.75 0.18 145)",
        bg: "oklch(0.65 0.2 145 / 0.12)",
        border: "oklch(0.65 0.2 145 / 0.35)",
      },
    };
  const c = configs[status] ?? configs.pending;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: "0.68rem",
        fontWeight: 700,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
      }}
    >
      {status}
    </span>
  );
}

function EmptyState({
  icon: Icon,
  message,
}: { icon: React.ElementType; message: string }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "48px 20px",
        color: "oklch(0.45 0.02 265)",
      }}
    >
      <Icon
        style={{
          width: 40,
          height: 40,
          margin: "0 auto 12px",
          opacity: 0.4,
        }}
      />
      <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>{message}</p>
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab({ refreshKey }: { refreshKey: number }) {
  const [maintenance, setMaintenanceState] = useState(isMaintenanceMode());
  const [backendUserCount, setBackendUserCount] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey is intentional re-fetch trigger
  useEffect(() => {
    backendGetAllUsers()
      .then((bu) => setBackendUserCount(bu.length))
      .catch(() => {});
  }, [refreshKey]);

  const users = getAllUsers();
  const payments = getAllPaymentsAdmin();
  const withdrawals = getAllWithdrawalsAdmin();
  const pendingPayments = payments.filter((p) => p.status === "pending").length;
  const totalBalance = users.reduce((s, u) => s + (u.balance || 0), 0);
  const totalUserCount = Math.max(users.length, backendUserCount);

  const recentActivity = [
    ...payments.slice(-5).map((p) => ({ ...p, type: "payment" as const })),
    ...withdrawals
      .slice(-5)
      .map((w) => ({ ...w, type: "withdrawal" as const })),
  ]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 8);

  const stats = [
    {
      label: "Total Users",
      value: totalUserCount,
      icon: Users,
      color: "oklch(0.78 0.18 82)",
    },
    {
      label: "Total Payments",
      value: `${payments.length}`,
      sub: `${pendingPayments} pending`,
      icon: FileText,
      color: "oklch(0.75 0.18 145)",
    },
    {
      label: "Withdrawals",
      value: withdrawals.length,
      icon: Wallet,
      color: "oklch(0.72 0.2 22)",
    },
    {
      label: "Balance in Circulation",
      value: formatInr(totalBalance),
      icon: BarChart2,
      color: "oklch(0.75 0.16 290)",
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {stats.map((s) => (
          <div key={s.label} style={{ ...S.card, padding: "14px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: `${s.color}22`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <s.icon style={{ width: 16, height: 16, color: s.color }} />
              </div>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "oklch(0.55 0.02 265)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {s.label}
              </span>
            </div>
            <p
              style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                color: s.color,
                lineHeight: 1,
                marginBottom: 2,
              }}
            >
              {s.value}
            </p>
            {s.sub && (
              <p
                style={{
                  fontSize: "0.7rem",
                  color: "oklch(0.55 0.02 265)",
                }}
              >
                {s.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Maintenance Mode Toggle */}
      <div
        style={{
          background: maintenance
            ? "oklch(0.20 0.06 25 / 0.6)"
            : "oklch(0.14 0.03 265)",
          border: maintenance
            ? "1px solid oklch(0.55 0.18 25)"
            : "1px solid oklch(0.78 0.18 82 / 0.4)",
          borderRadius: 14,
          padding: "16px 18px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              color: maintenance ? "oklch(0.72 0.2 22)" : "oklch(0.78 0.18 82)",
              marginBottom: 3,
            }}
          >
            🔧 Maintenance Mode
          </p>
          <p style={{ fontSize: "0.72rem", color: "oklch(0.50 0.04 265)" }}>
            {maintenance
              ? "All users are blocked from accessing the app"
              : "App is live and accessible to all users"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            const next = !maintenance;
            setMaintenanceMode(next);
            setMaintenanceState(next);
          }}
          style={{
            background: maintenance
              ? "linear-gradient(135deg, oklch(0.72 0.2 22), oklch(0.65 0.18 35))"
              : "linear-gradient(135deg, oklch(0.78 0.18 82), oklch(0.65 0.20 75))",
            color: "oklch(0.10 0.02 265)",
            border: "none",
            borderRadius: 10,
            padding: "10px 18px",
            fontSize: "0.8rem",
            fontWeight: 800,
            cursor: "pointer",
            whiteSpace: "nowrap",
            letterSpacing: "0.03em",
          }}
        >
          {maintenance ? "Turn OFF" : "Turn ON"}
        </button>
      </div>

      <p
        style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "oklch(0.55 0.02 265)",
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        Recent Activity
        <span
          style={{
            flex: 1,
            height: 1,
            background:
              "linear-gradient(90deg, oklch(0.78 0.18 82 / 0.25), transparent 80%)",
          }}
        />
      </p>
      {recentActivity.length === 0 ? (
        <EmptyState icon={AlertCircle} message="No recent activity" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {recentActivity.map((item) => {
            const isPayment = item.type === "payment";
            return (
              <div
                key={item.id}
                style={{
                  ...S.card,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: isPayment
                        ? "oklch(0.75 0.18 145 / 0.15)"
                        : "oklch(0.72 0.2 22 / 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isPayment ? (
                      <FileText
                        style={{
                          width: 13,
                          height: 13,
                          color: "oklch(0.75 0.18 145)",
                        }}
                      />
                    ) : (
                      <Wallet
                        style={{
                          width: 13,
                          height: 13,
                          color: "oklch(0.72 0.2 22)",
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "oklch(0.85 0.01 80)",
                      }}
                    >
                      {isPayment
                        ? (item as PaymentSubmission).userName
                        : (item as WithdrawalRequest).upiName}
                    </p>
                    <p
                      style={{
                        fontSize: "0.68rem",
                        color: "oklch(0.50 0.02 265)",
                      }}
                    >
                      {item.date}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: isPayment
                        ? "oklch(0.75 0.18 145)"
                        : "oklch(0.72 0.2 22)",
                    }}
                  >
                    {formatInr(item.amount)}
                  </p>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Payments Tab ────────────────────────────────────────────────────────────
function PaymentsTab({
  refreshKey,
  onRefresh,
}: {
  refreshKey: number;
  onRefresh: () => void;
}) {
  const _ = refreshKey;
  const [backendPayments, setBackendPayments] = useState<AdminPayment[]>([]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey is intentional re-fetch trigger
  useEffect(() => {
    backendGetAllPayments()
      .then(setBackendPayments)
      .catch(() => {});
  }, [refreshKey]);

  // Merge: localStorage payments first, then backend-only payments not in localStorage
  const localPayments = getAllPaymentsAdmin();
  const localUtrSet = new Set(localPayments.map((p) => p.utr));
  const backendOnlyPayments = backendPayments.filter(
    (bp) => !localUtrSet.has(bp.utr),
  );

  // Convert backend-only payments to local format for display
  const backendAsLocal: PaymentSubmission[] = backendOnlyPayments.map(
    (bp) =>
      ({
        id: `backend_${bp.principalStr}_${bp.utr}`,
        userId: bp.principalStr.slice(0, 8),
        userName: `User (${bp.principalStr.slice(0, 8)}...)`,
        amount: bp.amount,
        method: bp.method,
        utr: bp.utr,
        screenshot: bp.screenshotBlobId,
        status: bp.status,
        date: new Date(Number(bp.timestamp / BigInt(1000000))).toLocaleString(
          "en-IN",
        ),
        _principalStr: bp.principalStr,
      }) as PaymentSubmission & { _principalStr: string },
  );

  const payments = [...localPayments, ...backendAsLocal].sort((a, b) =>
    a.date < b.date ? 1 : -1,
  );

  function handleApprove(id: string) {
    adminApprovePayment(id);
    // Also sync to backend for backend-only payments
    const p = payments.find((x) => x.id === id) as
      | (PaymentSubmission & { _principalStr?: string })
      | undefined;
    if (p?._principalStr) {
      backendApprovePaymentFn(p._principalStr, p.utr).catch(() => {});
    }
    onRefresh();
  }
  function handleReject(id: string) {
    adminRejectPayment(id);
    const p = payments.find((x) => x.id === id) as
      | (PaymentSubmission & { _principalStr?: string })
      | undefined;
    if (p?._principalStr) {
      backendRejectPaymentFn(p._principalStr, p.utr).catch(() => {});
    }
    onRefresh();
  }

  if (payments.length === 0)
    return <EmptyState icon={FileText} message="No payment submissions yet" />;

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 10 }}
      data-ocid="admin.payments.list"
    >
      {payments.map((p, i) => (
        <div
          key={p.id}
          style={S.card}
          data-ocid={`admin.payments.item.${i + 1}`}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 10,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "oklch(0.90 0.01 80)",
                  marginBottom: 2,
                }}
              >
                {p.userName}
              </p>
              <p
                style={{
                  fontSize: "0.7rem",
                  color: "oklch(0.50 0.02 265)",
                }}
              >
                {p.method} · {p.date}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  background:
                    "linear-gradient(135deg, oklch(0.90 0.18 82), oklch(0.72 0.20 75))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: 4,
                }}
              >
                {formatInr(p.amount)}
              </p>
              <StatusBadge status={p.status} />
            </div>
          </div>
          <div
            style={{
              background: "oklch(0.09 0.02 265)",
              borderRadius: 8,
              padding: "8px 12px",
              marginBottom: p.status === "pending" ? 10 : 0,
            }}
          >
            <p
              style={{
                fontSize: "0.65rem",
                color: "oklch(0.45 0.02 265)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 2,
              }}
            >
              UTR
            </p>
            <p
              style={{
                fontSize: "0.82rem",
                color: "oklch(0.72 0.02 265)",
                fontFamily: "monospace",
              }}
            >
              {p.utr}
            </p>
          </div>
          {p.screenshot && (
            <div style={{ marginBottom: 10 }}>
              <p
                style={{
                  fontSize: "0.65rem",
                  color: "oklch(0.45 0.02 265)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 6,
                }}
              >
                Payment Screenshot
              </p>
              <a
                href={p.screenshot}
                target="_blank"
                rel="noreferrer"
                style={{ display: "block" }}
              >
                <img
                  src={p.screenshot}
                  alt="Payment screenshot"
                  style={{
                    width: "100%",
                    maxHeight: 220,
                    objectFit: "contain",
                    borderRadius: 8,
                    border: "1px solid oklch(0.22 0.03 265)",
                    background: "oklch(0.09 0.02 265)",
                  }}
                />
              </a>
              <p
                style={{
                  fontSize: "0.6rem",
                  color: "oklch(0.40 0.02 265)",
                  marginTop: 4,
                  textAlign: "center",
                }}
              >
                Tap to view full size
              </p>
            </div>
          )}
          {p.status === "pending" && (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                style={{ ...S.btnGreen, flex: 1 }}
                onClick={() => handleApprove(p.id)}
                data-ocid={`admin.payments.confirm_button.${i + 1}`}
              >
                <CheckCircle2
                  style={{
                    width: 13,
                    height: 13,
                    display: "inline",
                    marginRight: 4,
                  }}
                />
                Approve
              </button>
              <button
                type="button"
                style={{ ...S.btnRed, flex: 1 }}
                onClick={() => handleReject(p.id)}
                data-ocid={`admin.payments.delete_button.${i + 1}`}
              >
                <XCircle
                  style={{
                    width: 13,
                    height: 13,
                    display: "inline",
                    marginRight: 4,
                  }}
                />
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Withdrawals Tab ─────────────────────────────────────────────────────────
function WithdrawalsTab({
  refreshKey,
  onRefresh,
}: {
  refreshKey: number;
  onRefresh: () => void;
}) {
  const _ = refreshKey;
  const [backendWithdrawals, setBackendWithdrawals] = useState<
    AdminWithdrawal[]
  >([]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey is intentional re-fetch trigger
  useEffect(() => {
    backendGetAllWithdrawals()
      .then(setBackendWithdrawals)
      .catch(() => {});
  }, [refreshKey]);

  const localWithdrawals = getAllWithdrawalsAdmin();
  // Convert backend-only withdrawals not in localStorage
  const backendAsLocal: WithdrawalRequest[] = backendWithdrawals.map(
    (bw) =>
      ({
        id: `backend_${bw.principalStr}_${bw.timestamp}`,
        userId: bw.principalStr.slice(0, 8),
        amount: bw.amount,
        upiId: bw.address,
        upiName: `User (${bw.principalStr.slice(0, 8)}...)`,
        status: bw.status,
        date: new Date(Number(bw.timestamp / BigInt(1000000))).toLocaleString(
          "en-IN",
        ),
        _principalStr: bw.principalStr,
        _timestamp: bw.timestamp,
      }) as WithdrawalRequest & { _principalStr: string; _timestamp: bigint },
  );

  const withdrawals = [...localWithdrawals, ...backendAsLocal].sort((a, b) =>
    a.date < b.date ? 1 : -1,
  );

  function handleProcess(id: string) {
    adminUpdateWithdrawal(id, "approved");
    const w = withdrawals.find((x) => x.id === id) as
      | (WithdrawalRequest & { _principalStr?: string; _timestamp?: bigint })
      | undefined;
    if (w?._principalStr && w._timestamp !== undefined) {
      backendUpdateWithdrawalFn(
        w._principalStr,
        w._timestamp,
        "approved",
      ).catch(() => {});
    }
    onRefresh();
  }
  function handleReject(id: string) {
    adminUpdateWithdrawal(id, "rejected");
    const w = withdrawals.find((x) => x.id === id) as
      | (WithdrawalRequest & { _principalStr?: string; _timestamp?: bigint })
      | undefined;
    if (w?._principalStr && w._timestamp !== undefined) {
      backendUpdateWithdrawalFn(
        w._principalStr,
        w._timestamp,
        "rejected",
      ).catch(() => {});
    }
    onRefresh();
  }

  if (withdrawals.length === 0)
    return <EmptyState icon={Wallet} message="No withdrawal requests yet" />;

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 10 }}
      data-ocid="admin.withdrawals.list"
    >
      {withdrawals.map((w, i) => (
        <div
          key={w.id}
          style={S.card}
          data-ocid={`admin.withdrawals.item.${i + 1}`}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 10,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "oklch(0.90 0.01 80)",
                  marginBottom: 2,
                }}
              >
                {w.upiName}
              </p>
              <p
                style={{
                  fontSize: "0.7rem",
                  color: "oklch(0.50 0.02 265)",
                  marginBottom: 2,
                }}
              >
                UPI: {w.upiId}
              </p>
              <p
                style={{
                  fontSize: "0.68rem",
                  color: "oklch(0.45 0.02 265)",
                }}
              >
                {w.date} · ID: {w.userId}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  color: "oklch(0.72 0.2 22)",
                  marginBottom: 4,
                }}
              >
                {formatInr(w.amount)}
              </p>
              <StatusBadge status={w.status} />
            </div>
          </div>
          {w.status === "pending" && (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                style={{ ...S.btnGreen, flex: 1 }}
                onClick={() => handleProcess(w.id)}
                data-ocid={`admin.withdrawals.confirm_button.${i + 1}`}
              >
                <CheckCircle2
                  style={{
                    width: 13,
                    height: 13,
                    display: "inline",
                    marginRight: 4,
                  }}
                />
                Process
              </button>
              <button
                type="button"
                style={{ ...S.btnRed, flex: 1 }}
                onClick={() => handleReject(w.id)}
                data-ocid={`admin.withdrawals.delete_button.${i + 1}`}
              >
                <XCircle
                  style={{
                    width: 13,
                    height: 13,
                    display: "inline",
                    marginRight: 4,
                  }}
                />
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab({
  refreshKey,
  onRefresh,
}: {
  refreshKey: number;
  onRefresh: () => void;
}) {
  const [backendUsers, setBackendUsers] = useState<AdminUser[]>([]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey is intentional re-fetch trigger
  useEffect(() => {
    backendGetAllUsers()
      .then(setBackendUsers)
      .catch(() => {});
  }, [refreshKey]);

  const localUsers = getAllUsers();
  // Merge: local users first, then backend users not already represented locally
  const localUniqueIds = new Set(localUsers.map((u) => u.uniqueId));
  const localPhones = new Set(localUsers.map((u) => u.phone));
  const syntheticUsers: FscUser[] = backendUsers
    .filter(
      (bu) =>
        !localUniqueIds.has(bu.principalStr.slice(0, 8)) &&
        !localPhones.has(bu.principalStr.slice(0, 10)),
    )
    .map(
      (bu) =>
        ({
          name: bu.name,
          phone: bu.principalStr.slice(0, 10),
          uniqueId: bu.principalStr.slice(0, 8),
          balance: 0,
        }) as FscUser,
    );
  const users = [...localUsers, ...syntheticUsers];
  const [editBalanceId, setEditBalanceId] = useState<string | null>(null);
  const [balanceInput, setBalanceInput] = useState("");
  const [editUpiId, setEditUpiId] = useState<string | null>(null);
  const [upiInput, setUpiInput] = useState("");
  const [upiNameInput, setUpiNameInput] = useState("");

  function startEditBalance(user: FscUser) {
    setEditBalanceId(user.phone);
    setBalanceInput(String(user.balance ?? 0));
    setEditUpiId(null);
  }

  function saveBalance(phone: string) {
    const num = Number.parseFloat(balanceInput);
    if (!Number.isNaN(num) && num >= 0) {
      adminAdjustBalance(phone, num);
      onRefresh();
    }
    setEditBalanceId(null);
  }

  function startEditUpi(user: FscUser) {
    setEditUpiId(user.phone);
    setUpiInput(user.upiId ?? "");
    setUpiNameInput(user.upiName ?? "");
    setEditBalanceId(null);
  }

  function saveUpi(phone: string) {
    adminUpdateUpi(phone, upiInput, upiNameInput);
    onRefresh();
    setEditUpiId(null);
  }

  if (users.length === 0)
    return <EmptyState icon={Users} message="No registered users yet" />;

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 10 }}
      data-ocid="admin.users.list"
    >
      {users.map((u, i) => {
        const tier = getVipTier(
          getAllPaymentsAdmin()
            .filter((p) => p.userId === u.uniqueId && p.status === "approved")
            .reduce((s, p) => s + p.amount, 0),
        );
        const tierColors: Record<string, string> = {
          bronze: "oklch(0.62 0.12 55)",
          silver: "oklch(0.72 0.04 265)",
          gold: "oklch(0.78 0.18 82)",
          platinum: "oklch(0.65 0.18 290)",
        };
        return (
          <div
            key={u.phone}
            style={S.card}
            data-ocid={`admin.users.item.${i + 1}`}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 8,
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: "oklch(0.90 0.01 80)",
                    marginBottom: 2,
                  }}
                >
                  {u.name}
                  {u.suspended && (
                    <span
                      style={{
                        display: "inline-block",
                        marginLeft: 8,
                        padding: "2px 7px",
                        borderRadius: 999,
                        fontSize: "0.6rem",
                        fontWeight: 800,
                        background: "oklch(0.35 0.18 25)",
                        color: "oklch(0.95 0.02 25)",
                        border: "1px solid oklch(0.55 0.22 25)",
                        letterSpacing: "0.06em",
                        verticalAlign: "middle",
                        textTransform: "uppercase",
                      }}
                    >
                      FROZEN
                    </span>
                  )}
                </p>
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "oklch(0.50 0.02 265)",
                    marginBottom: 2,
                  }}
                >
                  📱 {u.phone}
                </p>
                <p
                  style={{
                    fontSize: "0.68rem",
                    fontFamily: "monospace",
                    color: "oklch(0.45 0.02 265)",
                  }}
                >
                  ID: #{u.uniqueId}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 800,
                    background:
                      "linear-gradient(135deg, oklch(0.90 0.18 82), oklch(0.72 0.20 75))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    marginBottom: 4,
                  }}
                >
                  {formatInr(u.balance ?? 0)}
                </p>
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: 999,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    background: `${tierColors[tier]}22`,
                    color: tierColors[tier],
                    border: `1px solid ${tierColors[tier]}44`,
                    textTransform: "uppercase",
                  }}
                >
                  {getVipTierLabel(tier)}
                </span>
              </div>
            </div>

            {/* Edit Balance */}
            {editBalanceId === u.phone ? (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 8,
                  alignItems: "center",
                }}
              >
                <input
                  type="number"
                  value={balanceInput}
                  onChange={(e) => setBalanceInput(e.target.value)}
                  style={{ ...S.input, flex: 1 }}
                  placeholder="New balance (₹)"
                  data-ocid="admin.users.balance.input"
                />
                <button
                  type="button"
                  style={S.btnGreen}
                  onClick={() => saveBalance(u.phone)}
                  data-ocid="admin.users.balance.save_button"
                >
                  Save
                </button>
                <button
                  type="button"
                  style={S.btnRed}
                  onClick={() => setEditBalanceId(null)}
                  data-ocid="admin.users.balance.cancel_button"
                >
                  ✕
                </button>
              </div>
            ) : null}

            {/* Edit UPI */}
            {editUpiId === u.phone ? (
              <div style={{ marginBottom: 8 }}>
                <input
                  type="text"
                  value={upiInput}
                  onChange={(e) => setUpiInput(e.target.value)}
                  style={{ ...S.input, marginBottom: 6 }}
                  placeholder="UPI ID (e.g. user@bank)"
                  data-ocid="admin.users.upi.input"
                />
                <input
                  type="text"
                  value={upiNameInput}
                  onChange={(e) => setUpiNameInput(e.target.value)}
                  style={{ ...S.input, marginBottom: 6 }}
                  placeholder="UPI Name"
                  data-ocid="admin.users.upiname.input"
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    style={{ ...S.btnGreen, flex: 1 }}
                    onClick={() => saveUpi(u.phone)}
                    data-ocid="admin.users.upi.save_button"
                  >
                    Save UPI
                  </button>
                  <button
                    type="button"
                    style={S.btnRed}
                    onClick={() => setEditUpiId(null)}
                    data-ocid="admin.users.upi.cancel_button"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : null}

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                style={{
                  ...S.btnGold,
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                }}
                onClick={() =>
                  editBalanceId === u.phone
                    ? setEditBalanceId(null)
                    : startEditBalance(u)
                }
                data-ocid={`admin.users.edit_button.${i + 1}`}
              >
                {editBalanceId === u.phone ? (
                  <ChevronUp style={{ width: 13, height: 13 }} />
                ) : (
                  <ChevronDown style={{ width: 13, height: 13 }} />
                )}
                Balance
              </button>
              <button
                type="button"
                style={{
                  flex: 1,
                  background: "oklch(0.18 0.03 265)",
                  border: "1px solid oklch(0.28 0.04 265)",
                  color: "oklch(0.75 0.02 265)",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  padding: "7px 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                }}
                onClick={() =>
                  editUpiId === u.phone ? setEditUpiId(null) : startEditUpi(u)
                }
                data-ocid={`admin.users.secondary_button.${i + 1}`}
              >
                {editUpiId === u.phone ? (
                  <ChevronUp style={{ width: 13, height: 13 }} />
                ) : (
                  <ChevronDown style={{ width: 13, height: 13 }} />
                )}
                UPI
              </button>
              {u.suspended ? (
                <button
                  type="button"
                  style={{
                    ...S.btnGreen,
                    flex: 1,
                  }}
                  onClick={() => {
                    adminUnsuspendUser(u.phone);
                    onRefresh();
                  }}
                  data-ocid={`admin.users.toggle.${i + 1}`}
                >
                  ✓ Unfreeze
                </button>
              ) : (
                <button
                  type="button"
                  style={{
                    flex: 1,
                    background: "oklch(0.20 0.05 220)",
                    border: "1px solid oklch(0.35 0.08 220)",
                    color: "oklch(0.70 0.12 220)",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    padding: "7px 10px",
                    borderRadius: 8,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                  onClick={() => {
                    adminSuspendUser(u.phone, "Frozen by admin");
                    onRefresh();
                  }}
                  data-ocid={`admin.users.toggle.${i + 1}`}
                >
                  ❄ Freeze
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tickets Tab ──────────────────────────────────────────────────────────────
function TicketsTab({
  refreshKey,
  onRefresh,
}: {
  refreshKey: number;
  onRefresh: () => void;
}) {
  const _ = refreshKey;
  const [backendTickets, setBackendTickets] = useState<AdminTicket[]>([]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey is intentional re-fetch trigger
  useEffect(() => {
    backendGetAllTickets()
      .then(setBackendTickets)
      .catch(() => {});
  }, [refreshKey]);

  const localTickets = getAllTicketsAdmin();
  const localTicketIds = new Set(localTickets.map((t) => t.id));
  const backendAsLocal: (SupportTicketLocal & {
    userName: string;
    userPhone: string;
  })[] = backendTickets
    .filter((bt) => !localTicketIds.has(String(bt.ticketId)))
    .map((bt) => ({
      id: String(bt.ticketId),
      subject: bt.subject,
      message: bt.message,
      status: bt.status,
      date: new Date(Number(bt.timestamp / BigInt(1000000))).toISOString(),
      userId: bt.principalStr.slice(0, 8),
      userName: `User (${bt.principalStr.slice(0, 8)}...)`,
      userPhone: bt.principalStr.slice(0, 10),
    }));
  const tickets = [...localTickets, ...backendAsLocal].sort((a, b) =>
    a.date < b.date ? 1 : -1,
  );

  function handleClose(
    t: SupportTicketLocal & { userName: string; userPhone: string },
  ) {
    adminCloseTicket(t.userId, t.id);
    onRefresh();
  }

  if (tickets.length === 0)
    return <EmptyState icon={Headphones} message="No support tickets yet" />;

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 10 }}
      data-ocid="admin.tickets.list"
    >
      {tickets.map((t, i) => (
        <div
          key={t.id}
          style={S.card}
          data-ocid={`admin.tickets.item.${i + 1}`}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 8,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "oklch(0.90 0.01 80)",
                  marginBottom: 2,
                }}
              >
                {t.subject}
              </p>
              <p
                style={{
                  fontSize: "0.7rem",
                  color: "oklch(0.55 0.02 265)",
                  marginBottom: 2,
                }}
              >
                {t.userName} · {t.date}
              </p>
            </div>
            <StatusBadge status={t.status} />
          </div>
          <p
            style={{
              fontSize: "0.8rem",
              color: "oklch(0.65 0.02 265)",
              background: "oklch(0.09 0.02 265)",
              borderRadius: 8,
              padding: "8px 12px",
              marginBottom: 10,
              lineHeight: 1.5,
            }}
          >
            {t.message}
          </p>
          {(t as SupportTicketLocal & { screenshotUrl?: string })
            .screenshotUrl && (
            <div style={{ marginBottom: 10 }}>
              <p
                style={{
                  fontSize: "0.65rem",
                  color: "oklch(0.45 0.02 265)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 6,
                }}
              >
                Attachment
              </p>
              <a
                href={
                  (t as SupportTicketLocal & { screenshotUrl?: string })
                    .screenshotUrl
                }
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={
                    (t as SupportTicketLocal & { screenshotUrl?: string })
                      .screenshotUrl
                  }
                  alt="Ticket attachment"
                  style={{
                    width: "100%",
                    maxHeight: 180,
                    objectFit: "contain",
                    borderRadius: 8,
                    border: "1px solid oklch(0.22 0.03 265)",
                    background: "oklch(0.09 0.02 265)",
                  }}
                />
              </a>
            </div>
          )}
          {t.status === "open" && (
            <button
              type="button"
              style={{ ...S.btnGreen, width: "100%" }}
              onClick={() => handleClose(t)}
              data-ocid={`admin.tickets.close_button.${i + 1}`}
            >
              <CheckCircle2
                style={{
                  width: 13,
                  height: 13,
                  display: "inline",
                  marginRight: 4,
                }}
              />
              Mark Resolved
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── KYC Tab ──────────────────────────────────────────────────────────────────
function KycTab({
  refreshKey,
  onRefresh,
}: {
  refreshKey: number;
  onRefresh: () => void;
}) {
  const [backendKyc, setBackendKyc] = useState<AdminKyc[]>([]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey is intentional re-fetch trigger
  useEffect(() => {
    backendGetAllKyc()
      .then(setBackendKyc)
      .catch(() => {});
  }, [refreshKey]);

  const localKyc = getAllKycAdmin();
  const localPrincipalSet = new Set(localKyc.map((k) => k.userId));
  type KycEntry = KycData & {
    userId: string;
    userName: string;
    userPhone: string;
  };
  const backendAsLocal: KycEntry[] = backendKyc
    .filter((k) => !localPrincipalSet.has(k.principalStr))
    .map((k) => ({
      userId: k.principalStr,
      userName: `${k.principalStr.slice(0, 12)}...`,
      userPhone: k.principalStr.slice(0, 10),
      docType:
        k.documentType === "pan" ? ("pan" as const) : ("aadhaar" as const),
      docNumber: k.documentNumber,
      status: k.status === "approved" ? ("verified" as const) : k.status,
      submittedDate: new Date(
        Number(k.submittedAt) / 1_000_000,
      ).toLocaleDateString("en-IN"),
      docImage: k.blobId || undefined,
    }));

  const kycList = [...localKyc, ...backendAsLocal].sort((a, b) =>
    a.submittedDate < b.submittedDate ? 1 : -1,
  );

  function handleApprove(userId: string) {
    adminApproveKyc(userId);
    onRefresh();
  }
  function handleReject(userId: string) {
    adminRejectKyc(userId);
    onRefresh();
  }

  if (kycList.length === 0)
    return <EmptyState icon={Shield} message="No KYC submissions yet" />;

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 10 }}
      data-ocid="admin.kyc.list"
    >
      {kycList.map(
        (
          k: KycData & { userId: string; userName: string; userPhone: string },
          i: number,
        ) => (
          <div
            key={k.userId}
            style={S.card}
            data-ocid={`admin.kyc.item.${i + 1}`}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: "oklch(0.90 0.01 80)",
                    marginBottom: 2,
                  }}
                >
                  {k.userName}
                </p>
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "oklch(0.50 0.02 265)",
                    marginBottom: 2,
                  }}
                >
                  📱 {k.userPhone}
                </p>
                <p
                  style={{
                    fontSize: "0.68rem",
                    color: "oklch(0.45 0.02 265)",
                  }}
                >
                  {k.docType.toUpperCase()} · {k.docNumber}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <StatusBadge status={k.status} />
                <p
                  style={{
                    fontSize: "0.65rem",
                    color: "oklch(0.45 0.02 265)",
                    marginTop: 4,
                  }}
                >
                  {k.submittedDate}
                </p>
              </div>
            </div>
            {k.docImage && (
              <div style={{ marginBottom: 10 }}>
                <p
                  style={{
                    fontSize: "0.65rem",
                    color: "oklch(0.45 0.02 265)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 6,
                  }}
                >
                  {k.docType === "aadhaar" ? "Aadhaar Card" : "PAN Card"}{" "}
                  Document
                </p>
                <a
                  href={k.docImage}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "block" }}
                >
                  <img
                    src={k.docImage}
                    alt="KYC document"
                    style={{
                      width: "100%",
                      maxHeight: 220,
                      objectFit: "contain",
                      borderRadius: 8,
                      border: "1px solid oklch(0.22 0.03 265)",
                      background: "oklch(0.09 0.02 265)",
                    }}
                  />
                </a>
                <p
                  style={{
                    fontSize: "0.6rem",
                    color: "oklch(0.40 0.02 265)",
                    marginTop: 4,
                    textAlign: "center",
                  }}
                >
                  Tap to view full size
                </p>
              </div>
            )}
            {k.status === "pending" && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  style={{ ...S.btnGreen, flex: 1 }}
                  onClick={() => handleApprove(k.userId)}
                  data-ocid={`admin.kyc.confirm_button.${i + 1}`}
                >
                  <CheckCircle2
                    style={{
                      width: 13,
                      height: 13,
                      display: "inline",
                      marginRight: 4,
                    }}
                  />
                  Approve
                </button>
                <button
                  type="button"
                  style={{ ...S.btnRed, flex: 1 }}
                  onClick={() => handleReject(k.userId)}
                  data-ocid={`admin.kyc.delete_button.${i + 1}`}
                >
                  <XCircle
                    style={{
                      width: 13,
                      height: 13,
                      display: "inline",
                      marginRight: 4,
                    }}
                  />
                  Reject
                </button>
              </div>
            )}
          </div>
        ),
      )}
    </div>
  );
}

// ─── Transactions Tab ─────────────────────────────────────────────────────────
function TransactionsTab({ refreshKey }: { refreshKey: number }) {
  const _ = refreshKey;
  type TxItem = {
    id: string;
    type: "deposit" | "withdrawal";
    user: string;
    amount: number;
    status: string;
    date: string;
  };

  const payments = getAllPaymentsAdmin();
  const withdrawals = getAllWithdrawalsAdmin();

  const all: TxItem[] = [
    ...payments.map((p) => ({
      id: p.id,
      type: "deposit" as const,
      user: p.userName,
      amount: p.amount,
      status: p.status,
      date: p.date,
    })),
    ...withdrawals.map((w) => ({
      id: w.id,
      type: "withdrawal" as const,
      user: w.upiName,
      amount: w.amount,
      status: w.status,
      date: w.date,
    })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));

  if (all.length === 0)
    return <EmptyState icon={ArrowLeftRight} message="No transactions yet" />;

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
      data-ocid="admin.transactions.list"
    >
      {all.map((tx, i) => (
        <div
          key={tx.id}
          style={{
            ...S.card,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          data-ocid={`admin.transactions.item.${i + 1}`}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  tx.type === "deposit"
                    ? "oklch(0.75 0.18 145 / 0.15)"
                    : "oklch(0.72 0.2 22 / 0.15)",
              }}
            >
              {tx.type === "deposit" ? (
                <CheckCircle2
                  style={{
                    width: 15,
                    height: 15,
                    color: "oklch(0.75 0.18 145)",
                  }}
                />
              ) : (
                <Wallet
                  style={{
                    width: 15,
                    height: 15,
                    color: "oklch(0.72 0.2 22)",
                  }}
                />
              )}
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 2,
                }}
              >
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 4,
                    background:
                      tx.type === "deposit"
                        ? "oklch(0.75 0.18 145 / 0.15)"
                        : "oklch(0.72 0.2 22 / 0.15)",
                    color:
                      tx.type === "deposit"
                        ? "oklch(0.75 0.18 145)"
                        : "oklch(0.72 0.2 22)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {tx.type === "deposit" ? "Deposit" : "Withdrawal"}
                </span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "oklch(0.75 0.02 265)" }}>
                {tx.user}
              </p>
              <p style={{ fontSize: "0.65rem", color: "oklch(0.45 0.02 265)" }}>
                {tx.date}
              </p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                fontSize: "0.95rem",
                fontWeight: 800,
                color:
                  tx.type === "deposit"
                    ? "oklch(0.75 0.18 145)"
                    : "oklch(0.72 0.2 22)",
                marginBottom: 4,
              }}
            >
              {tx.type === "deposit" ? "+" : "-"}
              {formatInr(tx.amount)}
            </p>
            <StatusBadge status={tx.status} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main AdminPanel Component ────────────────────────────────────────────────

// ─── Messages Tab ─────────────────────────────────────────────────────────────
function MessagesTab() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(() =>
    getBroadcasts(),
  );
  const [sending, setSending] = useState(false);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    const newBroadcast: Broadcast = {
      id: Date.now().toString(),
      title: title.trim(),
      message: body.trim(),
      target: "all",
      date: new Date().toISOString(),
      read: [],
    };
    const updated = [newBroadcast, ...getBroadcasts()];
    saveBroadcasts(updated);
    setBroadcasts(updated);
    setTitle("");
    setBody("");
    setSending(false);
  }

  function formatMsgDate(iso: string): string {
    try {
      return new Date(iso).toLocaleString("en-IN", {
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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Compose Form */}
      <form
        onSubmit={handleSend}
        data-ocid="admin.messages.modal"
        style={{
          ...S.card,
          border: "1px solid oklch(0.78 0.18 82 / 0.25)",
          boxShadow: "0 0 20px oklch(0.78 0.18 82 / 0.06)",
        }}
      >
        <p
          style={{
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "oklch(0.88 0.01 80)",
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <MessageSquare
            style={{ width: 16, height: 16, color: "oklch(0.78 0.18 82)" }}
          />
          Compose Message
        </p>
        <div style={{ marginBottom: 10 }}>
          <label
            htmlFor="msg-title"
            style={{
              fontSize: "0.7rem",
              color: "oklch(0.55 0.02 265)",
              display: "block",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Title
          </label>
          <input
            id="msg-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Special Offer — 5% Bonus This Weekend!"
            required
            data-ocid="admin.messages.title.input"
            style={S.input}
          />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label
            htmlFor="msg-body"
            style={{
              fontSize: "0.7rem",
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
            id="msg-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your announcement or offer here..."
            required
            rows={4}
            data-ocid="admin.messages.body.textarea"
            style={{ ...S.input, resize: "none" as const, lineHeight: 1.6 }}
          />
        </div>
        <button
          type="submit"
          disabled={sending || !title.trim() || !body.trim()}
          data-ocid="admin.messages.submit.button"
          style={{
            width: "100%",
            background:
              sending || !title.trim() || !body.trim()
                ? "oklch(0.65 0.2 145 / 0.3)"
                : "linear-gradient(135deg, oklch(0.87 0.17 87), oklch(0.73 0.21 73))",
            color:
              sending || !title.trim() || !body.trim()
                ? "oklch(0.55 0.02 265)"
                : "oklch(0.12 0.03 265)",
            fontWeight: 700,
            fontSize: "0.85rem",
            padding: "11px",
            borderRadius: 10,
            border: "none",
            cursor:
              sending || !title.trim() || !body.trim()
                ? "not-allowed"
                : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 0.15s ease",
          }}
        >
          <Send style={{ width: 14, height: 14 }} />
          {sending ? "Sending..." : "Send to All Users"}
        </button>
      </form>

      {/* Sent Messages */}
      <div>
        <p
          style={{
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "oklch(0.55 0.02 265)",
            marginBottom: 10,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Sent Messages ({broadcasts.length})
        </p>
        {broadcasts.length === 0 ? (
          <EmptyState icon={MessageSquare} message="No messages sent yet" />
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
            data-ocid="admin.messages.list"
          >
            {broadcasts.map((b, i) => (
              <div
                key={b.id}
                style={{
                  ...S.card,
                  borderLeft: "3px solid oklch(0.78 0.18 82 / 0.6)",
                  position: "relative",
                }}
                data-ocid={`admin.messages.item.${i + 1}`}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 6,
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      color: "oklch(0.90 0.01 80)",
                      flex: 1,
                      marginRight: 10,
                    }}
                  >
                    {b.title}
                  </p>
                  <span
                    style={{
                      fontSize: "0.6rem",
                      background: "oklch(0.65 0.2 145 / 0.12)",
                      color: "oklch(0.75 0.18 145)",
                      border: "1px solid oklch(0.65 0.2 145 / 0.3)",
                      borderRadius: 999,
                      padding: "2px 8px",
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    Sent to All Users
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "oklch(0.60 0.02 265)",
                    lineHeight: 1.55,
                    marginBottom: 8,
                  }}
                >
                  {b.message}
                </p>
                <p
                  style={{ fontSize: "0.65rem", color: "oklch(0.40 0.02 265)" }}
                >
                  {formatMsgDate(b.date)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);

  function handlePinSubmit() {
    if (pin === ADMIN_PIN) {
      setAuthenticated(true);
      setPinError("");
    } else {
      setPinError("Incorrect PIN. Access denied.");
      setPin("");
    }
  }

  function handleRefresh() {
    setRefreshKey((k) => k + 1);
  }

  // ── PIN Login Screen ──────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div
        style={{
          ...S.page,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
        data-ocid="admin.panel"
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <img
            src="/assets/generated/fsc-logo-premium-transparent.dim_300x300.png"
            alt="FSC"
            style={{
              width: 80,
              height: 80,
              objectFit: "contain",
              margin: "0 auto 12px",
              display: "block",
              filter: "drop-shadow(0 0 16px oklch(0.78 0.18 82 / 0.5))",
            }}
          />
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              background:
                "linear-gradient(135deg, oklch(0.90 0.18 82), oklch(0.72 0.20 75))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: 4,
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            Admin Access
          </h1>
          <p
            style={{
              fontSize: "0.78rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "oklch(0.50 0.04 265)",
            }}
          >
            FSC Control Center
          </p>
        </div>

        {/* PIN card */}
        <div
          style={{
            width: "100%",
            maxWidth: 360,
            background: "oklch(0.13 0.025 265)",
            border: "1px solid oklch(0.78 0.18 82 / 0.2)",
            borderRadius: 20,
            padding: "32px 24px",
            boxShadow:
              "0 20px 60px oklch(0 0 0 / 0.5), 0 0 40px oklch(0.78 0.18 82 / 0.07)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <Lock
              style={{
                width: 18,
                height: 18,
                color: "oklch(0.78 0.18 82)",
              }}
            />
            <p
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "oklch(0.90 0.01 80)",
              }}
            >
              Enter Admin PIN
            </p>
          </div>

          <input
            type="password"
            inputMode="numeric"
            maxLength={8}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setPinError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
            placeholder="••••••••"
            style={{
              ...S.input,
              fontSize: "1.5rem",
              letterSpacing: "0.3em",
              textAlign: "center",
              marginBottom: 8,
            }}
            data-ocid="admin.pin.input"
          />

          {pinError && (
            <p
              style={{
                fontSize: "0.8rem",
                color: "oklch(0.72 0.2 22)",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              data-ocid="admin.pin.error_state"
            >
              <XCircle style={{ width: 14, height: 14 }} />
              {pinError}
            </p>
          )}

          <button
            type="button"
            style={{
              ...S.btnGold,
              width: "100%",
              padding: "14px",
              fontSize: "0.9rem",
              marginTop: pinError ? 0 : 12,
              borderRadius: 12,
            }}
            onClick={handlePinSubmit}
            data-ocid="admin.pin.submit_button"
          >
            Access Panel
          </button>

          <button
            type="button"
            onClick={onBack}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              color: "oklch(0.45 0.02 265)",
              fontSize: "0.8rem",
              marginTop: 12,
              cursor: "pointer",
              padding: "8px",
            }}
            data-ocid="admin.pin.cancel_button"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Admin Panel Dashboard ─────────────────────────────────────────────────
  return (
    <div style={S.page} data-ocid="admin.panel">
      {/* Header */}
      <header style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src="/assets/generated/fsc-logo-premium-transparent.dim_300x300.png"
            alt="FSC"
            style={{
              width: 32,
              height: 32,
              objectFit: "contain",
              filter: "drop-shadow(0 0 8px oklch(0.78 0.18 82 / 0.4))",
            }}
          />
          <div>
            <p
              style={{
                fontSize: "0.95rem",
                fontWeight: 800,
                background:
                  "linear-gradient(135deg, oklch(0.90 0.18 82), oklch(0.72 0.20 75))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: 1.1,
              }}
            >
              Admin Panel
            </p>
            <p
              style={{
                fontSize: "0.62rem",
                color: "oklch(0.45 0.02 265)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              FSC Control Center
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setAuthenticated(false);
            setPin("");
            onBack();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "oklch(0.65 0.22 22 / 0.12)",
            border: "1px solid oklch(0.65 0.22 22 / 0.3)",
            color: "oklch(0.72 0.2 22)",
            fontSize: "0.8rem",
            fontWeight: 600,
            padding: "7px 12px",
            borderRadius: 8,
            cursor: "pointer",
          }}
          data-ocid="admin.logout.button"
        >
          <LogOut style={{ width: 14, height: 14 }} />
          Logout
        </button>
      </header>

      {/* Tab Navigation */}
      <div
        style={{
          overflowX: "auto",
          borderBottom: "1px solid oklch(0.22 0.035 265)",
          background: "oklch(0.11 0.022 265 / 0.8)",
          scrollbarWidth: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 0,
            padding: "0 12px",
            minWidth: "max-content",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "12px 14px",
                background: "transparent",
                border: "none",
                borderBottom:
                  activeTab === tab.id
                    ? "2px solid oklch(0.78 0.18 82)"
                    : "2px solid transparent",
                color:
                  activeTab === tab.id
                    ? "oklch(0.88 0.18 84)"
                    : "oklch(0.50 0.02 265)",
                fontSize: "0.8rem",
                fontWeight: activeTab === tab.id ? 700 : 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
              data-ocid={`admin.${tab.id}.tab`}
            >
              <tab.icon style={{ width: 14, height: 14 }} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <main
        style={{
          padding: "16px",
          maxWidth: 640,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {activeTab === "dashboard" && <DashboardTab refreshKey={refreshKey} />}
        {activeTab === "payments" && (
          <PaymentsTab refreshKey={refreshKey} onRefresh={handleRefresh} />
        )}
        {activeTab === "withdrawals" && (
          <WithdrawalsTab refreshKey={refreshKey} onRefresh={handleRefresh} />
        )}
        {activeTab === "users" && (
          <UsersTab refreshKey={refreshKey} onRefresh={handleRefresh} />
        )}
        {activeTab === "tickets" && (
          <TicketsTab refreshKey={refreshKey} onRefresh={handleRefresh} />
        )}
        {activeTab === "kyc" && (
          <KycTab refreshKey={refreshKey} onRefresh={handleRefresh} />
        )}
        {activeTab === "transactions" && (
          <TransactionsTab refreshKey={refreshKey} />
        )}
        {activeTab === "messages" && <MessagesTab />}
      </main>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          padding: "16px",
          borderTop: "1px solid oklch(0.18 0.03 265)",
          marginTop: 16,
        }}
      >
        <p style={{ fontSize: "0.65rem", color: "oklch(0.35 0.02 265)" }}>
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "oklch(0.50 0.04 82)",
              textDecoration: "underline",
            }}
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
