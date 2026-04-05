# FSC Foreign Smart Coins

## Current State

The entire app (users, payments, withdrawals, KYC, tickets) stores all data in `localStorage` — a per-browser, per-device store. When a new user registers on their phone, their data is saved only to that phone's localStorage. When the admin opens the Admin Panel on a different browser/device, they see an empty panel because it reads from the admin device's own localStorage.

The app does have a full Motoko backend canister with all required APIs (`getAllPayments`, `getAllWithdrawals`, `getAllTickets`, `updatePaymentStatus`, etc.) and a generated `backend.ts` client — but these are completely unused. The frontend uses only `localStorage` exclusively.

## Requested Changes (Diff)

### Add
- A shared central data store using the ICP canister backend for: user profiles, payment submissions, withdrawals, KYC, and support tickets.
- A `backendStore` singleton in `src/frontend/src/lib/backendStore.ts` that wraps the backend canister client with caching and provides async CRUD for all shared data.
- A `SharedDataContext` (React context + provider) that loads shared data from the backend on app start and keeps it in sync. Exposes: `users`, `payments`, `withdrawals`, `kycList`, `tickets`, and action functions for mutations.
- On user registration (LoginScreen): after saving to localStorage, also register the user profile in the backend canister.
- On payment submission (AddFunds): after saving to localStorage, also call `submitPayment` on the backend canister.
- On withdrawal submission (Withdrawal): after saving to localStorage, also call `submitWithdrawalRequest` on the backend canister.
- On KYC submission (KYC page): after saving to localStorage, also call `submitKyc` on the backend canister.
- On support ticket submission (Support page): also call `submitSupportTicket` on the backend canister.

### Modify
- `AdminPanel.tsx`: Change `getAllUsers`, `getAllPaymentsAdmin`, `getAllWithdrawalsAdmin`, `getAllKycAdmin` to read from the shared backend data (via the SharedDataContext) instead of from localStorage.
- `AdminPanel.tsx` approve/reject actions: after updating localStorage, also call the corresponding backend update functions (`updatePaymentStatus`, `updateWithdrawalStatus`, `updateKycStatus`).
- `src/frontend/src/types/fsc.ts`: Add a `fsc_user_registry` localStorage key that stores the list of all user phones (used as a fallback registry for local queries). Also add a `registerUserGlobally` function that appends to this registry.
- `LoginScreen.tsx`: On successful registration, call `registerUserGlobally` and attempt to save user profile to backend (non-blocking — if backend call fails, localStorage still works for that device).

### Remove
- Nothing is removed. All existing localStorage logic stays as-is for backward compatibility and local performance.

## Implementation Plan

1. **Create `src/frontend/src/lib/backendStore.ts`**: Async singleton that lazily initializes the backend actor and exposes typed methods: `registerUser(user)`, `submitPayment(payment)`, `getPayments()`, `getAllPaymentsAdmin()`, `submitWithdrawal(req)`, `getAllWithdrawalsAdmin()`, `submitKyc(data)`, `getAllKycAdmin()`, `submitTicket(ticket)`, `getAllTicketsAdmin()`, `updatePaymentStatus(...)`, `updateWithdrawalStatus(...)`, `updateKycStatus(...)`. All methods catch errors silently (localStorage remains source of truth for the user's own device).

2. **Add `SharedDataContext` in `src/frontend/src/context/SharedDataContext.tsx`**: React context that on mount calls the backend admin APIs to load all users, payments, withdrawals, KYC, and tickets. Exposes this data and refresh functions. The admin panel subscribes to this context.

3. **Modify `LoginScreen.tsx`**: After `saveUser(user)`, also call `backendStore.registerUser(user)` in a fire-and-forget manner. Also add the user's phone to `fsc_user_registry` in localStorage.

4. **Modify `AddFunds.tsx`**: After `savePayments(...)`, also call `backendStore.submitPayment(payment)` in fire-and-forget.

5. **Modify `Withdrawal.tsx`**: After `saveWithdrawals(...)`, also call `backendStore.submitWithdrawal(req)` in fire-and-forget.

6. **Modify `KYC.tsx`**: After `saveKycData(...)`, also call `backendStore.submitKyc(data)` in fire-and-forget.

7. **Modify `Support.tsx`**: After `saveSupportTickets(...)`, also call `backendStore.submitTicket(ticket)` in fire-and-forget.

8. **Modify `AdminPanel.tsx`**: 
   - Wrap the component in `SharedDataContext` provider (or consume from App-level provider).
   - Replace `getAllUsers()` → read from `sharedData.users` (merged with localStorage users).
   - Replace `getAllPaymentsAdmin()` → read from `sharedData.payments` (merged with localStorage payments, deduplicated by ID).
   - Replace `getAllWithdrawalsAdmin()` → read from `sharedData.withdrawals`.
   - Replace `getAllKycAdmin()` → read from `sharedData.kycList`.
   - After admin approve/reject payment: also call `backendStore.updatePaymentStatus(...)`.
   - After admin approve/reject withdrawal: also call `backendStore.updateWithdrawalStatus(...)`.
   - After admin approve/reject KYC: also call `backendStore.updateKycStatus(...)`.

9. **Add `fsc_user_registry` to `fsc.ts`**: Helper function `registerUserGlobally(phone: string)` that maintains a master list of all user phones in localStorage. Update `getAllUsers()` to also scan this registry. This ensures admin sees all users who registered on the same device, and the backend provides cross-device visibility.

10. **Wrap App with SharedDataProvider**: In `App.tsx`, wrap the app (or at least the admin panel route) with `<SharedDataProvider>` so the context is available.
