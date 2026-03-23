# Mobile App Strategy — Atlanta IAM Meetup

## Recommendation: PWA-First Approach

Given a solo/small team, a **Progressive Web App (PWA)** is the best path. It reuses 100% of the existing React codebase with minimal additions.

---

## Phase 1: PWA Enhancement (1–2 weeks)

### What to add

- **`vite-plugin-pwa`** — generates service worker + manifest automatically
- **`manifest.json`** — app name, icons, theme color (`#E8560A`), display: `standalone`
- **Service worker** — offline caching of static assets, API response caching
- **Web Push notifications** (via Cloudflare Workers + Web Push API)
- **Install prompt banner** ("Add to Home Screen")

### What you get

- Installable on Android & iOS home screens (full-screen, no browser chrome)
- Offline support for previously loaded pages
- Push notifications (Android; iOS 16.4+ with limitations)
- Automatic updates — no app store review process
- Zero additional codebase to maintain

### Repo strategy

Stay in current monorepo. No separate repo needed.

---

## Phase 2: Capacitor Wrapper (if app store presence required)

If App Store / Play Store listings are needed later:

- Add **Capacitor** (by Ionic) — wraps the PWA in a native shell
- Same codebase, same deploy pipeline
- Access to native APIs (camera, biometrics, deep push notifications)
- Separate build step: `npx cap sync` → open in Xcode/Android Studio → publish

**Cost:** Apple Developer ($99/yr), Google Play ($25 one-time)

---

## Feature Allocation

| Priority | Features |
|----------|----------|
| **Mobile-first** | Events, Member Directory, Profile, Check-in (QR), Notifications |
| **Web-only** | Admin Panel, Kiosk Mode, Speaking Submission Wizard, Sponsor Portal |

---

## Build / Test / Deploy

| Stage | Tool |
|-------|------|
| **Dev** | `vite dev` — same as today, test in Chrome DevTools mobile emulator |
| **Test PWA** | `vite build && vite preview`, test install on real device |
| **Deploy** | Same Cloudflare Pages pipeline — no changes needed |
| **Capacitor (if Phase 2)** | `cap sync` → Xcode / Android Studio → TestFlight / Internal Testing → Store |

---

## Why NOT React Native / Flutter

- Requires rewriting all UI components from scratch
- Separate codebase to maintain indefinitely
- The inline-style + theme-token architecture doesn't transfer
- Overkill for a community meetup app
- PWA covers 95%+ of the use cases

---

## Implementation Checklist (Phase 1)

- [ ] Install `vite-plugin-pwa` and configure in `vite.config.ts`
- [ ] Create `manifest.json` with app metadata and icons (192px, 512px)
- [ ] Configure service worker caching strategies (stale-while-revalidate for API, cache-first for assets)
- [ ] Add install prompt UI component
- [ ] Test installability on Android Chrome and iOS Safari
- [ ] Add Web Push notification support via Cloudflare Workers
- [ ] Update CI/CD pipeline if needed (likely no changes required)

---

*Strategy created: March 2026*
