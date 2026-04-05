export interface FscUser {
  name: string;
  phone: string;
  uniqueId: string;
  balance: number;
  upiId?: string;
  upiName?: string;
  profilePic?: string; // base64
  suspended?: boolean;
  suspensionReason?: string;
}

export interface PaymentSubmission {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: string;
  utr: string;
  screenshot?: string; // base64
  status: "pending" | "approved" | "rejected";
  date: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  upiId: string;
  upiName: string;
  status: "pending" | "approved" | "rejected";
  date: string;
}

export interface ReferralData {
  referralCode: string;
  referredFriends: Array<{ name: string; phone: string; joinedDate: string }>;
  referralEarnings: number;
}

export interface DailySpinRecord {
  lastSpinDate: string;
  totalEarned: number;
}

export interface SupportTicketLocal {
  id: string;
  subject: string;
  message: string;
  status: "open" | "resolved";
  date: string;
  userId: string;
}

export type KycData = {
  docType: "aadhaar" | "pan";
  docNumber: string;
  status: "pending" | "verified" | "rejected";
  submittedDate: string;
  docImage?: string;
};

export type PriceAlert = {
  id: string;
  planName: string;
  targetPrice: number;
  currentPrice?: number;
  status: "active" | "triggered";
  createdDate: string;
};

export type LoginActivity = {
  date: string;
  time: string;
  device: string;
  location: string;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedDate?: string;
  progress?: { current: number; total: number };
};

// ─── New Types for Admin Premium Features ────────────────────────────────────

export interface BalanceAdjustment {
  id: string;
  userId: string;
  userName: string;
  oldBalance: number;
  newBalance: number;
  reason: string;
  timestamp: string;
}

export interface AdminLogEntry {
  id: string;
  action: string;
  targetUser: string;
  detail: string;
  timestamp: string;
}

export interface AdminDm {
  id: string;
  message: string;
  date: string;
  read: boolean;
}

export interface Broadcast {
  id: string;
  title: string;
  message: string;
  target: "all" | "bronze" | "silver" | "gold" | "platinum";
  date: string;
  read: string[];
}

export interface CustomPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  instantBonus: number;
  hourlyRate: number;
  description: string;
  createdDate: string;
}

export interface BlocklistEntry {
  phone: string;
  reason: string;
  date: string;
}

export interface UserNote {
  tags: string[];
  note: string;
}

export interface UserActivity {
  lastLogin: string;
  totalLogins: number;
  pagesVisited: string[];
}

// localStorage helpers
export function getCurrentUser(): FscUser | null {
  try {
    const phone = localStorage.getItem("fsc_current_user");
    if (!phone) return null;
    const raw = localStorage.getItem(`fsc_user_${phone}`);
    if (!raw) return null;
    return JSON.parse(raw) as FscUser;
  } catch {
    return null;
  }
}

export function saveUser(user: FscUser): void {
  localStorage.setItem(`fsc_user_${user.phone}`, JSON.stringify(user));
  localStorage.setItem("fsc_current_user", user.phone);
}

export function logoutUser(): void {
  localStorage.removeItem("fsc_current_user");
}

export function getPayments(): PaymentSubmission[] {
  try {
    const raw = localStorage.getItem("fsc_payments");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePayments(payments: PaymentSubmission[]): void {
  localStorage.setItem("fsc_payments", JSON.stringify(payments));
}

export function getWithdrawals(): WithdrawalRequest[] {
  try {
    const raw = localStorage.getItem("fsc_withdrawals");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWithdrawals(withdrawals: WithdrawalRequest[]): void {
  localStorage.setItem("fsc_withdrawals", JSON.stringify(withdrawals));
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getReferralData(userId: string): ReferralData | null {
  try {
    const raw = localStorage.getItem(`fsc_referral_${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveReferralData(userId: string, data: ReferralData): void {
  localStorage.setItem(`fsc_referral_${userId}`, JSON.stringify(data));
}

export function getDailySpinRecord(userId: string): DailySpinRecord {
  try {
    const raw = localStorage.getItem(`fsc_spin_${userId}`);
    return raw ? JSON.parse(raw) : { lastSpinDate: "", totalEarned: 0 };
  } catch {
    return { lastSpinDate: "", totalEarned: 0 };
  }
}

export function saveDailySpinRecord(
  userId: string,
  record: DailySpinRecord,
): void {
  localStorage.setItem(`fsc_spin_${userId}`, JSON.stringify(record));
}

export function getSupportTickets(userId: string): SupportTicketLocal[] {
  try {
    const raw = localStorage.getItem(`fsc_tickets_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSupportTickets(
  userId: string,
  tickets: SupportTicketLocal[],
): void {
  localStorage.setItem(`fsc_tickets_${userId}`, JSON.stringify(tickets));
}

export function getTheme(): "dark" | "light" {
  return (localStorage.getItem("fsc_theme") as "dark" | "light") || "dark";
}

export function setTheme(theme: "dark" | "light"): void {
  localStorage.setItem("fsc_theme", theme);
}

// KYC
export function getKycData(userId: string): KycData | null {
  try {
    const raw = localStorage.getItem(`fsc_kyc_${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveKycData(userId: string, data: KycData): void {
  localStorage.setItem(`fsc_kyc_${userId}`, JSON.stringify(data));
}

// Price Alerts
export function getPriceAlerts(userId: string): PriceAlert[] {
  try {
    const raw = localStorage.getItem(`fsc_alerts_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePriceAlerts(userId: string, alerts: PriceAlert[]): void {
  localStorage.setItem(`fsc_alerts_${userId}`, JSON.stringify(alerts));
}

// Login Activity
export function getLoginActivity(userId: string): LoginActivity[] {
  try {
    const raw = localStorage.getItem(`fsc_login_activity_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLoginActivity(
  userId: string,
  entries: LoginActivity[],
): void {
  localStorage.setItem(`fsc_login_activity_${userId}`, JSON.stringify(entries));
}

export function recordLogin(userId: string): void {
  const now = new Date();
  const devices = ["Mobile (Android)", "Mobile (iOS)", "Mobile (Chrome)"];
  const entry: LoginActivity = {
    date: now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    device: devices[Math.floor(Math.random() * devices.length)],
    location: "India",
  };
  const existing = getLoginActivity(userId);
  const updated = [entry, ...existing].slice(0, 10);
  saveLoginActivity(userId, updated);
  // Record user activity too
  recordUserActivity(userId, "login");
  // Increment login count
  const act = getUserActivity(userId);
  act.totalLogins += 1;
  act.lastLogin = now.toISOString();
  saveUserActivity(userId, act);
}

// VIP Tier
export type VipTier = "bronze" | "silver" | "gold" | "platinum";

export function getVipTier(totalInvested: number): VipTier {
  if (totalInvested >= 50000) return "platinum";
  if (totalInvested >= 20000) return "gold";
  if (totalInvested >= 5000) return "silver";
  return "bronze";
}

export function getVipTierLabel(tier: VipTier): string {
  const labels: Record<VipTier, string> = {
    bronze: "Bronze",
    silver: "Silver",
    gold: "Gold",
    platinum: "Platinum",
  };
  return labels[tier];
}

export function getVipTierColor(tier: VipTier): string {
  const colors: Record<VipTier, string> = {
    bronze: "oklch(0.62 0.12 55)",
    silver: "oklch(0.72 0.04 265)",
    gold: "oklch(0.78 0.18 82)",
    platinum: "oklch(0.65 0.18 290)",
  };
  return colors[tier];
}

// ─── Active Plan ─────────────────────────────────────────────────────────────

export interface ActivePlan {
  id: string;
  userId: string;
  planName: string;
  planAmount: number;
  purchaseDate: string;
  expiryDate: string;
  status: "active" | "closed";
  earnedSoFar: number;
  lastUpdated: string;
}

export const PLAN_HOURLY_RATE = 0.02;
export const PLAN_TARGET_MULTIPLIER = 1.4;

export function getActivePlan(userId: string): ActivePlan | null {
  try {
    const raw = localStorage.getItem(`fsc_active_plan_${userId}`);
    return raw ? (JSON.parse(raw) as ActivePlan) : null;
  } catch {
    return null;
  }
}

export function saveActivePlan(userId: string, plan: ActivePlan): void {
  localStorage.setItem(`fsc_active_plan_${userId}`, JSON.stringify(plan));
}

export function clearActivePlan(userId: string): void {
  localStorage.removeItem(`fsc_active_plan_${userId}`);
}

export function tickPlanEarnings(plan: ActivePlan): ActivePlan {
  if (plan.status === "closed") return plan;
  const now = new Date();
  const last = new Date(plan.lastUpdated);
  const hoursElapsed = (now.getTime() - last.getTime()) / (1000 * 60 * 60);
  const maxEarnable = plan.planAmount * PLAN_TARGET_MULTIPLIER;
  const perHourEarning = plan.planAmount * PLAN_HOURLY_RATE;
  const newEarning = hoursElapsed * perHourEarning;
  const updatedEarned = Math.min(plan.earnedSoFar + newEarning, maxEarnable);
  const newStatus: "active" | "closed" =
    updatedEarned >= maxEarnable ? "closed" : "active";
  return {
    ...plan,
    earnedSoFar: updatedEarned,
    status: newStatus,
    lastUpdated: now.toISOString(),
  };
}

// ─── Admin Helpers ────────────────────────────────────────────────────────────

export const ADMIN_PIN = "09186114";

export function getAllUsers(): FscUser[] {
  const users: FscUser[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("fsc_user_")) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) users.push(JSON.parse(raw) as FscUser);
      } catch {
        // skip invalid entries
      }
    }
  }
  return users;
}

export function getAllPaymentsAdmin(): PaymentSubmission[] {
  return getPayments();
}

export function getAllWithdrawalsAdmin(): WithdrawalRequest[] {
  return getWithdrawals();
}

export function adminApprovePayment(paymentId: string): void {
  const payments = getPayments();
  const updated = payments.map((p) => {
    if (p.id === paymentId) {
      const allUsersKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith("fsc_user_")) allUsersKeys.push(k);
      }
      for (const key of allUsersKeys) {
        const ur = localStorage.getItem(key);
        if (ur) {
          try {
            const u = JSON.parse(ur) as FscUser;
            if (u.uniqueId === p.userId) {
              u.balance = (u.balance || 0) + p.amount;
              localStorage.setItem(key, JSON.stringify(u));
              break;
            }
          } catch {
            // skip
          }
        }
      }
      return { ...p, status: "approved" as const };
    }
    return p;
  });
  savePayments(updated);
  adminLog("approve_payment", paymentId, `Approved payment ${paymentId}`);
}

export function adminRejectPayment(paymentId: string): void {
  const payments = getPayments();
  const updated = payments.map((p) =>
    p.id === paymentId ? { ...p, status: "rejected" as const } : p,
  );
  savePayments(updated);
  adminLog("reject_payment", paymentId, `Rejected payment ${paymentId}`);
}

export function adminUpdateWithdrawal(
  withdrawalId: string,
  status: "approved" | "rejected",
): void {
  const withdrawals = getWithdrawals();
  const updated = withdrawals.map((w) =>
    w.id === withdrawalId ? { ...w, status } : w,
  );
  saveWithdrawals(updated);
  adminLog(
    status === "approved" ? "approve_withdrawal" : "reject_withdrawal",
    withdrawalId,
    `${status === "approved" ? "Processed" : "Rejected"} withdrawal ${withdrawalId}`,
  );
}

export function adminAdjustBalance(
  userPhone: string,
  newBalance: number,
): void {
  const key = `fsc_user_${userPhone}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const user = JSON.parse(raw) as FscUser;
      user.balance = newBalance;
      localStorage.setItem(key, JSON.stringify(user));
    } catch {
      // skip
    }
  }
}

export function adminUpdateUpi(
  userPhone: string,
  upiId: string,
  upiName: string,
): void {
  const key = `fsc_user_${userPhone}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const user = JSON.parse(raw) as FscUser;
      user.upiId = upiId;
      user.upiName = upiName;
      localStorage.setItem(key, JSON.stringify(user));
    } catch {
      // skip
    }
  }
}

export function getAllKycAdmin(): Array<
  KycData & { userId: string; userName: string; userPhone: string }
> {
  const result: Array<
    KycData & { userId: string; userName: string; userPhone: string }
  > = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("fsc_kyc_")) {
      const userId = key.replace("fsc_kyc_", "");
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const data = JSON.parse(raw) as KycData;
          let userName = userId;
          let userPhone = "";
          const allUsersKeys: string[] = [];
          for (let j = 0; j < localStorage.length; j++) {
            const k2 = localStorage.key(j);
            if (k2?.startsWith("fsc_user_")) allUsersKeys.push(k2);
          }
          for (const uk of allUsersKeys) {
            const ur = localStorage.getItem(uk);
            if (ur) {
              try {
                const u = JSON.parse(ur) as FscUser;
                if (u.uniqueId === userId) {
                  userName = u.name;
                  userPhone = u.phone;
                  break;
                }
              } catch {
                // skip
              }
            }
          }
          result.push({ ...data, userId, userName, userPhone });
        }
      } catch {
        // skip
      }
    }
  }
  return result;
}

export function adminApproveKyc(userId: string): void {
  const key = `fsc_kyc_${userId}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const data = JSON.parse(raw) as KycData;
      data.status = "verified";
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // skip
    }
  }
  adminLog("approve_kyc", userId, `Approved KYC for user ${userId}`);
}

export function adminRejectKyc(userId: string): void {
  const key = `fsc_kyc_${userId}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const data = JSON.parse(raw) as KycData;
      data.status = "rejected";
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // skip
    }
  }
  adminLog("reject_kyc", userId, `Rejected KYC for user ${userId}`);
}

export function getAllTicketsAdmin(): Array<
  SupportTicketLocal & { userName: string; userPhone: string }
> {
  const result: Array<
    SupportTicketLocal & { userName: string; userPhone: string }
  > = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("fsc_tickets_")) {
      const userId = key.replace("fsc_tickets_", "");
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const tickets = JSON.parse(raw) as SupportTicketLocal[];
          let userName = userId;
          let userPhone = "";
          for (let j = 0; j < localStorage.length; j++) {
            const k2 = localStorage.key(j);
            if (k2?.startsWith("fsc_user_")) {
              const ur = localStorage.getItem(k2);
              if (ur) {
                try {
                  const u = JSON.parse(ur) as FscUser;
                  if (u.uniqueId === userId) {
                    userName = u.name;
                    userPhone = u.phone;
                    break;
                  }
                } catch {
                  // skip
                }
              }
            }
          }
          for (const t of tickets) result.push({ ...t, userName, userPhone });
        }
      } catch {
        // skip
      }
    }
  }
  return result;
}

export function adminCloseTicket(userId: string, ticketId: string): void {
  const key = `fsc_tickets_${userId}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const tickets = JSON.parse(raw) as SupportTicketLocal[];
      const updated = tickets.map((t) =>
        t.id === ticketId ? { ...t, status: "resolved" as const } : t,
      );
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {
      // skip
    }
  }
  adminLog("close_ticket", userId, `Closed ticket ${ticketId}`);
}

// ─── Feature 1: Balance Adjustment History ────────────────────────────────────

export function adminLogBalanceAdjustment(
  userId: string,
  userName: string,
  oldBalance: number,
  newBalance: number,
  reason: string,
): void {
  const entry: BalanceAdjustment = {
    id: Date.now().toString(),
    userId,
    userName,
    oldBalance,
    newBalance,
    reason,
    timestamp: new Date().toISOString(),
  };
  const existing = getBalanceAdjustmentLog();
  existing.unshift(entry);
  localStorage.setItem(
    "fsc_balance_log",
    JSON.stringify(existing.slice(0, 100)),
  );
  adminLog(
    "adjust_balance",
    userName,
    `Balance: ${formatInr(oldBalance)} → ${formatInr(newBalance)} (${reason || "No reason"})`,
  );
}

export function getBalanceAdjustmentLog(): BalanceAdjustment[] {
  try {
    const raw = localStorage.getItem("fsc_balance_log");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getUserBalanceLog(userId: string): BalanceAdjustment[] {
  return getBalanceAdjustmentLog().filter((e) => e.userId === userId);
}

// ─── Feature 5: User Suspension ──────────────────────────────────────────────

export function adminSuspendUser(phone: string, reason: string): void {
  const key = `fsc_user_${phone}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const user = JSON.parse(raw) as FscUser;
      user.suspended = true;
      user.suspensionReason = reason;
      localStorage.setItem(key, JSON.stringify(user));
      adminLog("suspend_user", user.name, `Suspended: ${reason}`);
    } catch {
      // skip
    }
  }
}

export function adminUnsuspendUser(phone: string): void {
  const key = `fsc_user_${phone}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const user = JSON.parse(raw) as FscUser;
      user.suspended = false;
      user.suspensionReason = undefined;
      localStorage.setItem(key, JSON.stringify(user));
      adminLog("unsuspend_user", user.name, "Account unsuspended");
    } catch {
      // skip
    }
  }
}

export function isUserFrozen(phone: string): boolean {
  try {
    const raw = localStorage.getItem(`fsc_user_${phone}`);
    if (!raw) return false;
    const user = JSON.parse(raw) as FscUser;
    return user.suspended === true;
  } catch {
    return false;
  }
}

// ─── Feature 6: User Activity ────────────────────────────────────────────────

export function getUserActivity(userId: string): UserActivity {
  try {
    const raw = localStorage.getItem(`fsc_activity_${userId}`);
    return raw
      ? JSON.parse(raw)
      : { lastLogin: "", totalLogins: 0, pagesVisited: [] };
  } catch {
    return { lastLogin: "", totalLogins: 0, pagesVisited: [] };
  }
}

export function saveUserActivity(userId: string, activity: UserActivity): void {
  localStorage.setItem(`fsc_activity_${userId}`, JSON.stringify(activity));
}

export function recordUserActivity(userId: string, page: string): void {
  const act = getUserActivity(userId);
  const pages = [page, ...act.pagesVisited.filter((p) => p !== page)].slice(
    0,
    20,
  );
  saveUserActivity(userId, {
    ...act,
    pagesVisited: pages,
  });
}

// ─── Feature 7: Manual Referral Credit ───────────────────────────────────────

export function adminAddReferralBonus(userId: string, amount: number): void {
  // Find the user
  const users = getAllUsers();
  const user = users.find((u) => u.uniqueId === userId);
  if (!user) return;

  let ref = getReferralData(userId);
  if (!ref) {
    ref = {
      referralCode: `FSC${userId}`,
      referredFriends: [],
      referralEarnings: 0,
    };
  }
  ref.referralEarnings += amount;
  saveReferralData(userId, ref);
  adminLog(
    "manual_referral",
    user.name,
    `Added referral bonus: ${formatInr(amount)}`,
  );
}

// ─── Feature 8: User Notes/Tags ──────────────────────────────────────────────

export function adminSaveUserNote(userId: string, note: UserNote): void {
  localStorage.setItem(`fsc_admin_note_${userId}`, JSON.stringify(note));
}

export function adminGetUserNote(userId: string): UserNote {
  try {
    const raw = localStorage.getItem(`fsc_admin_note_${userId}`);
    return raw ? JSON.parse(raw) : { tags: [], note: "" };
  } catch {
    return { tags: [], note: "" };
  }
}

// ─── Feature 9: Active Plan Monitor ──────────────────────────────────────────

export function getAllActivePlans(): Array<
  ActivePlan & { userName: string; userPhone: string }
> {
  const result: Array<ActivePlan & { userName: string; userPhone: string }> =
    [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("fsc_active_plan_")) {
      const userId = key.replace("fsc_active_plan_", "");
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const plan = JSON.parse(raw) as ActivePlan;
          let userName = userId;
          let userPhone = "";
          for (let j = 0; j < localStorage.length; j++) {
            const k2 = localStorage.key(j);
            if (k2?.startsWith("fsc_user_")) {
              const ur = localStorage.getItem(k2);
              if (ur) {
                try {
                  const u = JSON.parse(ur) as FscUser;
                  if (u.uniqueId === userId) {
                    userName = u.name;
                    userPhone = u.phone;
                    break;
                  }
                } catch {
                  // skip
                }
              }
            }
          }
          result.push({ ...plan, userName, userPhone });
        }
      } catch {
        // skip
      }
    }
  }
  return result;
}

export function adminForceClosePlan(userId: string): void {
  const key = `fsc_active_plan_${userId}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const plan = JSON.parse(raw) as ActivePlan;
      plan.earnedSoFar = plan.planAmount * PLAN_TARGET_MULTIPLIER;
      plan.status = "closed";
      localStorage.setItem(key, JSON.stringify(plan));
      adminLog(
        "force_close_plan",
        userId,
        `Force closed plan: ${plan.planName}`,
      );
    } catch {
      // skip
    }
  }
}

export function adminExtendPlan(userId: string, days: number): void {
  const key = `fsc_active_plan_${userId}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const plan = JSON.parse(raw) as ActivePlan;
      const expiry = new Date(plan.expiryDate);
      expiry.setDate(expiry.getDate() + days);
      plan.expiryDate = expiry.toISOString();
      localStorage.setItem(key, JSON.stringify(plan));
      adminLog("extend_plan", userId, `Extended plan by ${days} days`);
    } catch {
      // skip
    }
  }
}

// ─── Feature 11: Custom Plans ─────────────────────────────────────────────────

export function getCustomPlans(): CustomPlan[] {
  try {
    const raw = localStorage.getItem("fsc_custom_plans");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomPlan(plan: CustomPlan): void {
  const existing = getCustomPlans();
  existing.push(plan);
  localStorage.setItem("fsc_custom_plans", JSON.stringify(existing));
  adminLog(
    "create_plan",
    "system",
    `Created custom plan: ${plan.name} at ${formatInr(plan.price)}`,
  );
}

export function deleteCustomPlan(planId: string): void {
  const existing = getCustomPlans().filter((p) => p.id !== planId);
  localStorage.setItem("fsc_custom_plans", JSON.stringify(existing));
  adminLog("delete_plan", "system", `Deleted custom plan ${planId}`);
}

// ─── Feature 12: Broadcasts ───────────────────────────────────────────────────

export function getBroadcasts(): Broadcast[] {
  try {
    const raw = localStorage.getItem("fsc_broadcasts");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBroadcasts(broadcasts: Broadcast[]): void {
  localStorage.setItem("fsc_broadcasts", JSON.stringify(broadcasts));
}

export function markBroadcastRead(broadcastId: string, userId: string): void {
  const broadcasts = getBroadcasts();
  const updated = broadcasts.map((b) =>
    b.id === broadcastId && !b.read.includes(userId)
      ? { ...b, read: [...b.read, userId] }
      : b,
  );
  saveBroadcasts(updated);
}

// ─── Feature 13: Direct Messages ─────────────────────────────────────────────

export function getAdminDms(userId: string): AdminDm[] {
  try {
    const raw = localStorage.getItem(`fsc_dm_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function sendAdminDm(userId: string, message: string): void {
  const existing = getAdminDms(userId);
  const dm: AdminDm = {
    id: Date.now().toString(),
    message,
    date: new Date().toISOString(),
    read: false,
  };
  existing.push(dm);
  localStorage.setItem(`fsc_dm_${userId}`, JSON.stringify(existing));
  // Find user name for log
  const users = getAllUsers();
  const user = users.find((u) => u.uniqueId === userId);
  adminLog(
    "send_dm",
    user?.name ?? userId,
    `Sent message: ${message.slice(0, 50)}`,
  );
}

export function markDmRead(userId: string, dmId: string): void {
  const dms = getAdminDms(userId);
  const updated = dms.map((d) => (d.id === dmId ? { ...d, read: true } : d));
  localStorage.setItem(`fsc_dm_${userId}`, JSON.stringify(updated));
}

export function markAllDmsRead(userId: string): void {
  const dms = getAdminDms(userId);
  const updated = dms.map((d) => ({ ...d, read: true }));
  localStorage.setItem(`fsc_dm_${userId}`, JSON.stringify(updated));
}

export function getUnreadDmCount(userId: string): number {
  return getAdminDms(userId).filter((d) => !d.read).length;
}

// ─── Feature 14: Announcement Banner ─────────────────────────────────────────

export function getAnnouncement(): string | null {
  return localStorage.getItem("fsc_announcement");
}

export function setAnnouncement(text: string): void {
  localStorage.setItem("fsc_announcement", text);
  adminLog(
    "set_announcement",
    "system",
    `Set announcement: ${text.slice(0, 50)}`,
  );
}

export function clearAnnouncement(): void {
  localStorage.removeItem("fsc_announcement");
  adminLog("clear_announcement", "system", "Cleared announcement banner");
}

// ─── Feature 15: Admin Action Log ────────────────────────────────────────────

export function adminLog(
  action: string,
  targetUser: string,
  detail: string,
): void {
  const entry: AdminLogEntry = {
    id: Date.now().toString() + Math.random().toString(36).slice(2),
    action,
    targetUser,
    detail,
    timestamp: new Date().toISOString(),
  };
  const existing = getAdminLog();
  existing.unshift(entry);
  localStorage.setItem("fsc_admin_log", JSON.stringify(existing.slice(0, 500)));
}

export function getAdminLog(): AdminLogEntry[] {
  try {
    const raw = localStorage.getItem("fsc_admin_log");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearAdminLog(): void {
  localStorage.setItem("fsc_admin_log", JSON.stringify([]));
}

// ─── Feature 17: Blocklist ────────────────────────────────────────────────────

export function getBlocklist(): BlocklistEntry[] {
  try {
    const raw = localStorage.getItem("fsc_blocklist");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToBlocklist(phone: string, reason: string): void {
  const existing = getBlocklist();
  if (!existing.find((e) => e.phone === phone)) {
    existing.push({ phone, reason, date: new Date().toISOString() });
    localStorage.setItem("fsc_blocklist", JSON.stringify(existing));
    adminLog("block_user", phone, `Blocked: ${reason}`);
  }
}

export function removeFromBlocklist(phone: string): void {
  const existing = getBlocklist().filter((e) => e.phone !== phone);
  localStorage.setItem("fsc_blocklist", JSON.stringify(existing));
  adminLog("unblock_user", phone, "Removed from blocklist");
}

export function isBlocked(phone: string): boolean {
  return getBlocklist().some((e) => e.phone === phone);
}

// ─── Feature 4: Payout Scheduler ─────────────────────────────────────────────

export function getPayoutSchedule(): string | null {
  return localStorage.getItem("fsc_payout_schedule");
}

export function setPayoutSchedule(time: string): void {
  localStorage.setItem("fsc_payout_schedule", time);
  adminLog("set_payout_schedule", "system", `Set payout schedule to ${time}`);
}

export function clearPayoutSchedule(): void {
  localStorage.removeItem("fsc_payout_schedule");
  adminLog("clear_payout_schedule", "system", "Cleared payout schedule");
}

export function checkAndRunPayoutSchedule(): number {
  const schedule = getPayoutSchedule();
  if (!schedule) return 0;
  const now = new Date();
  const [hh, mm] = schedule.split(":").map(Number);
  if (now.getHours() === hh && now.getMinutes() === mm) {
    const lastRun = localStorage.getItem("fsc_payout_last_run");
    const today = now.toDateString();
    if (lastRun === today) return 0;
    // Run all pending withdrawals
    const pending = getWithdrawals().filter((w) => w.status === "pending");
    for (const w of pending) {
      adminUpdateWithdrawal(w.id, "approved");
    }
    localStorage.setItem("fsc_payout_last_run", today);
    return pending.length;
  }
  return 0;
}

// ─── Maintenance Mode ─────────────────────────────────────────────────────────

export function isMaintenanceMode(): boolean {
  return localStorage.getItem("fsc_maintenance_mode") === "true";
}

export function setMaintenanceMode(enabled: boolean): void {
  localStorage.setItem("fsc_maintenance_mode", enabled ? "true" : "false");
}
