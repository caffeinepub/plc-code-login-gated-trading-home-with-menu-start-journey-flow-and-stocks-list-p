import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import BottomNav from "./components/BottomNav";
import LoginScreen from "./components/LoginScreen";
import SplashScreen from "./components/SplashScreen";
import Achievements from "./pages/Achievements";
import AddFunds from "./pages/AddFunds";
import AdminPanel from "./pages/AdminPanel";
import DailyRewards from "./pages/DailyRewards";
import EarningCalculator from "./pages/EarningCalculator";
import Home from "./pages/Home";
import KYC from "./pages/KYC";
import Leaderboard from "./pages/Leaderboard";
import LoginActivity from "./pages/LoginActivity";
import Messages from "./pages/Messages";
import PlanDetails from "./pages/PlanDetails";
import Portfolio from "./pages/Portfolio";
import PriceAlerts from "./pages/PriceAlerts";
import Profile from "./pages/Profile";
import Referral from "./pages/Referral";
import Stocks from "./pages/Stocks";
import Support from "./pages/Support";
import TransactionHistory from "./pages/TransactionHistory";
import VIPTiers from "./pages/VIPTiers";
import Verifying from "./pages/Verifying";
import Withdrawal from "./pages/Withdrawal";
import WithdrawalHistory from "./pages/WithdrawalHistory";
import {
  getCurrentUser,
  getTheme,
  isMaintenanceMode,
  isUserFrozen,
  logoutUser,
  recordLogin,
  recordUserActivity,
} from "./types/fsc";

type Page =
  | "home"
  | "add-funds"
  | "stocks"
  | "plan-details"
  | "verifying"
  | "withdrawal"
  | "withdrawal-history"
  | "profile"
  | "referral"
  | "daily-rewards"
  | "portfolio"
  | "transaction-history"
  | "support"
  | "kyc"
  | "vip-tiers"
  | "leaderboard"
  | "price-alerts"
  | "earning-calculator"
  | "achievements"
  | "login-activity"
  | "messages"
  | "admin-panel";

type AppPhase = "splash" | "login" | "app";

const BOTTOM_NAV_PAGES: Page[] = ["home", "stocks", "portfolio"];

export default function App() {
  const [phase, setPhase] = useState<AppPhase>("splash");
  const [page, setPage] = useState<Page>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(() => isMaintenanceMode());

  useEffect(() => {
    const theme = getTheme();
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);
  }, []);

  // Poll freeze status every 10 seconds while in app
  useEffect(() => {
    if (phase !== "app") return;
    const interval = setInterval(() => {
      const user = getCurrentUser();
      if (user) {
        setIsFrozen(isUserFrozen(user.phone));
      }
      setIsMaintenance(isMaintenanceMode());
    }, 3000);
    return () => clearInterval(interval);
  }, [phase]);

  function handleSplashComplete() {
    const user = getCurrentUser();
    setIsMaintenance(isMaintenanceMode());
    if (user) {
      setIsFrozen(isUserFrozen(user.phone));
    }
    setPhase(user ? "app" : "login");
  }

  function handleLogin() {
    const user = getCurrentUser();
    if (user) {
      recordLogin(user.uniqueId);
      setIsFrozen(isUserFrozen(user.phone));
    }
    setIsMaintenance(isMaintenanceMode());
    setPhase("app");
    setPage("home");
  }

  function handleLogout() {
    logoutUser();
    setIsFrozen(false);
    setIsMaintenance(isMaintenanceMode());
    setPhase("login");
    setPage("home");
  }

  function handleNavigate(target: string) {
    setPage(target as Page);
    setMenuOpen(false);
    // Record user activity on navigation
    const user = getCurrentUser();
    if (user) {
      recordUserActivity(user.uniqueId, target);
    }
  }

  const showBottomNav =
    phase === "app" &&
    !isFrozen &&
    page !== "admin-panel" &&
    (BOTTOM_NAV_PAGES.includes(page) || page === "home");

  // Frozen screen — shown when user is frozen and not on admin panel
  const showFrozenScreen =
    phase === "app" && isFrozen && page !== "admin-panel";

  // Maintenance screen — shown when maintenance mode is on and not admin panel
  const showMaintenanceScreen =
    phase === "app" && isMaintenance && page !== "admin-panel";

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
    >
      <Toaster richColors position="top-center" />
      {phase === "splash" && <SplashScreen onComplete={handleSplashComplete} />}
      {phase === "login" && (
        <LoginScreen
          onLogin={handleLogin}
          onAdminAccess={() => {
            setPage("admin-panel");
            setPhase("app");
          }}
        />
      )}
      {phase === "app" && showFrozenScreen && (
        <div
          style={{
            minHeight: "100vh",
            background: "oklch(0.08 0.02 265)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            textAlign: "center",
          }}
          data-ocid="frozen.page"
        >
          {/* Lock icon */}
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              background: "oklch(0.20 0.08 25)",
              border: "2px solid oklch(0.45 0.18 25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 28,
              boxShadow: "0 0 40px oklch(0.45 0.18 25 / 0.4)",
            }}
          >
            <span style={{ fontSize: 44 }}>🔒</span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              background:
                "linear-gradient(135deg, oklch(0.72 0.22 25), oklch(0.65 0.20 45))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: 14,
              letterSpacing: "-0.02em",
            }}
          >
            Account Frozen
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "0.95rem",
              color: "oklch(0.55 0.04 265)",
              lineHeight: 1.6,
              maxWidth: 320,
              marginBottom: 36,
            }}
          >
            Your account has been temporarily frozen by the admin. Please
            contact support to resolve this issue.
          </p>

          {/* Divider */}
          <div
            style={{
              width: 48,
              height: 2,
              background:
                "linear-gradient(90deg, transparent, oklch(0.45 0.18 25), transparent)",
              marginBottom: 36,
            }}
          />

          {/* Sign Out button */}
          <button
            type="button"
            onClick={handleLogout}
            data-ocid="frozen.primary_button"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.75 0.18 82), oklch(0.65 0.20 75))",
              color: "oklch(0.10 0.02 265)",
              border: "none",
              borderRadius: 12,
              padding: "14px 36px",
              fontSize: "1rem",
              fontWeight: 800,
              cursor: "pointer",
              letterSpacing: "0.04em",
              boxShadow: "0 4px 20px oklch(0.75 0.18 82 / 0.35)",
            }}
          >
            Sign Out
          </button>
        </div>
      )}
      {phase === "app" && showMaintenanceScreen && (
        <div
          style={{
            minHeight: "100vh",
            background: "oklch(0.08 0.02 265)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              background: "oklch(0.20 0.06 265)",
              border: "2px solid oklch(0.78 0.18 82)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 28,
              boxShadow: "0 0 40px oklch(0.78 0.18 82 / 0.3)",
            }}
          >
            <span style={{ fontSize: 44 }}>🔧</span>
          </div>
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              background:
                "linear-gradient(135deg, oklch(0.78 0.18 82), oklch(0.65 0.20 75))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: 14,
              letterSpacing: "-0.02em",
            }}
          >
            Under Maintenance
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              color: "oklch(0.55 0.04 265)",
              lineHeight: 1.6,
              maxWidth: 320,
              marginBottom: 36,
            }}
          >
            FSC Foreign Smart Coins is currently undergoing scheduled
            maintenance. We will be back shortly. Thank you for your patience.
          </p>
          <div
            style={{
              width: 48,
              height: 2,
              background:
                "linear-gradient(90deg, transparent, oklch(0.78 0.18 82), transparent)",
              marginBottom: 36,
            }}
          />
          <p
            style={{
              fontSize: "0.75rem",
              color: "oklch(0.45 0.04 265)",
              letterSpacing: "0.05em",
            }}
          >
            FSC Foreign Smart Coins
          </p>
        </div>
      )}
      {phase === "app" && !showFrozenScreen && !showMaintenanceScreen && (
        <div className="relative">
          {page === "home" && (
            <Home
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
            />
          )}
          {page === "stocks" && (
            <Stocks
              onBack={() => setPage("home")}
              onPurchaseSuccess={() => setPage("plan-details")}
              onViewPlan={() => setPage("plan-details")}
              onNavigateAddFunds={() => setPage("add-funds")}
            />
          )}
          {page === "plan-details" && (
            <PlanDetails
              onBack={() => setPage("home")}
              onNavigateStocks={() => setPage("stocks")}
            />
          )}
          {page === "add-funds" && <AddFunds onBack={() => setPage("home")} />}
          {page === "verifying" && <Verifying onBack={() => setPage("home")} />}
          {page === "withdrawal" && (
            <Withdrawal onBack={() => setPage("home")} />
          )}
          {page === "withdrawal-history" && (
            <WithdrawalHistory onBack={() => setPage("home")} />
          )}
          {page === "profile" && <Profile onBack={() => setPage("home")} />}
          {page === "referral" && <Referral onBack={() => setPage("home")} />}
          {page === "daily-rewards" && (
            <DailyRewards onBack={() => setPage("home")} />
          )}
          {page === "portfolio" && (
            <Portfolio
              onBack={() => setPage("home")}
              onNavigate={handleNavigate}
            />
          )}
          {page === "transaction-history" && (
            <TransactionHistory onBack={() => setPage("home")} />
          )}
          {page === "support" && <Support onBack={() => setPage("home")} />}
          {page === "kyc" && <KYC onBack={() => setPage("home")} />}
          {page === "vip-tiers" && <VIPTiers onBack={() => setPage("home")} />}
          {page === "leaderboard" && (
            <Leaderboard onBack={() => setPage("home")} />
          )}
          {page === "price-alerts" && (
            <PriceAlerts onBack={() => setPage("home")} />
          )}
          {page === "earning-calculator" && (
            <EarningCalculator onBack={() => setPage("home")} />
          )}
          {page === "achievements" && (
            <Achievements onBack={() => setPage("home")} />
          )}
          {page === "login-activity" && (
            <LoginActivity onBack={() => setPage("home")} />
          )}
          {page === "messages" && <Messages onBack={() => setPage("home")} />}
          {page === "admin-panel" && (
            <AdminPanel onBack={() => setPhase("login")} />
          )}

          {showBottomNav && (
            <BottomNav
              currentPage={page}
              onNavigate={handleNavigate}
              onMenuOpen={() => setMenuOpen(true)}
            />
          )}
        </div>
      )}
    </ThemeProvider>
  );
}
