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
export interface TicketReply {
    sender: Principal;
    message: string;
    timestamp: bigint;
}
export interface KycSubmission {
    status: KycStatus;
    documentType: KycDocumentType;
    verifiedAtTimestamp?: bigint;
    owner: Principal;
    rejectionReason: string;
    blobId: string;
    comments: string;
    submittedAtTimestamp: bigint;
    documentNumber: string;
}
export interface UserProfileWithPrincipal {
    portfolio: Array<PortfolioEntry>;
    principal: Principal;
    referralCode: string;
    referred: Array<Principal>;
    name: string;
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
export interface RegisteredUser {
    balance: number;
    name: string;
    uniqueId: string;
    frozen: boolean;
    phone: string;
    registeredAt: bigint;
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
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    buyStock(planId: bigint): Promise<void>;
    closeTicket(ticketId: bigint): Promise<void>;
    createPriceAlert(coin: string, targetPrice: number, timestamp: bigint): Promise<bigint>;
    createReferralCode(referralCode: string): Promise<void>;
    createStockPlan(name: string, price: number, commission: number, returns: number, currency: string, timestamp: bigint): Promise<bigint>;
    deletePriceAlert(alertId: bigint): Promise<void>;
    getAllKycSubmissions(): Promise<Array<KycSubmission>>;
    getAllPayments(): Promise<Array<[Principal, Array<PaymentSubmission>]>>;
    getAllRegisteredUsers(): Promise<Array<RegisteredUser>>;
    getAllTickets(): Promise<Array<SupportTicket>>;
    getAllUserProfiles(): Promise<Array<UserProfileWithPrincipal>>;
    getAllWithdrawals(): Promise<Array<[Principal, Array<WithdrawalRequest>]>>;
    getBalance(user: Principal): Promise<number>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getKycStatus(): Promise<KycStatus>;
    getLastLogins(): Promise<Array<LoginActivity>>;
    getMaintenanceMode(): Promise<boolean>;
    getRegisteredUserByPhone(phone: string): Promise<RegisteredUser | null>;
    getUserBalance(): Promise<number>;
    getUserPayments(): Promise<Array<PaymentSubmission>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserTickets(): Promise<Array<SupportTicket>>;
    getUserWithdrawals(): Promise<Array<WithdrawalRequest>>;
    getVipTier(): Promise<VipTierInfo>;
    isCallerAdmin(): Promise<boolean>;
    isUserFrozenByPhone(phone: string): Promise<boolean>;
    recordLoginActivity(ip: string, provider: string, deviceDetails: string, timestamp: bigint): Promise<void>;
    registerReferral(referrerCode: string): Promise<void>;
    registerUserByPhone(phone: string, name: string, uniqueId: string, timestamp: bigint): Promise<void>;
    replyToTicket(ticketId: bigint, message: string, timestamp: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setMaintenanceMode(on: boolean): Promise<void>;
    setUserFrozenByPhone(phone: string, frozen: boolean): Promise<void>;
    submitKyc(documentType: KycDocumentType, documentNumber: string, blobId: string, comments: string, timestamp: bigint): Promise<void>;
    submitPayment(utr: string, amount: number, paymentMethod: string, screenshotBlobId: string, timestamp: bigint): Promise<void>;
    submitSupportTicket(subject: string, message: string, timestamp: bigint): Promise<bigint>;
    submitWithdrawalRequest(amount: number, coin: string, address: string, timestamp: bigint): Promise<void>;
    unlockAchievement(achievementType: AchievementType, timestamp: bigint): Promise<void>;
    updateKycStatus(user: Principal, newStatus: KycStatus, rejectionReason: string): Promise<void>;
    updatePaymentStatus(user: Principal, utr: string, newStatus: PaymentStatus): Promise<void>;
    updatePortfolio(coin: string, amount: number): Promise<void>;
    updateRegisteredUserBalance(phone: string, newBalance: number): Promise<void>;
    updateWithdrawalStatus(user: Principal, timestamp: bigint, newStatus: WithdrawalStatus): Promise<void>;
}
