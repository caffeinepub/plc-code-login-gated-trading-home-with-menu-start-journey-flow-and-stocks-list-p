# FSC Foreign Smart Coins — Version 36

## Current State
- Full FSC trading/investment app with blue ocean theme
- Referral page shows user's own referral code + referred friends list; no way to enter someone else's referral code
- Admin Panel has 7 tabs (Dashboard, Payments, Withdrawals, Users, Tickets, KYC, Transactions); no messaging/broadcast feature for admin
- Support ticket system exists (subject + message) but no image/screenshot upload capability

## Requested Changes (Diff)

### Add
1. **Enter Referral Code** — Input field + Submit button in the Referral page so a user can enter a friend's referral code to claim their ₹50 join bonus. Validates format (FSC + 8 digits), prevents re-use, saves applied code to localStorage.
2. **Admin Broadcast Messages tab** — New "Messages" tab in Admin Panel (8th tab). Admin can compose a title + body message and send it to ALL users. Messages are saved to localStorage (getBroadcasts/saveBroadcasts already exist in fsc.ts). Users can read these in their existing Messages page.
3. **Support ticket image upload** — Add an optional image/screenshot attachment to the New Ticket form in Support.tsx. Uses a file input that converts to base64. Stored on the SupportTicketLocal object as `screenshotUrl?: string`. Shows preview thumbnail in the form and in the ticket card list. Visible in Admin Panel → Tickets tab.

### Modify
- `Referral.tsx` — Add "Enter Referral Code" card below the referral code display card
- `Support.tsx` — Add optional image upload to the new ticket form; show screenshot thumbnail in ticket cards
- `AdminPanel.tsx` — Add 8th tab "Messages" with compose form + message history; also display ticket screenshots in TicketsTab
- `types/fsc.ts` — Add `screenshotUrl?: string` to `SupportTicketLocal`; add helper functions for applied referral code tracking

### Remove
- Nothing removed

## Implementation Plan
1. Update `SupportTicketLocal` interface in `types/fsc.ts` to add `screenshotUrl?: string`
2. Add `getAppliedReferralCode` / `saveAppliedReferralCode` helpers in `types/fsc.ts`
3. Update `Referral.tsx` — add enter-referral-code section with input + submit logic
4. Update `Support.tsx` — add image upload button + base64 conversion + preview in form and ticket cards
5. Update `AdminPanel.tsx` — add Messages tab (8th tab) with compose form and message list; update TicketsTab to display screenshots
6. Update `TABS` array in AdminPanel to include the new Messages tab
