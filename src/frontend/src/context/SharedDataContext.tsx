import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  type AdminPayment,
  type AdminTicket,
  type AdminWithdrawal,
  backendGetAllPayments,
  backendGetAllTickets,
  backendGetAllWithdrawals,
} from "../lib/backendStore";
import {
  getAllPaymentsAdmin,
  getAllTicketsAdmin,
  getAllWithdrawalsAdmin,
} from "../types/fsc";

interface SharedDataContextValue {
  backendPayments: AdminPayment[];
  backendWithdrawals: AdminWithdrawal[];
  backendTickets: AdminTicket[];
  loading: boolean;
  refresh: () => void;
}

const SharedDataContext = createContext<SharedDataContextValue>({
  backendPayments: [],
  backendWithdrawals: [],
  backendTickets: [],
  loading: false,
  refresh: () => {},
});

export function useSharedData() {
  return useContext(SharedDataContext);
}

export function SharedDataProvider({
  children,
}: { children: React.ReactNode }) {
  const [backendPayments, setBackendPayments] = useState<AdminPayment[]>([]);
  const [backendWithdrawals, setBackendWithdrawals] = useState<
    AdminWithdrawal[]
  >([]);
  const [backendTickets, setBackendTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [payments, withdrawals, tickets] = await Promise.all([
        backendGetAllPayments(),
        backendGetAllWithdrawals(),
        backendGetAllTickets(),
      ]);

      // Merge with localStorage: deduplicate by UTR for payments
      const localPayments = getAllPaymentsAdmin();
      const localUtrSet = new Set(localPayments.map((p) => p.utr));
      const mergedPayments = [
        ...payments.filter((p) => !localUtrSet.has(p.utr)),
        ...payments.filter((p) => localUtrSet.has(p.utr)),
      ];
      setBackendPayments(mergedPayments);

      // Merge withdrawals: deduplicate by timestamp+principalStr
      const localWithdrawals = getAllWithdrawalsAdmin();
      const localWKeys = new Set(
        localWithdrawals.map((w) => `${w.userId}_${w.amount}_${w.date}`),
      );
      const dedupedWithdrawals = withdrawals.filter((w) => {
        // Keep backend-only entries (those not already in localStorage by similar key)
        return !localWKeys.has(`${w.principalStr}_${w.amount}`);
      });
      setBackendWithdrawals(dedupedWithdrawals);

      // Merge tickets: deduplicate by ticketId
      const localTickets = getAllTicketsAdmin();
      const localTicketIds = new Set(localTickets.map((t) => t.id));
      const dedupedTickets = tickets.filter(
        (t) => !localTicketIds.has(String(t.ticketId)),
      );
      setBackendTickets(dedupedTickets);
    } catch (e) {
      console.warn("SharedDataProvider fetchAll failed:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <SharedDataContext.Provider
      value={{
        backendPayments,
        backendWithdrawals,
        backendTickets,
        loading,
        refresh: fetchAll,
      }}
    >
      {children}
    </SharedDataContext.Provider>
  );
}
