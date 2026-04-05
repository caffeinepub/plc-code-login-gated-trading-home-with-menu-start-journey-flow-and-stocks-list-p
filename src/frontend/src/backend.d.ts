import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SupportTicket {
    status: TicketStatus;
    subject: string;
    owner: Principal;
    ticketId: bigint;
    message: string;
    timestamp: bigint;
    replies: Array<TicketReply>;
}
export interface UserProfile {
    portfolio: Array<PortfolioEntry>;
    referralCode: string;
    referred: Array<Principal>;
    name: string;
}
export interface UserProfileWithPrincipal {
    principal: Principal;
    portfolio: Array<PortfolioEntry>;
    referralCode: string;
    referred: Array<Principal>;
    name: string;
}

export interface TicketReply {
    sender: Principal;
    message: string;
    timestamp: bigint;
}
export interface LoginActivity {
    deviceDetails: string;
    provider: string;
    user: Principal;
    timestamp: bigint;
    ipAddress: string;
}
export interface VipTierInfo {
    tier: VipTier;
    totalVerifiedDeposits: number;
}
export interface PaymentSubmission {
    utr: string;
    status: PaymentStatus;
    paymentMethod: string;
    screenshotBlobId: string;
    timestamp: bigint;
    amount: number;
}
export interface WithdrawalRequest {
    status: WithdrawalStatus;
    coin: string;
    address: string;
    timestamp: bigint;
    amount: number;
}
export interface PortfolioEntry {
    coin: string;
    amount: number;
}
export enum AchievementType {
    five_referrals = "five_referrals",
    kyc_verified = "kyc_verified",
    ten_k_invested = "ten_k_invested",
    ten_spins = "ten_spins",
    profile_complete = "profile_complete",
    first_withdrawal = "first_withdrawal",
    first_deposit = "first_deposit"
}
export enum KycDocumentType {
    pan = "pan",
    aadhaar = "aadhaar"
}
export enum KycStatus {
    verified = "verified",
    pending = "pending",
    rejected = "rejected"
}
export interface KycSubmission {
    owner: Principal;
    documentType: KycDocumentType;
    documentNumber: string;
    status: KycStatus;
    submittedAtTimestamp: bigint;
    verifiedAtTimestamp: bigint | null;
    blobId: string;
    comments: string;
    rejectionReason: string;
}

export enum TicketStatus {
    closed = "closed",
    open = "open"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum VipTier {
    bronze = "bronze",
    gold = "gold",
    platinum = "platinum",
    silver = "silver"
}
export interface backendInterface {
    _initializeAccessControlWithSecret(userSecret: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    buyStock(planId: bigint): Promise<void>;
    closeTicket(ticketId: bigint): Promise<void>;
    createPriceAlert(coin: string, targetPrice: number, timestamp: bigint): Promise<bigint>;
    createReferralCode(referralCode: string): Promise<void>;
    createStockPlan(name: string, price: number, commission: number, returns: number, currency: string, timestamp: bigint): Promise<bigint>;
    deletePriceAlert(alertId: bigint): Promise<void>;
    getAllPayments(): Promise<Array<[Principal, Array<PaymentSubmission>]>>;
    getAllTickets(): Promise<Array<SupportTicket>>;
    getAllWithdrawals(): Promise<Array<[Principal, Array<WithdrawalRequest>]>>;
    getBalance(user: Principal): Promise<number>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getKycStatus(): Promise<KycStatus>;
    getLastLogins(): Promise<Array<LoginActivity>>;
    getUserBalance(): Promise<number>;
    getUserPayments(): Promise<Array<PaymentSubmission>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserTickets(): Promise<Array<SupportTicket>>;
    getUserWithdrawals(): Promise<Array<WithdrawalRequest>>;
    getVipTier(): Promise<VipTierInfo>;
    isCallerAdmin(): Promise<boolean>;
    recordLoginActivity(ip: string, provider: string, deviceDetails: string, timestamp: bigint): Promise<void>;
    registerReferral(referrerCode: string): Promise<void>;
    replyToTicket(ticketId: bigint, message: string, timestamp: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitKyc(documentType: KycDocumentType, documentNumber: string, blobId: string, comments: string, timestamp: bigint): Promise<void>;
    submitPayment(utr: string, amount: number, paymentMethod: string, screenshotBlobId: string, timestamp: bigint): Promise<void>;
    submitSupportTicket(subject: string, message: string, timestamp: bigint): Promise<bigint>;
    submitWithdrawalRequest(amount: number, coin: string, address: string, timestamp: bigint): Promise<void>;
    unlockAchievement(achievementType: AchievementType, timestamp: bigint): Promise<void>;
    updateKycStatus(user: Principal, newStatus: KycStatus, rejectionReason: string): Promise<void>;
    updatePaymentStatus(user: Principal, utr: string, newStatus: PaymentStatus): Promise<void>;
    updatePortfolio(coin: string, amount: number): Promise<void>;
    updateWithdrawalStatus(user: Principal, timestamp: bigint, newStatus: WithdrawalStatus): Promise<void>;
    getAllKycSubmissions(): Promise<Array<KycSubmission>>;
    getAllUserProfiles(): Promise<Array<UserProfileWithPrincipal>>;
}
