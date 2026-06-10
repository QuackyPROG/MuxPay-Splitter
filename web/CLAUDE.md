@AGENTS.md

## Skills — Load Before Starting

| Trigger | Invoke |
|---------|--------|
| Any frontend/UI/component/page/animation/styling work | `ui-ux-pro-max` **and** `scroll-experience` |
| Any Stellar SDK / Freighter / transaction / wallet code in the browser | `stellar-dev:dapp` |

## Commands

```bash
npm run dev     # dev server — run from web/
npm run build
npm run lint
```

## App Structure (`src/`)

```
app/
  layout.tsx            # root layout, ThemeProvider
  page.tsx              # landing page
  LandingAnimations.tsx
  globals.css
  claim/                # claimable-balance claim flow
  dashboard/            # employer payroll dashboard
components/             # shared UI components
hooks/                  # custom React hooks
lib/                    # Stellar SDK helpers, utils
```

## Key Patterns

- **Animations**: GSAP + `@gsap/react` — use `useGSAP` hook, not `useEffect`
- **Theme**: `next-themes` — use `useTheme()`, never hard-code colors
- **Wallet**: `@stellar/freighter-api` v6 — async, check `isConnected` before any call
- **SDK**: `@stellar/stellar-sdk` v15 — see `specs/001-muxpay-splitter/` for resolved gotchas
