import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  ArrowLeftRight,
  Award,
  BadgeDollarSign,
  BarChart2,
  Bell,
  BookOpen,
  Briefcase,
  Calculator,
  CheckCircle2,
  ClipboardList,
  Copy,
  Gift,
  Headphones,
  History,
  Home,
  LogOut,
  MessageCircle,
  Moon,
  Settings2,
  Shield,
  ShieldCheck,
  Star,
  Sun,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  type FscUser,
  getCurrentUser,
  getKycData,
  getPayments,
  getTheme,
  getUnreadDmCount,
  getVipTier,
  getVipTierColor,
  getVipTierLabel,
  saveUser,
  setTheme,
} from "../types/fsc";

interface AppMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const MENU_GROUPS = [
  {
    label: "Trading",
    items: [
      { label: "Home", icon: Home, page: "home" },
      { label: "Markets", icon: BarChart2, page: "stocks" },
      { label: "My Active Plan", icon: TrendingUp, page: "plan-details" },
      { label: "Portfolio", icon: Briefcase, page: "portfolio" },
      { label: "Price Alerts", icon: Bell, page: "price-alerts" },
    ],
  },
  {
    label: "Earnings",
    items: [
      { label: "Daily Rewards", icon: Gift, page: "daily-rewards" },
      { label: "Referral", icon: Users, page: "referral" },
      {
        label: "Earning Calculator",
        icon: Calculator,
        page: "earning-calculator",
      },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Add Funds", icon: BadgeDollarSign, page: "add-funds" },
      { label: "Withdrawal", icon: Wallet, page: "withdrawal" },
      { label: "Messages", icon: MessageCircle, page: "messages" },
      {
        label: "Transaction History",
        icon: ArrowLeftRight,
        page: "transaction-history",
      },
      { label: "Verifying", icon: CheckCircle2, page: "verifying" },
      {
        label: "Withdrawal History",
        icon: History,
        page: "withdrawal-history",
      },
    ],
  },
  {
    label: "Profile",
    items: [
      { label: "My Profile", icon: Shield, page: "profile" },
      { label: "KYC Verification", icon: ClipboardList, page: "kyc" },
      { label: "VIP Tiers", icon: Star, page: "vip-tiers" },
      { label: "Achievements", icon: Award, page: "achievements" },
      { label: "Login Activity", icon: BookOpen, page: "login-activity" },
      { label: "Leaderboard", icon: Trophy, page: "leaderboard" },
    ],
  },
  {
    label: "Help",
    items: [{ label: "Support Center", icon: Headphones, page: "support" }],
  },
];

export default function AppMenu({
  isOpen,
  onOpenChange,
  onNavigate,
  onLogout,
}: AppMenuProps) {
  const [user, setUser] = useState<FscUser | null>(null);
  const [idCopied, setIdCopied] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [_unreadDms, setUnreadDms] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const u = getCurrentUser();
      setUser(u);
      setIsDark(getTheme() === "dark");
      if (u) setUnreadDms(getUnreadDmCount(u.uniqueId));
    }
  }, [isOpen]);

  function handleCopyId() {
    if (!user?.uniqueId) return;
    navigator.clipboard.writeText(user.uniqueId).then(() => {
      setIdCopied(true);
      toast.success("User ID copied!");
      setTimeout(() => setIdCopied(false), 2000);
    });
  }

  function handleItemClick(page: string) {
    onOpenChange(false);
    setTimeout(() => onNavigate(page), 150);
  }

  function handleToggleTheme() {
    const next = isDark ? "light" : "dark";
    setIsDark(!isDark);
    setTheme(next);
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(next);
    toast.success(`Switched to ${next} mode`);
  }

  function handleProfilePicChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const updated: FscUser = { ...user, profilePic: base64 };
      saveUser(updated);
      setUser(updated);
      toast.success("Profile picture updated!");
    };
    reader.readAsDataURL(file);
  }

  const allPayments = getPayments();
  const myApproved = user
    ? allPayments.filter(
        (p) => p.userId === user.uniqueId && p.status === "approved",
      )
    : [];
  const totalInvested = myApproved.reduce((s, p) => s + p.amount, 0);
  const tier = getVipTier(totalInvested);
  const tierColor = getVipTierColor(tier);
  const tierLabel = getVipTierLabel(tier);

  const kycData = user ? getKycData(user.uniqueId) : null;

  const completionSteps = [
    !!user?.name,
    !!user?.phone,
    !!user?.profilePic,
    !!user?.upiId,
    !!(kycData?.status === "verified"),
  ];
  const completionPct = Math.round(
    (completionSteps.filter(Boolean).length / completionSteps.length) * 100,
  );

  // Multi-letter initials: first letter of each name word, max 2
  const initials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map((n) => n[0]?.toUpperCase() ?? "")
        .filter(Boolean)
        .slice(0, 2)
        .join("")
    : "?";

  // Avatar size increased to 64px for better clarity
  const AVATAR_SIZE = 64;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[300px] p-0 overflow-y-auto"
        style={{
          background: "oklch(0.08 0.04 240)",
          borderRight: "1px solid oklch(0.65 0.22 220 / 0.15)",
          boxShadow: "4px 0 40px oklch(0 0 0 / 0.6)",
        }}
      >
        {/* Profile Header — overflow:visible so tier badge is NOT clipped */}
        <div
          className="p-5 pb-4"
          style={{
            background:
              "linear-gradient(160deg, oklch(0.13 0.055 235) 0%, oklch(0.09 0.038 240) 100%)",
            borderBottom: "1px solid oklch(0.65 0.22 220 / 0.14)",
            position: "relative",
            overflow: "visible",
          }}
        >
          {/* Top blue accent line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background:
                "linear-gradient(90deg, transparent, oklch(0.65 0.22 220 / 0.8) 30%, oklch(0.82 0.18 200) 50%, oklch(0.65 0.22 220 / 0.8) 70%, transparent)",
            }}
          />

          {/* Extra paddingBottom so tier badge (bottom:-3) is never clipped */}
          <div
            className="flex items-start gap-3 mb-4"
            style={{ paddingBottom: 10 }}
          >
            {/* paddingBottom: 10 gives the tier badge room below the avatar */}
            <div
              className="relative"
              style={{ flexShrink: 0, paddingBottom: 10 }}
            >
              {/* Blue gradient border for avatar — 3px padding for clarity */}
              <button
                type="button"
                style={{
                  padding: 3,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.22 220), oklch(0.72 0.18 195))",
                  display: "inline-block",
                  cursor: "pointer",
                  border: "none",
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div
                  style={{
                    width: AVATAR_SIZE,
                    height: AVATAR_SIZE,
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: "oklch(0.13 0.05 240)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {user?.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: "1.45rem",
                        fontWeight: 800,
                        color: "white",
                        fontFamily: "'Playfair Display', Georgia, serif",
                        lineHeight: 1,
                        userSelect: "none",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {initials}
                    </span>
                  )}
                </div>
              </button>
              {/* Tier badge — positioned with enough room to show fully */}
              <span
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: -6,
                  background: tierColor,
                  color: "oklch(0.06 0.02 240)",
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: 999,
                  boxShadow: `0 0 10px ${tierColor}99`,
                  border: "2px solid oklch(0.08 0.04 240)",
                  whiteSpace: "nowrap",
                  zIndex: 2,
                  letterSpacing: "0.03em",
                }}
              >
                {tierLabel}
              </span>
            </div>
            <div
              className="flex-1 pt-1"
              style={{ minWidth: 0, overflow: "hidden" }}
            >
              {/* Name — solid visible text, full width (no fixed maxWidth) */}
              <p
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "oklch(0.96 0.008 200)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                  marginBottom: 2,
                }}
              >
                {user?.name ?? "—"}
              </p>
              {/* Phone */}
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "oklch(0.48 0.06 220)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginBottom: 4,
                }}
              >
                {user?.phone ? `+91 ${user.phone}` : ""}
              </p>
              {/* Balance */}
              {user && (
                <p
                  className="text-xs font-bold mt-1"
                  style={{
                    background:
                      "linear-gradient(90deg, oklch(0.82 0.16 210), oklch(0.65 0.22 228))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  ₹
                  {user.balance.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              )}
              {/* KYC badge — larger, with background, clearly visible */}
              {kycData?.status === "verified" && (
                <span
                  className="inline-flex items-center gap-1 mt-1.5"
                  style={{
                    background: "oklch(0.25 0.08 145)",
                    color: "oklch(0.80 0.18 145)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 999,
                    border: "1px solid oklch(0.40 0.14 145 / 0.5)",
                    letterSpacing: "0.02em",
                  }}
                >
                  <ShieldCheck
                    style={{ width: 13, height: 13, flexShrink: 0 }}
                  />
                  KYC Verified
                </span>
              )}
            </div>
          </div>

          {/* User ID */}
          <button
            type="button"
            onClick={handleCopyId}
            className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 mb-3 transition-all"
            style={{
              background: "oklch(0.12 0.048 238)",
              border: "1px solid oklch(0.65 0.22 220 / 0.20)",
              borderTop: "1px solid oklch(0.65 0.22 220 / 0.38)",
              boxShadow: "0 2px 10px oklch(0 0 0 / 0.3)",
            }}
            data-ocid="menu.copy.button"
          >
            <div>
              <p style={{ fontSize: "0.7rem", color: "oklch(0.48 0.06 220)" }}>
                User ID
              </p>
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "oklch(0.72 0.20 215)",
                  letterSpacing: "0.1em",
                }}
              >
                #{user?.uniqueId ?? "--------"}
              </p>
            </div>
            <Copy
              style={{
                width: 14,
                height: 14,
                color: idCopied
                  ? "oklch(0.68 0.18 145)"
                  : "oklch(0.50 0.06 225)",
                transition: "color 0.2s ease",
              }}
            />
          </button>

          {/* Profile completion */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span
                style={{ color: "oklch(0.48 0.06 220)", fontSize: "0.7rem" }}
              >
                Profile Completion
              </span>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  color:
                    completionPct === 100
                      ? "oklch(0.68 0.18 145)"
                      : "oklch(0.72 0.20 215)",
                }}
              >
                {completionPct}%
              </span>
            </div>
            <Progress
              value={completionPct}
              className="h-2"
              style={{
                background: "oklch(0.16 0.05 235)",
              }}
            />
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="px-3 py-3">
          {MENU_GROUPS.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? "mt-3" : ""}>
              <p
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  padding: "0 8px",
                  marginBottom: 6,
                  color: "oklch(0.55 0.14 220)",
                }}
              >
                {group.label}
              </p>
              {group.items.map((item) => (
                <button
                  key={item.page}
                  type="button"
                  onClick={() => handleItemClick(item.page)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 mb-0.5"
                  style={{ color: "oklch(0.82 0.02 215)" }}
                  onMouseEnter={(e) => {
                    const btn = e.currentTarget as HTMLButtonElement;
                    btn.style.background = "oklch(0.14 0.05 235)";
                    btn.style.color = "oklch(0.85 0.16 210)";
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget as HTMLButtonElement;
                    btn.style.background = "transparent";
                    btn.style.color = "oklch(0.82 0.02 215)";
                  }}
                  data-ocid={`menu.${item.page}.link`}
                >
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: "oklch(0.65 0.18 215)",
                    }}
                  >
                    <item.icon style={{ width: 15, height: 15 }} />
                  </span>
                  <span style={{ fontWeight: 500 }}>{item.label}</span>
                </button>
              ))}
              {gi < MENU_GROUPS.length - 1 && (
                <Separator
                  className="mt-3"
                  style={{ background: "oklch(0.17 0.05 235)" }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Bottom: Theme + Admin Panel + Logout */}
        <div
          className="px-4 py-4 mt-2"
          style={{ borderTop: "1px solid oklch(0.17 0.05 235)" }}
        >
          <button
            type="button"
            onClick={handleToggleTheme}
            className="w-full flex items-center justify-between rounded-xl px-3 py-3 mb-2 transition-all"
            style={{
              background: "oklch(0.12 0.045 238)",
              border: "1px solid oklch(0.22 0.06 232)",
            }}
            data-ocid="menu.theme.toggle"
          >
            <span
              className="text-sm font-medium flex items-center gap-2.5"
              style={{ color: "oklch(0.85 0.02 215)" }}
            >
              {isDark ? (
                <Moon
                  style={{
                    width: 16,
                    height: 16,
                    color: "oklch(0.65 0.18 265)",
                  }}
                />
              ) : (
                <Sun
                  style={{
                    width: 16,
                    height: 16,
                    color: "oklch(0.75 0.18 80)",
                  }}
                />
              )}
              {isDark ? "Dark Mode" : "Light Mode"}
            </span>
            <div
              className="w-10 h-5 rounded-full relative transition-all"
              style={{
                background: isDark
                  ? "linear-gradient(90deg, oklch(0.62 0.22 220 / 0.5), oklch(0.55 0.22 230 / 0.35))"
                  : "oklch(0.50 0.18 220 / 0.3)",
                border: isDark
                  ? "1px solid oklch(0.62 0.22 220 / 0.4)"
                  : "1px solid oklch(0.50 0.18 220 / 0.35)",
              }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                style={{
                  background: isDark
                    ? "linear-gradient(135deg, oklch(0.82 0.18 210), oklch(0.65 0.22 228))"
                    : "oklch(0.55 0.18 215)",
                  left: isDark ? "calc(100% - 18px)" : "2px",
                  boxShadow: isDark
                    ? "0 0 6px oklch(0.65 0.22 220 / 0.6)"
                    : "none",
                }}
              />
            </div>
          </button>

          {/* Admin Panel Button — blue shimmer */}
          <button
            type="button"
            onClick={() => handleItemClick("admin-panel")}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-3 mb-2 text-sm font-semibold transition-all relative overflow-hidden"
            style={{
              background: "oklch(0.12 0.05 238)",
              border: "1px solid oklch(0.65 0.22 220 / 0.38)",
              color: "oklch(0.78 0.18 215)",
              boxShadow: "0 0 20px oklch(0.55 0.22 220 / 0.08)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "oklch(0.65 0.22 220 / 0.14)";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "oklch(0.65 0.22 220 / 0.65)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 28px oklch(0.55 0.22 220 / 0.20)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "oklch(0.12 0.05 238)";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "oklch(0.65 0.22 220 / 0.38)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 20px oklch(0.55 0.22 220 / 0.08)";
            }}
            data-ocid="menu.admin-panel.button"
          >
            {/* Shimmer line at top */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, oklch(0.72 0.18 210 / 0.7) 50%, transparent)",
              }}
            />
            <Settings2 style={{ width: 16, height: 16 }} />
            Admin Panel
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              setTimeout(onLogout, 150);
            }}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all"
            style={{
              color: "oklch(0.65 0.22 22)",
              border: "1px solid oklch(0.65 0.22 22 / 0.22)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "oklch(0.65 0.22 22 / 0.08)";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "oklch(0.65 0.22 22 / 0.45)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "oklch(0.65 0.22 22 / 0.22)";
            }}
            data-ocid="menu.logout.button"
          >
            <LogOut style={{ width: 16, height: 16 }} />
            Sign Out
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleProfilePicChange}
        />
      </SheetContent>
    </Sheet>
  );
}
