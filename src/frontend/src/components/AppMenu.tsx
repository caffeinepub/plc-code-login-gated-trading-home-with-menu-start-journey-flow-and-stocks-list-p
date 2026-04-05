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
          background: "oklch(0.11 0.022 265)",
          borderRight: "1px solid oklch(0.78 0.18 82 / 0.15)",
        }}
      >
        {/* Profile Header */}
        <div
          className="p-5 pb-4"
          style={{
            background:
              "linear-gradient(160deg, oklch(0.16 0.04 265), oklch(0.11 0.022 265))",
            borderBottom: "1px solid oklch(0.78 0.18 82 / 0.12)",
          }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="relative">
              <Avatar
                className="w-14 h-14 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                style={{ outline: `2px solid ${tierColor}`, outlineOffset: 2 }}
              >
                <AvatarImage src={user?.profilePic} />
                <AvatarFallback
                  className="font-display font-bold text-lg"
                  style={{
                    background: "oklch(0.18 0.03 265)",
                    color: tierColor,
                  }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span
                className="absolute -bottom-1 -right-1 text-xs px-1.5 py-0.5 rounded-full font-bold"
                style={{
                  background: tierColor,
                  color: "oklch(0.1 0.02 265)",
                  fontSize: "0.6rem",
                }}
              >
                {tierLabel}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-foreground truncate text-base">
                {user?.name ?? "\u2014"}
              </p>
              <p className="text-muted-foreground text-xs truncate">
                {user?.phone ?? ""}
              </p>
              {kycData?.status === "verified" && (
                <span
                  className="inline-flex items-center gap-1 text-xs mt-1"
                  style={{ color: "oklch(0.65 0.2 145)" }}
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
            className="w-full flex items-center justify-between rounded-xl px-3 py-2 mb-3"
            style={{
              background: "oklch(0.15 0.03 265)",
              border: "1px solid oklch(0.25 0.04 265)",
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
                  ? "oklch(0.65 0.2 145)"
                  : "oklch(0.55 0.02 265)",
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
                      ? "oklch(0.65 0.2 145)"
                      : "oklch(0.78 0.18 82)",
                }}
              >
                {completionPct}%
              </span>
            </div>
            <Progress
              value={completionPct}
              className="h-1.5"
              style={{ background: "oklch(0.2 0.03 265)" }}
            />
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="px-3 py-3">
          {MENU_GROUPS.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? "mt-3" : ""}>
              <p
                className="text-xs font-bold uppercase tracking-widest px-2 mb-1.5"
                style={{ color: "oklch(0.78 0.18 82 / 0.7)" }}
              >
                {group.label}
              </p>
              {group.items.map((item) => (
                <button
                  key={item.page}
                  type="button"
                  onClick={() => handleItemClick(item.page)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 mb-0.5"
                  style={{ color: "oklch(0.85 0.01 80)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "oklch(0.17 0.03 265)";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "oklch(0.78 0.18 82)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "oklch(0.85 0.01 80)";
                  }}
                  data-ocid={`menu.${item.page}.link`}
                >
                  <item.icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
              {gi < MENU_GROUPS.length - 1 && (
                <Separator
                  className="mt-3"
                  style={{ background: "oklch(0.2 0.03 265)" }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Bottom: Theme + Admin Panel + Logout */}
        <div
          className="px-4 py-4 mt-2"
          style={{ borderTop: "1px solid oklch(0.2 0.03 265)" }}
        >
          <button
            type="button"
            onClick={handleToggleTheme}
            className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 mb-2 transition-all"
            style={{
              background: "oklch(0.15 0.03 265)",
              border: "1px solid oklch(0.25 0.04 265)",
            }}
            data-ocid="menu.theme.toggle"
          >
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              {isDark ? (
                <Moon style={{ width: 16, height: 16 }} />
              ) : (
                <Sun style={{ width: 16, height: 16 }} />
              )}
              {isDark ? "Dark Mode" : "Light Mode"}
            </span>
            <div
              className="w-9 h-5 rounded-full relative transition-all"
              style={{
                background: isDark
                  ? "oklch(0.78 0.18 82 / 0.3)"
                  : "oklch(0.55 0.18 75 / 0.3)",
              }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                style={{
                  background: isDark
                    ? "oklch(0.78 0.18 82)"
                    : "oklch(0.55 0.18 75)",
                  left: isDark ? "calc(100% - 18px)" : "2px",
                }}
              />
            </div>
          </button>

          {/* Admin Panel Button */}
          <button
            type="button"
            onClick={() => handleItemClick("admin-panel")}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 mb-2 text-sm font-semibold transition-all"
            style={{
              background: "oklch(0.14 0.04 265)",
              border: "1px solid oklch(0.78 0.18 82 / 0.3)",
              color: "oklch(0.78 0.18 82)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "oklch(0.78 0.18 82 / 0.12)";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "oklch(0.78 0.18 82 / 0.6)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "oklch(0.14 0.04 265)";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "oklch(0.78 0.18 82 / 0.3)";
            }}
            data-ocid="menu.admin-panel.button"
          >
            <Settings2 style={{ width: 16, height: 16 }} />
            Admin Panel
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              setTimeout(onLogout, 150);
            }}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all"
            style={{
              color: "oklch(0.65 0.22 22)",
              border: "1px solid oklch(0.65 0.22 22 / 0.25)",
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
