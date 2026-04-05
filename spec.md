# FSC Foreign Smart Coins

## Current State
The `FscUser` interface has a `suspended` field and `adminSuspendUser`/`adminUnsuspendUser` functions exist in `fsc.ts`. However:
- The Admin Panel's Users tab has NO Freeze/Unfreeze buttons — admins cannot trigger suspension from the UI.
- The app does NOT check the `suspended` flag anywhere — frozen users can still log in and use the app freely.

## Requested Changes (Diff)

### Add
- **Freeze/Unfreeze buttons** in the Admin Panel Users tab for every user card.
  - If user is NOT frozen: show a blue/red "Freeze Account" button.
  - If user IS frozen: show a green "Unfreeze Account" button, plus a "FROZEN" status badge on the card.
  - Freeze action does NOT require entering a reason (keep it simple — one click).
- **Frozen user gate** in the main App: after login and on every page load, check if the current user's `suspended` flag is true. If frozen, show a full-screen "Account Frozen" blocked screen (no bottom nav, no content) with a message saying their account has been suspended and to contact support. The only option is to log out.
- A `isUserFrozen(phone)` helper in `fsc.ts` that reads the latest user data from localStorage and returns whether `suspended === true`.

### Modify
- `App.tsx`: After `handleLogin` and at app startup (when `getCurrentUser()` is called), re-read the user from storage to check live freeze status. Add a `frozenScreen` phase/state. If user is frozen, show blocked screen instead of normal app. Poll every 10 seconds to detect freeze status changes while the app is open.
- `AdminPanel.tsx` → `UsersTab`: Add Freeze/Unfreeze button row to each user card. Use `adminSuspendUser` and `adminUnsuspendUser` from `fsc.ts`. Show a "FROZEN" badge (red) next to the user name if `u.suspended === true`. Call `onRefresh()` after toggling.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `isUserFrozen(phone)` helper to `fsc.ts`.
2. Modify `App.tsx` to:
   - Check frozen status after login.
   - Poll every 10 seconds while app is open.
   - Show a full-screen frozen/blocked UI if suspended, with logout button.
3. Modify `AdminPanel.tsx` `UsersTab` to:
   - Show "FROZEN" badge on frozen user cards.
   - Add Freeze button (red/ice blue) for active users.
   - Add Unfreeze button (green) for frozen users.
   - Wire to existing `adminSuspendUser` / `adminUnsuspendUser` functions.
