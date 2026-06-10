# MuxPay — Noncustodial Payroll on Stellar

A three-surface payroll dApp: GSAP scroll landing, employer dashboard (roster +
one-signature run wizard), and an employee claim portal. Async distribution via
Stellar **claimable balances** — a run is never blocked by unready employees.

## One-line description

Run noncustodial team payroll on Stellar: mixed XLM/USDC delivery, async
claimable-balance fallback, one Freighter signature per run.

## Surfaces

| Route | Who | What |
|---|---|---|
| `/` | Anyone | GSAP scroll landing — product story + CTA |
| `/dashboard` | Employer | Manage roster, view history, connect wallet |
| `/dashboard/run` | Employer | 4-step run wizard: select → preflight → sign → result |
| `/claim` | Employee | See and claim pending balances — mobile-priority |

## How It Uses Stellar

1. **Payments** — `Operation.payment` for direct XLM delivery to funded accounts
2. **Path payments** — `Operation.pathPaymentStrictReceive` (XLM → USDC via DEX)
3. **Muxed accounts** — `encodeMuxedAccount` for per-employee off-chain IDs
4. **Claimable balances** — `Operation.createClaimableBalance` for async delivery
   (account-not-funded or no trustline); employee claims with `ClaimClaimableBalance`
5. **One Freighter signature** — all ops in a single classic multi-op transaction

The employer can reclaim unclaimed balances after 7 days via the employer-side
`predicateNot(predicateBeforeRelativeTime("604800"))` predicate.

## Track

Track 2 — Financial Inclusion & Everyday Payments

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript 5
- Tailwind CSS v4 · next-themes (dark/light) · GSAP + @gsap/react (landing)
- `@stellar/stellar-sdk` v15 · `@stellar/freighter-api` v6
- localStorage per wallet (no backend, fully noncustodial)
- Lucide icons · Space Grotesk + Inter fonts

## Quick Start (judges — under 2 minutes)

```bash
git clone https://github.com/QuackyPROG/MuxPay-Splitter.git
cd mux-pay/web
npm install
npm run dev
# → open http://localhost:3000
```

No `.env` required — all defaults point to Stellar testnet public endpoints.

**Freighter setup**: install the [Freighter extension](https://freighter.app),
switch to **Testnet**, and fund with
[Friendbot](https://friendbot.stellar.org?addr=YOUR_ADDRESS).

## Demo Script (judges)

### Employer flow (~3 min)

1. Open `/dashboard` and connect Freighter (Employer A address)
2. Add 3 employees:
   - Alice — funded XLM account → will get `payment`
   - Bob — funded account with USDC trustline → will get `path-payment`
   - Carol — unfunded address → will get `claimable-balance`
   - *(or import via CSV: `name,address,salary,asset`)*
3. Click **Run Payroll** → preflight auto-decides delivery method per employee
4. Review the preview (see method badges + reserve math)
5. Click **Sign & Submit** → one Freighter prompt → confirmed tx + Stellar Expert link
6. Return to dashboard → run appears in history; CB items show "Pending"

### Employee claim flow (~2 min)

7. Fund Carol's account via Friendbot
8. Open `/claim` and connect Freighter as Carol
9. Pending claim appears within ~30 s of the run
10. Click **Claim** → one Freighter prompt → USDC trustline auto-prepended if needed
11. Back on `/dashboard` → click "↻ Refresh claim status" → Carol shows ✓ Claimed

### Roster re-setup (2 min if needed between demos)

- The roster is in localStorage keyed by wallet address
- Use the CSV import to restore quickly:
  ```
  Alice,GABC...,10,XLM
  Bob,GDEF...,5,USDC
  Carol,GGHI...,8,XLM
  ```

## Network Details

- Network: **Stellar testnet**
- Horizon: `https://horizon-testnet.stellar.org`
- Soroban RPC: `https://soroban-testnet.stellar.org` (unused — classic ops only)
- USDC issuer (testnet): `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5`

## Architecture Notes

- No backend, no DB — localStorage per wallet, Horizon as money truth
- GSAP imports are confined to the landing bundle (route-splitting)
- All signing stays in Freighter; no private keys ever touch the app
- 001 lib layer (`batch.ts`, `pathfinder.ts`, `trustline.ts`, `muxed.ts`,
  `sign.ts`) extended in-place — not forked

## Team

- QuackDev — @QuackyPROG

## License

MIT
