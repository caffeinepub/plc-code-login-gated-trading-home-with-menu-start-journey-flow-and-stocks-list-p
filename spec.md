# FSC Foreign Smart Coins - Blue Ocean Redesign

## Current State
The app uses a deep navy + gold theme throughout. All major screens (splash, login, home, menu, profile) use gold accent colors (oklch ~82 hue) on a dark navy background (oklch ~265 hue). The profile section in AppMenu has display issues: the avatar fallback text color/contrast, badge positioning, and name/initials visibility have problems when no profile picture is set.

## Requested Changes (Diff)

### Add
- Blue ocean color palette: rich deep ocean blue (#0a1628 / oklch 0.08 0.04 240), electric blue accents (oklch 0.65 0.22 220), cyan highlights (oklch 0.72 0.18 195), smooth gradient transitions between blues and teals
- Premium splash screen with 6s duration, blue ocean waves/particles, animated logo glow in blue/cyan
- Login page: full HD redesign with ocean gradient background, cyan-blue accent card, frosted glass effect
- Profile display fix: ensure name is always visible with proper contrast, badge shows clearly, avatar fallback initials use high-contrast colors

### Modify
- `index.css`: Replace all gold/amber CSS tokens with blue ocean palette. Primary: electric blue. Accent: cyan. Background: deep ocean navy.
- `SplashScreen.tsx`: Full redesign to blue ocean theme - deep blue background, floating blue/teal particles, logo with blue glow, cyan progress bar, 6s timer
- `LoginScreen.tsx`: Full HD redesign - ocean gradient bg, glass card with blue border, blue input focus states, cyan CTA button
- `AppMenu.tsx`: Fix profile section - ensure avatar fallback has visible initials, name text contrast fixed, tier badge clearly visible, all menu icons/text updated to blue theme
- `BottomNav.tsx`: Update active indicator to blue/cyan instead of gold
- `Home.tsx`: Update balance card, quick actions, header to blue ocean palette
- `Profile.tsx`: Fix avatar display, ensure initials/image shows clearly

### Remove
- Gold (#78 hue) primary color system replaced with blue/cyan
- Amber gradient accents replaced with ocean blue gradients

## Implementation Plan
1. Update `index.css` CSS variables to blue ocean palette (primary: 220-240 hue range, accent: 195 cyan)
2. Rewrite `SplashScreen.tsx` with blue ocean premium design, 6s timer, floating blue particles
3. Rewrite `LoginScreen.tsx` with full HD ocean blue design
4. Fix `AppMenu.tsx` profile section display issues + apply blue theme
5. Update `BottomNav.tsx` active states to blue
6. Update `Home.tsx` balance card and UI elements to blue theme
7. Fix `Profile.tsx` avatar display
8. Validate and deploy
