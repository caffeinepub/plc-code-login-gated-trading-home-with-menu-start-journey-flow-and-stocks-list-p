# FSC Foreign Smart Coins

## Current State
The app has a Motoko backend (`main.mo`) with a phone-keyed public user registry (`registerUserByPhone`, `getAllRegisteredUsers`, `setUserFrozenByPhone`, `isUserFrozenByPhone`, `setMaintenanceMode`, `getMaintenanceMode`, `getAllKycSubmissions`, `getAllUserProfiles`). However, the generated `backend.did.d.ts` bindings do NOT include any of these functions. The frontend uses `(backend as any).registerUserByPhone(...)` and `(backend as any).getAllRegisteredUsers()` etc., which fail silently at runtime because the deployed canister interface doesn't expose them. New users register but the data never reaches the shared canister, so they never appear in the Admin Panel.

## Requested Changes (Diff)

### Add
- Re-generate backend with all phone-keyed registry functions properly typed and exposed
- `registerUserByPhone(phone, name, uniqueId, timestamp)` - public, no role required
- `getAllRegisteredUsers()` - public query, returns all registered users
- `getRegisteredUserByPhone(phone)` - public query
- `setUserFrozenByPhone(phone, frozen)` - public shared
- `isUserFrozenByPhone(phone)` - public query
- `setMaintenanceMode(on)` - public shared
- `getMaintenanceMode()` - public query
- `getAllKycSubmissions()` - admin only
- `getAllUserProfiles()` - admin only
- `updateRegisteredUserBalance(phone, newBalance)` - public shared

### Modify
- Regenerate backend so all these functions appear in `backend.did.d.ts` as typed methods
- Update `backendStore.ts` to use properly typed calls instead of `(backend as any)` for all phone-keyed functions

### Remove
- Nothing removed

## Implementation Plan
1. Regenerate Motoko backend to include all phone-keyed registry functions with proper types
2. Update `backendStore.ts` to use typed backend calls (remove all `(backend as any)` casts for registry functions)
3. Validate and build
