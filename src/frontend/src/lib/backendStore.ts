import type { Principal } from "@icp-sdk/core/principal";
import type { backendInterface } from "../backend";
import { KycDocumentType, KycStatus, TicketStatus } from "../backend";
import { createActorWithConfig } from "../config";
import type {
  FscUser,
  KycData,
  PaymentSubmission,
  SupportTicketLocal,
  WithdrawalRequest,
} from "../types/fsc";

export interface AdminPayment {
  principalStr: string;
  utr: string;
  amount: number;
  method: string;
  timestamp: bigint;
  status: "pending" | "approved" | "rejected";
  screenshotBlobId: string;
}

export interface AdminWithdrawal {
  principalStr: string;
  amount: number;
  coin: string;
  address: string;
  timestamp: bigint;
  status: "pending" | "approved" | "rejected";
}

export interface AdminTicket {
  principalStr: string;
  ticketId: bigint;
  subject: string;
  message: string;
  timestamp: bigint;
  status: "open" | "resolved";
}

let backendCache: backendInterface | null = null;

export async function getBackend(): Promise<backendInterface> {
  if (backendCache) return backendCache;
  backendCache = await createActorWithConfig();
  return backendCache;
}

// PaymentStatus and WithdrawalStatus share the same underlying variants as KycStatus
// The backend uses the same enum values: verified/pending/rejected
function mapStatusVariant(
  status: { verified?: null; pending?: null; rejected?: null } | string,
): "pending" | "approved" | "rejected" {
  const s = String(status);
  if (s === KycStatus.verified) return "approved";
  if (s === KycStatus.rejected) return "rejected";
  return "pending";
}

function mapTicketStatus(status: TicketStatus | string): "open" | "resolved" {
  return String(status) === TicketStatus.closed ? "resolved" : "open";
}

export async function ensureUserRole(): Promise<void> {
  try {
    const backend = await getBackend();
    await backend._initializeAccessControlWithSecret("");
  } catch {
    // Role may already be assigned — ignore
  }
}

export async function backendRegisterUser(user: FscUser): Promise<void> {
  // Retry up to 4 times with exponential backoff to handle transient canister connection issues
  let lastError: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      if (attempt > 0) {
        // Invalidate cached backend on retry in case connection was stale
        backendCache = null;
        await new Promise((res) => setTimeout(res, 400 * attempt));
      }
      const backend = await getBackend();
      // Use phone-keyed public registration (no role required - works with anonymous identity)
      await (backend as any).registerUserByPhone(
        user.phone,
        user.name,
        user.uniqueId,
        BigInt(Date.now()),
      );
      return; // success
    } catch (e) {
      lastError = e;
      console.warn(`backendRegisterUser attempt ${attempt + 1} failed:`, e);
    }
  }
  // All retries exhausted - throw so caller knows sync failed
  throw lastError;
}

export async function backendSubmitPayment(
  p: PaymentSubmission,
): Promise<void> {
  try {
    const backend = await getBackend();
    await ensureUserRole();
    await backend.submitPayment(
      p.utr,
      p.amount,
      p.method,
      p.screenshot ?? "",
      BigInt(Date.now()),
    );
  } catch (e) {
    console.warn("backendSubmitPayment failed:", e);
  }
}

export async function backendSubmitWithdrawal(
  w: WithdrawalRequest,
): Promise<void> {
  try {
    const backend = await getBackend();
    await ensureUserRole();
    await backend.submitWithdrawalRequest(
      w.amount,
      "INR",
      w.upiId,
      BigInt(Date.now()),
    );
  } catch (e) {
    console.warn("backendSubmitWithdrawal failed:", e);
  }
}

export async function backendSubmitKyc(
  _userId: string,
  data: KycData,
): Promise<void> {
  try {
    const backend = await getBackend();
    await ensureUserRole();
    const docType =
      data.docType === "pan" ? KycDocumentType.pan : KycDocumentType.aadhaar;
    await backend.submitKyc(
      docType,
      data.docNumber,
      data.docImage ?? "",
      "",
      BigInt(Date.now()),
    );
  } catch (e) {
    console.warn("backendSubmitKyc failed:", e);
  }
}

export async function backendSubmitTicket(
  t: SupportTicketLocal,
): Promise<void> {
  try {
    const backend = await getBackend();
    await ensureUserRole();
    await backend.submitSupportTicket(t.subject, t.message, BigInt(Date.now()));
  } catch (e) {
    console.warn("backendSubmitTicket failed:", e);
  }
}

export async function backendGetAllPayments(): Promise<AdminPayment[]> {
  try {
    const backend = await getBackend();
    const result = await backend.getAllPayments();
    const payments: AdminPayment[] = [];
    for (const [principal, subs] of result) {
      for (const sub of subs) {
        payments.push({
          principalStr: (principal as Principal).toText(),
          utr: sub.utr,
          amount: sub.amount,
          method: sub.paymentMethod,
          timestamp: sub.timestamp,
          status: mapStatusVariant(sub.status as unknown as string),
          screenshotBlobId: sub.screenshotBlobId,
        });
      }
    }
    return payments;
  } catch (e) {
    console.warn("backendGetAllPayments failed:", e);
    return [];
  }
}

export async function backendGetAllWithdrawals(): Promise<AdminWithdrawal[]> {
  try {
    const backend = await getBackend();
    const result = await backend.getAllWithdrawals();
    const withdrawals: AdminWithdrawal[] = [];
    for (const [principal, reqs] of result) {
      for (const req of reqs) {
        withdrawals.push({
          principalStr: (principal as Principal).toText(),
          amount: req.amount,
          coin: req.coin,
          address: req.address,
          timestamp: req.timestamp,
          status: mapStatusVariant(req.status as unknown as string),
        });
      }
    }
    return withdrawals;
  } catch (e) {
    console.warn("backendGetAllWithdrawals failed:", e);
    return [];
  }
}

export async function backendGetAllTickets(): Promise<AdminTicket[]> {
  try {
    const backend = await getBackend();
    const result = await backend.getAllTickets();
    return result.map((t) => ({
      principalStr: (t.owner as Principal).toText(),
      ticketId: t.ticketId,
      subject: t.subject,
      message: t.message,
      timestamp: t.timestamp,
      status: mapTicketStatus(t.status),
    }));
  } catch (e) {
    console.warn("backendGetAllTickets failed:", e);
    return [];
  }
}

export async function backendApprovePayment(
  principalStr: string,
  utr: string,
): Promise<void> {
  try {
    const backend = await getBackend();
    const { Principal } = await import("@icp-sdk/core/principal");
    const principal = Principal.fromText(principalStr);
    // KycStatus.verified has the same underlying value as PaymentStatus.verified
    await backend.updatePaymentStatus(
      principal,
      utr,
      KycStatus.verified as unknown as Parameters<
        typeof backend.updatePaymentStatus
      >[2],
    );
  } catch (e) {
    console.warn("backendApprovePayment failed:", e);
  }
}

export async function backendRejectPayment(
  principalStr: string,
  utr: string,
): Promise<void> {
  try {
    const backend = await getBackend();
    const { Principal } = await import("@icp-sdk/core/principal");
    const principal = Principal.fromText(principalStr);
    await backend.updatePaymentStatus(
      principal,
      utr,
      KycStatus.rejected as unknown as Parameters<
        typeof backend.updatePaymentStatus
      >[2],
    );
  } catch (e) {
    console.warn("backendRejectPayment failed:", e);
  }
}

export async function backendUpdateWithdrawal(
  principalStr: string,
  timestamp: bigint,
  status: "approved" | "rejected",
): Promise<void> {
  try {
    const backend = await getBackend();
    const { Principal } = await import("@icp-sdk/core/principal");
    const principal = Principal.fromText(principalStr);
    const newStatus =
      status === "approved" ? KycStatus.verified : KycStatus.rejected;
    await backend.updateWithdrawalStatus(
      principal,
      timestamp,
      newStatus as unknown as Parameters<
        typeof backend.updateWithdrawalStatus
      >[2],
    );
  } catch (e) {
    console.warn("backendUpdateWithdrawal failed:", e);
  }
}

export async function backendApproveKyc(principalStr: string): Promise<void> {
  try {
    const backend = await getBackend();
    const { Principal } = await import("@icp-sdk/core/principal");
    const principal = Principal.fromText(principalStr);
    await backend.updateKycStatus(principal, KycStatus.verified, "");
  } catch (e) {
    console.warn("backendApproveKyc failed:", e);
  }
}

export async function backendRejectKyc(
  principalStr: string,
  reason: string,
): Promise<void> {
  try {
    const backend = await getBackend();
    const { Principal } = await import("@icp-sdk/core/principal");
    const principal = Principal.fromText(principalStr);
    await backend.updateKycStatus(principal, KycStatus.rejected, reason);
  } catch (e) {
    console.warn("backendRejectKyc failed:", e);
  }
}

export interface AdminUser {
  principalStr: string; // contains phone for phone-keyed users
  name: string;
  referralCode: string; // contains uniqueId for phone-keyed users
  phone?: string;
  uniqueId?: string;
  balance?: number;
  frozen?: boolean;
}

export interface AdminKyc {
  principalStr: string;
  documentType: string;
  documentNumber: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: bigint;
  blobId: string;
  rejectionReason: string;
}

interface _UserProfileWithPrincipal {
  principal: Principal;
  name: string;
  referralCode: string;
}

export interface RegisteredUserBackend {
  phone: string;
  name: string;
  uniqueId: string;
  balance: number;
  frozen: boolean;
  registeredAt: bigint;
}

export async function backendGetAllUsers(): Promise<AdminUser[]> {
  try {
    const backend = await getBackend();
    const result = (await (backend as any).getAllRegisteredUsers()) as Array<{
      phone: string;
      name: string;
      uniqueId: string;
      balance: number;
      frozen: boolean;
      registeredAt: bigint;
    }>;
    return result.map((u) => ({
      principalStr: u.phone, // repurposed field - stores phone for display
      name: u.name,
      referralCode: u.uniqueId,
      phone: u.phone,
      uniqueId: u.uniqueId,
      balance: Number(u.balance),
      frozen: u.frozen,
    }));
  } catch (e) {
    console.warn("backendGetAllUsers failed:", e);
    return [];
  }
}

export async function backendSetUserFrozen(
  phone: string,
  frozen: boolean,
): Promise<void> {
  try {
    const backend = await getBackend();
    await (backend as any).setUserFrozenByPhone(phone, frozen);
  } catch (e) {
    console.warn("backendSetUserFrozen failed:", e);
  }
}

export async function backendIsUserFrozen(phone: string): Promise<boolean> {
  try {
    const backend = await getBackend();
    return (await (backend as any).isUserFrozenByPhone(phone)) as boolean;
  } catch (_e) {
    return false;
  }
}

export async function backendSetMaintenanceMode(on: boolean): Promise<void> {
  try {
    const backend = await getBackend();
    await (backend as any).setMaintenanceMode(on);
  } catch (e) {
    console.warn("backendSetMaintenanceMode failed:", e);
  }
}

export async function backendGetMaintenanceMode(): Promise<boolean> {
  try {
    const backend = await getBackend();
    return (await (backend as any).getMaintenanceMode()) as boolean;
  } catch (_e) {
    return false;
  }
}

export async function backendUpdateUserBalance(
  phone: string,
  balance: number,
): Promise<void> {
  try {
    const backend = await getBackend();
    await (backend as any).updateRegisteredUserBalance(phone, balance);
  } catch (e) {
    console.warn("backendUpdateUserBalance failed:", e);
  }
}

interface _KycSubmission {
  owner: Principal;
  documentType: unknown;
  documentNumber: string;
  status: unknown;
  submittedAtTimestamp: bigint;
  blobId: string;
  rejectionReason: string;
}

export async function backendGetAllKyc(): Promise<AdminKyc[]> {
  try {
    const backend = await getBackend();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: _KycSubmission[] = await (
      backend as any
    ).getAllKycSubmissions();
    return result.map((k) => ({
      principalStr: (k.owner as Principal).toText(),
      documentType: String(k.documentType),
      documentNumber: k.documentNumber,
      status: mapStatusVariant(k.status as unknown as string),
      submittedAt: k.submittedAtTimestamp,
      blobId: k.blobId,
      rejectionReason: k.rejectionReason,
    }));
  } catch (e) {
    console.warn("backendGetAllKyc failed:", e);
    return [];
  }
}
