# FSC Foreign Smart Coins

## Current State
New users who register on the app do not appear in the Admin Panel, and their submitted data (payments, KYC, withdrawals, support tickets) also does not show up. The root cause is a two-part failure:

1. **Role registration never happens**: When a new user registers, the frontend calls `backendRegisterUser` which calls `saveCallerUserProfile`. However, the backend requires the caller to first have a `#user` role assigned via `_initializeAccessControlWithSecret`. Since this step is never called, the backend traps with "User is not registered" and all backend calls silently fail (caught in try/catch). So no user data ever reaches the shared canister.

2. **Admin Panel Users tab only reads localStorage**: `getAllUsers()` scans only the current device's localStorage. Users on other devices never appear. There is no backend endpoint to fetch all user profiles for the admin.

3. **KYC tab also only reads localStorage**: `getAllKycAdmin()` scans only localStorage, so KYC submissions from other devices never appear in the admin panel.

## Requested Changes (Diff)

### Add
- Backend endpoint `getAllUserProfiles()` — admin-only, returns all registered user profiles with their principal
- Backend endpoint `getAllKycSubmissions()` — admin-only, returns all KYC submissions with owner principal
- `backendGetAllUsers()` function in `backendStore.ts`
- `backendGetAllKyc()` function in `backendStore.ts`

### Modify
- `backendRegisterUser()` in `backendStore.ts`: call `_initializeAccessControlWithSecret("")` BEFORE calling `saveCallerUserProfile` so the user gets a `#user` role and all subsequent backend calls succeed
- Also call `_initializeAccessControlWithSecret("")` before `backendSubmitPayment`, `backendSubmitWithdrawal`, `backendSubmitKyc`, `backendSubmitTicket` as a safety measure for existing users who may not have initialized
- `AdminPanel.tsx` Users tab: fetch users from backend (merged with localStorage), display backend users with their name, phone (from localStorage match or profile name), and data
- `AdminPanel.tsx` KYC tab: fetch KYC from backend (merged with localStorage)
- `AdminPanel.tsx` Dashboard tab: include backend user count in total user stats

### Remove
- Nothing removed

## Implementation Plan
1. Add `getAllUserProfiles` and `getAllKycSubmissions` to `src/backend/main.mo`
2. Regenerate backend bindings (backend.d.ts will be updated automatically)
3. Update `backendRegisterUser` and all other backend write functions in `backendStore.ts` to call `_initializeAccessControlWithSecret` first
4. Add `backendGetAllUsers` and `backendGetAllKyc` to `backendStore.ts`
5. Update `AdminPanel.tsx` Users tab to load from backend and merge with localStorage
6. Update `AdminPanel.tsx` KYC tab to load from backend and merge with localStorage
7. Update Dashboard tab stats to count backend users
