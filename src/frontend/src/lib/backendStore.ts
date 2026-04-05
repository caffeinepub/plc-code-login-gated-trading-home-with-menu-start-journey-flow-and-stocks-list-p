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

export async function backendRegisterUser(user: FscUser): Promise<void> {
  try {
    const backend = await getBackend();
    await backend.saveCallerUserProfile({
      name: user.name,
      referralCode: `FSC${user.uniqueId}`,
      referred: [],
      portfolio: [],
    });
  } catch (e) {
    console.warn("backendRegisterUser failed:", e);
  }
}

export async function backendSubmitPayment(
  p: PaymentSubmission,
): Promise<void> {
  try {
    const backend = await getBackend();
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
