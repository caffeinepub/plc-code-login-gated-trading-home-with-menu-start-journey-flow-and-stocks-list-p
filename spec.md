# FSC Foreign Smart Coins

## Current State
The app uses anonymous ICP agents (no Internet Identity). The backend uses role-based access control (`#user` / `#admin`) where roles are granted via `_initializeAccessControlWithSecret`. However, because all callers are anonymous principals, the `initialize()` function in `access-control.mo` does `if (caller.isAnonymous()) { return }` — meaning anonymous callers are NEVER assigned any role. As a result:
- `saveCallerUserProfile` always traps (requires `#user` role)
- `getAllUserProfiles` always traps (requires `#admin` role)
- All backend registration silently fails (errors are caught and swallowed)
- Users only exist in localStorage on their own device
- Admin panel's Users tab reads localStorage (device-local only) + backend (empty), so shows no cross-device users

## Requested Changes (Diff)

### Add
- `registerUser(phone, name, uniqueId)` — public backend function, no role required, stores user by phone key
- `getAllRegisteredUsers()` — admin-accessible function reading from phone-keyed user store (uses admin token check, not role check)
- `getRegisteredUser(phone)` — public read for a specific user by phone
- `updateUserBalance(phone, balance)` — admin function to sync balance
- `freezeUser(phone, frozen)` — admin function (replaces role-based freeze)
- `setMaintenanceMode(on)` — admin function
- `getMaintenanceMode()` — public query

### Modify
- `backendStore.ts` — `backendRegisterUser` calls new `registerUser()` directly (no role init needed); `backendGetAllUsers` calls new `getAllRegisteredUsers()`
- `LoginScreen.tsx` — await backend registration before calling `onLogin()`; retry backend sync for returning users who may not have been synced
- `AdminPanel.tsx` — Users tab reads from backend directly, maps real phone/name/uniqueId fields; remove broken `syntheticUsers` merge logic

### Remove
- `ensureUserRole()` calls before user-facing backend writes (they're anonymous and will never work)
- Broken `syntheticUsers` merge in AdminPanel that fabricates phone numbers from principal IDs

## Implementation Plan
1. Add `registerUser`, `getAllRegisteredUsers`, `getRegisteredUser` to `main.mo` using a phone-keyed `Map<Text, RegisteredUser>` that doesn't require role checks
2. Update `backendStore.ts` to use these new functions
3. Update `LoginScreen.tsx` to await backend reg and retry for returning users
4. Fix AdminPanel Users tab to use proper data from backend
5. Validate and deploy
