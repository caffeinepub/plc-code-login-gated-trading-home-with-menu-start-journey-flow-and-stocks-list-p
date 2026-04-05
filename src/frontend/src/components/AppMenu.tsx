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

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[300px] p-0 overflow-y-auto"
        style={{
          background: "oklch(0.09 0.018 265)",
          borderRight: "1px solid oklch(0.78 0.18 82 / 0.15)",
          boxShadow: "4px 0 40px oklch(0 0 0 / 0.6)",
        }}
      >
        {/* Profile Header */}
        <div
          className="p-5 pb-4"
          style={{
            background:
              "linear-gradient(160deg, oklch(0.15 0.038 265) 0%, oklch(0.10 0.020 265) 100%)",
            borderBottom: "1px solid oklch(0.78 0.18 82 / 0.14)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Top gold accent line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background:
                "linear-gradient(90deg, transparent, oklch(0.78 0.18 82 / 0.8) 30%, oklch(0.95 0.14 92) 50%, oklch(0.78 0.18 82 / 0.8) 70%, transparent)",
            }}
          />

          <div className="flex items-start gap-3 mb-4">
            <div className="relative">
              {/* Gradient border for avatar */}
              <div
                style={{
                  padding: 2,
                  borderRadius: "50%",
                  background: `conic-gradient(${tierColor} 0deg, oklch(0.88 0.14 88) 120deg, ${tierColor} 240deg, oklch(0.60 0.10 200) 360deg)`,
                }}
              >
                <Avatar
                  className="w-14 h-14 cursor-pointer block"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <AvatarImage src={user?.profilePic} />
                  <AvatarFallback
                    className="font-display font-bold text-lg"
                    style={{
                      background: "oklch(0.14 0.028 265)",
                      color: tierColor,
                    }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span
                className="absolute -bottom-1 -right-1 text-xs px-1.5 py-0.5 rounded-full font-bold"
                style={{
                  background: tierColor,
                  color: "oklch(0.1 0.02 265)",
                  fontSize: "0.58rem",
                  boxShadow: `0 0 8px ${tierColor}80`,
                }}
              >
                {tierLabel}
              </span>
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <p className="font-display font-bold text-foreground truncate text-base">
                {user?.name ?? "\u2014"}
              </p>
              <p className="text-muted-foreground text-xs truncate">
                {user?.phone ?? ""}
              </p>
              {/* Balance in menu */}
              {user && (
                <p
                  className="text-xs font-bold mt-1"
                  style={{
                    background:
                      "linear-gradient(90deg, oklch(0.88 0.18 84), oklch(0.72 0.20 76))",
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
              {kycData?.status === "verified" && (
                <span
                  className="inline-flex items-center gap-1 text-xs mt-0.5"
                  style={{ color: "oklch(0.68 0.18 145)" }}
                >
                  <CheckCircle2 style={{ width: 10, height: 10 }} /> KYC
                  Verified
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
              background: "oklch(0.13 0.026 265)",
              border: "1px solid oklch(0.78 0.18 82 / 0.15)",
              borderTop: "1px solid oklch(0.78 0.18 82 / 0.35)",
              boxShadow: "0 2px 10px oklch(0 0 0 / 0.3)",
            }}
            data-ocid="menu.copy.button"
          >
            <div>
              <p className="text-xs text-muted-foreground">User ID</p>
              <p className="font-mono text-sm font-bold text-primary tracking-widest">
                #{user?.uniqueId ?? "--------"}
              </p>
            </div>
            <Copy
              style={{
                width: 14,
                height: 14,
                color: idCopied
                  ? "oklch(0.68 0.18 145)"
                  : "oklch(0.55 0.02 265)",
                transition: "color 0.2s ease",
              }}
            />
          </button>

          {/* Profile completion */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Profile Completion</span>
              <span
                className="font-semibold"
                style={{
                  color:
                    completionPct === 100
                      ? "oklch(0.68 0.18 145)"
                      : "oklch(0.82 0.16 84)",
                }}
              >
                {completionPct}%
              </span>
            </div>
            <Progress
              value={completionPct}
              className="h-2.5"
              style={{
                background: "oklch(0.18 0.03 265)",
              }}
            />
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="px-3 py-3">
          {MENU_GROUPS.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? "mt-3" : ""}>
              <p
                className="text-xs font-bold uppercase tracking-widest px-2 mb-1.5"
                style={{ color: "oklch(0.78 0.18 82 / 0.65)" }}
              >
                {group.label}
              </p>
              {group.items.map((item) => (
                <button
                  key={item.page}
                  type="button"
                  onClick={() => handleItemClick(item.page)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-150 mb-0.5 group"
                  style={{ color: "oklch(0.82 0.01 80)" }}
                  onMouseEnter={(e) => {
                    const btn = e.currentTarget as HTMLButtonElement;
                    btn.style.background = "oklch(0.15 0.028 265)";
                    btn.style.color = "oklch(0.84 0.18 86)";
                    const icon = btn.querySelector("svg") as SVGElement | null;
                    if (icon) {
                      const wrapper = icon.parentElement;
                      if (wrapper)
                        wrapper.style.background = "oklch(0.78 0.18 82 / 0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget as HTMLButtonElement;
                    btn.style.background = "transparent";
                    btn.style.color = "oklch(0.82 0.01 80)";
                    const icon = btn.querySelector("svg") as SVGElement | null;
                    if (icon) {
                      const wrapper = icon.parentElement;
                      if (wrapper) wrapper.style.background = "transparent";
                    }
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
                      transition: "background 0.15s ease",
                    }}
                  >
                    <item.icon style={{ width: 15, height: 15 }} />
                  </span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
              {gi < MENU_GROUPS.length - 1 && (
                <Separator
                  className="mt-3"
                  style={{ background: "oklch(0.18 0.028 265)" }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Bottom: Theme + Admin Panel + Logout */}
        <div
          className="px-4 py-4 mt-2"
          style={{ borderTop: "1px solid oklch(0.18 0.028 265)" }}
        >
          <button
            type="button"
            onClick={handleToggleTheme}
            className="w-full flex items-center justify-between rounded-xl px-3 py-3 mb-2 transition-all"
            style={{
              background: "oklch(0.13 0.024 265)",
              border: "1px solid oklch(0.22 0.036 265)",
            }}
            data-ocid="menu.theme.toggle"
          >
            <span className="text-sm font-medium text-foreground flex items-center gap-2.5">
              {isDark ? (
                <Moon
                  style={{
                    width: 16,
                    height: 16,
                    color: "oklch(0.68 0.18 265)",
                  }}
                />
              ) : (
                <Sun
                  style={{
                    width: 16,
                    height: 16,
                    color: "oklch(0.78 0.18 82)",
                  }}
                />
              )}
              {isDark ? "Dark Mode" : "Light Mode"}
            </span>
            <div
              className="w-10 h-5 rounded-full relative transition-all"
              style={{
                background: isDark
                  ? "linear-gradient(90deg, oklch(0.78 0.18 82 / 0.4), oklch(0.78 0.18 82 / 0.25))"
                  : "oklch(0.55 0.18 75 / 0.3)",
                border: isDark
                  ? "1px solid oklch(0.78 0.18 82 / 0.35)"
                  : "1px solid oklch(0.55 0.18 75 / 0.3)",
              }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                style={{
                  background: isDark
                    ? "linear-gradient(135deg, oklch(0.90 0.18 88), oklch(0.74 0.20 78))"
                    : "oklch(0.55 0.18 75)",
                  left: isDark ? "calc(100% - 18px)" : "2px",
                  boxShadow: isDark
                    ? "0 0 6px oklch(0.78 0.18 82 / 0.6)"
                    : "none",
                }}
              />
            </div>
          </button>

          {/* Admin Panel Button — gold shimmer */}
          <button
            type="button"
            onClick={() => handleItemClick("admin-panel")}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-3 mb-2 text-sm font-semibold transition-all relative overflow-hidden"
            style={{
              background: "oklch(0.13 0.038 265)",
              border: "1px solid oklch(0.78 0.18 82 / 0.35)",
              color: "oklch(0.84 0.18 86)",
              boxShadow: "0 0 20px oklch(0.78 0.18 82 / 0.08)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "oklch(0.78 0.18 82 / 0.14)";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "oklch(0.78 0.18 82 / 0.65)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 28px oklch(0.78 0.18 82 / 0.2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "oklch(0.13 0.038 265)";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "oklch(0.78 0.18 82 / 0.35)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 20px oklch(0.78 0.18 82 / 0.08)";
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
                  "linear-gradient(90deg, transparent, oklch(0.88 0.16 88 / 0.7) 50%, transparent)",
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
