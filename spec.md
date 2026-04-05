# FSC Foreign Smart Coins

## Current State
Full-featured trading/investment app with deep navy + gold theme. Already has glassmorphism, gold gradients, animated counters, premium splash screen. The UI uses OKLCH color system, custom CSS classes (glass-card, balance-hero, quick-action, btn-gold, etc.), and Plus Jakarta Sans + Playfair Display fonts. All major pages exist: Login, Home, Stocks/Markets, AddFunds, PlanDetails, Portfolio, AdminPanel, and 15+ more pages. The app is functional and working.

## Requested Changes (Diff)

### Add
- Richer ambient backgrounds with more layered radial/mesh gradients
- More sophisticated card designs with subtle inner highlights, improved depth
- Premium header redesign with better brand identity presentation
- Enhanced bottom navigation with indicator bars/pills (not just a dot)
- Elevated splash screen with cinematic feel
- Better login screen with animated gradient border card and particle field
- Home page with more premium card styling, richer balance card, and stronger visual hierarchy
- Consistent premium page headers with back button and gradient title across all pages
- Better typography scale contrast (section titles more bold/prominent)
- Micro-interaction improvements on interactive elements
- Stronger gold gradient accents throughout
- More premium stock/plan cards on Markets page

### Modify
- index.css: Upgrade CSS classes for glass-card, balance-hero, quick-action, btn-gold, bottom-nav, card-premium. Add new utility classes for premium ambient backgrounds, improved shimmer effects, and page headers.
- SplashScreen.tsx: More cinematic — larger logo with multi-ring glow, animated ring orbits, stronger fade/scale animation
- LoginScreen.tsx: Animated gradient border on login card, subtle floating particles, premium feel
- Home.tsx: Balance hero card upgraded — larger, richer, more depth. Quick actions reimagined as premium tiles. Better section headers with icon accents.
- BottomNav.tsx: Active state uses a pill indicator bar above icon, larger icon, more luxurious active state
- AppMenu.tsx: Profile header upgraded with mesh gradient background, better tier badge, improved menu item hover states

### Remove
- Nothing removed — pure visual upgrade only, all functionality preserved

## Implementation Plan
1. Rewrite index.css with upgraded design tokens, new CSS classes, stronger ambient/glow effects
2. Redesign SplashScreen.tsx with cinematic multi-ring glow and better animation
3. Redesign LoginScreen.tsx with animated gradient border card
4. Redesign Home.tsx with upgraded balance hero, quick actions, and section styles
5. Redesign BottomNav.tsx with pill-style active indicator
6. Redesign AppMenu.tsx with richer profile header
7. Validate and deploy
