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

  useEffect(() => {
    const theme = getTheme();
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);
  }, []);

  function handleSplashComplete() {
    const user = getCurrentUser();
    setPhase(user ? "app" : "login");
  }

  function handleLogin() {
    const user = getCurrentUser();
    if (user) recordLogin(user.uniqueId);
    setPhase("app");
    setPage("home");
  }

  function handleLogout() {
    logoutUser();
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
    page !== "admin-panel" &&
    (BOTTOM_NAV_PAGES.includes(page) || page === "home");

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
      {phase === "app" && (
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
