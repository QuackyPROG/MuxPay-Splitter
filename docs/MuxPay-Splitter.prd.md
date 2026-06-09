# PRD: MuxPay Splitter
**Version:** 2.0 — StellarX Workshop @ PUP QC, May 2026
**Status:** MVP Build
**Branch:** `muxpay-splitter`
**Track:** Track 2 — Financial Inclusion & Everyday Payments

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Context & Philippines Relevance](#2-problem-context--philippines-relevance)
3. [User Experience & Functionality](#3-user-experience--functionality)
4. [Stellar Architecture & Technical Specifications](#4-stellar-architecture--technical-specifications)
5. [Component & Data Specifications](#5-component--data-specifications)
6. [Testing Strategy](#6-testing-strategy)
7. [Security & Privacy](#7-security--privacy)
8. [Risks & Mitigations](#8-risks--mitigations)
9. [Judging Rubric Alignment & Bonus Strategy](#9-judging-rubric-alignment--bonus-strategy)
10. [Submission Readiness](#10-submission-readiness)
11. [Roadmap](#11-roadmap)
12. [Appendix](#12-appendix)

---

## 1. Executive Summary

### Problem Statement

Filipino group admins — barangay treasurers, OFW remittance pool coordinators, cooperative treasurers, event organizers — must manually issue tens to hundreds of individual Stellar payments to distribute shared funds. Each payment is a separate transaction: higher total fees, manual errors, and no atomicity guarantee. If one payment fails mid-batch, the admin has no clear recovery path and recipients see inconsistent balances.

### Proposed Solution

**MuxPay Splitter** is a noncustodial web dApp that composes a single Stellar transaction containing up to 10 payment operations, letting an admin sign once via Freighter to atomically distribute funds to all recipients. The MVP targets the Philippine group-payment use case: sari-sari store collective payouts, barangay stipend distribution, and OFW remittance splits. Stellar's native multi-operation atomicity, muxed accounts (M…), and `PathPaymentStrictReceive` are the load-bearing primitives — not cosmetic features.

### Why Stellar — Not Something Else

| Capability | How MuxPay uses it |
|---|---|
| Multi-op atomic tx | Either all recipients are paid or none — no partial-batch risk |
| Muxed accounts (M…) | Map off-chain member IDs to ledger-addressable sub-accounts without creating extra accounts |
| `PathPaymentStrictReceive` | Sender pays in XLM; recipient receives USDC (or vice versa) via DEX liquidity |
| Testnet + Horizon | Full on-chain audit trail — judges can verify every op via Stellar Expert |

### MVP Success Criteria

| KPI | Target | Measurement Method |
|---|---:|---|
| Create + sign latency (10 recipients) | ≤ 20 s | Stopwatch on 5 consecutive demo runs |
| Atomic delivery — all ops commit | ≥ 95% across 20 testnet runs | Horizon `operations` endpoint verifies all ops in tx |
| Fee estimate accuracy | Within ±10% of actual fee | UI estimate vs `result_meta_xdr` fee field |
| Path availability UI warning | Shown before signing when no DEX route | Pathfinder pre-check on every `needsConversion` recipient |
| Sender builds + signs | ≤ 3 minutes from CSV paste | Moderator timer trial |
| Trustline pre-flight warning | 100% of non-XLM recipients checked | Test with recipients with and without trustlines |

---

## 2. Problem Context & Philippines Relevance

### The Real Problem

The Philippines has 10M+ OFWs. Many pool remittances through informal group systems (padala groups, paluwagan, cooperatives). The group admin typically receives a lump sum and manually forwards individual shares — a process that is slow, error-prone, and unauditable.

At the barangay level, local government units distribute small stipends or livelihood payouts to community members. At the sari-sari store or market cooperative level, suppliers receive proportional revenue splits weekly. All of these flows share the same friction: no atomic "pay all at once" primitive on existing rails.

Stellar solves this cleanly: a single multi-op transaction pays every recipient simultaneously, with a public ledger audit trail accessible via Stellar Expert in real time.

### Differentiation from Stellar Disbursement Platform (SDP)

SDF's [Stellar Disbursement Platform](https://developers.stellar.org/docs/category/use-the-stellar-disbursement-platform) targets enterprise mass-payment infrastructure (hundreds of recipients, KYC flows, server-side signing). MuxPay targets a different tier: small informal groups (≤ 10 recipients), noncustodial, browser-only, no server required, designed for a non-technical group admin with a Freighter wallet. The complexity profile and trust model are entirely different.

---

## 3. User Experience & Functionality

### Personas

| Persona | Description | Technical Literacy |
|---|---|---|
| Group Admin (Sender) | Barangay treasurer, OFW pool coordinator, cooperative officer | Low–Intermediate (has Freighter, uses spreadsheets) |
| Recipient | Pool member or cooperative beneficiary | Low — does not interact with the dApp |
| Auditor / Judge | Verifies atomic delivery and ledger trace | High |

### User Stories (MVP)

| ID | Story | Acceptance Criteria |
|---|---|---|
| US-01 | As a group admin, I want to paste a recipient list (CSV or manual entry) with addresses and amounts so I can prepare a batch payout. | UI accepts CSV (recipient_id, address_or_mux, amount, asset); row-level validation errors shown inline. |
| US-02 | As a group admin, I want to see a full preview — ops, estimated fee, path availability — before I sign, so there are no surprises. | Preview lists each op with recipient, amount, asset, and path/no-path status. Fee estimate shown. Trustline warnings shown for non-XLM recipients. |
| US-03 | As a group admin, I want to sign once and submit a single atomic transaction, so all recipients are paid simultaneously. | One Freighter prompt. Transaction commits all ops or none. No partial payout possible. |
| US-04 | As a recipient, I want to receive funds in my preferred asset (XLM or USDC) when DEX liquidity exists. | Where Horizon pathfinder returns a route, `PathPaymentStrictReceive` is used; otherwise direct `Payment` op. |
| US-05 | As an auditor, I want a Stellar Expert link to the committed transaction and per-op breakdown, so I can independently verify delivery. | UI shows Stellar Expert tx URL and per-op result after commit. Polling confirms `SUCCESS` before showing link. |
| US-06 | As a group admin, I want to see if any recipient lacks a trustline for the target asset before I sign, so I can fix it first. | Trustline pre-flight check on every non-XLM recipient; warning with instructions shown in preview. |

### UX Flow

```
1. Admin opens MuxPay dApp → connects Freighter wallet (dynamic import)
2. Pastes recipient CSV or uses inline editor
   → App validates addresses (G.../M...), checks Horizon pathfinder per recipient,
     checks trustlines for non-XLM recipients
3. Admin reviews Preview panel:
   - Per-op list (recipient, amount, asset, path type, trustline status)
   - Total XLM / USDC sent, estimated fee (baseFee × opCount)
   - Any warnings (no DEX path → fallback to direct; missing trustline → blocked)
4. Admin clicks "Create & Sign" → Freighter signs (v6: reads .signedTxXdr)
5. App submits via Horizon, polls getTransaction every 1 s (up to 60 s)
6. On SUCCESS: shows tx hash, Stellar Expert deep link, per-op confirmations
   On FAILURE: shows error, suggests retry or edit
```

### Non-Goals (MVP)

- Scheduled / recurring payout automation.
- KYC or identity verification for recipients.
- Custodial pooling or server-side secret key storage.
- Soroban on-chain split contract (deferred to v3).
- Batches > 10 recipients (deferred to v2).
- Mobile-native app.

---

## 4. Stellar Architecture & Technical Specifications

### Core Primitives Used

| Primitive | Role in MuxPay |
|---|---|
| Multi-operation transaction | Each recipient = one op; atomicity guaranteed |
| `Payment` op | Direct same-asset transfer (XLM → XLM, USDC → USDC) |
| `PathPaymentStrictReceive` op | Cross-asset: sender pays XLM, recipient receives USDC (DEX path required) |
| Muxed accounts (`M…`) | Optional — map off-chain member IDs to addressable sub-accounts |
| `Networks.TESTNET` passphrase | Prevents `tx_bad_auth` from wrong network |

### SDK Stack

- `@stellar/stellar-sdk` v15 — use the `rpc` namespace, NOT deprecated `SorobanRpc`
- `@stellar/freighter-api` v6 — `signTransaction` returns `{ signedTxXdr, signerAddress }`
- Network: **testnet only** for MVP

### Transaction Construction (v15-correct)

```typescript
// web/src/lib/payment.ts
import {
  TransactionBuilder, Operation, Asset, Networks,
  Keypair, MuxedAccount
} from '@stellar/stellar-sdk';
import { Horizon } from '@stellar/stellar-sdk';

const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');

export async function buildBatchTx(
  senderPubKey: string,
  recipients: Recipient[]
) {
  // Fetch fresh sequence number immediately before build (reduces bad_seq)
  const senderAccount = await horizon.loadAccount(senderPubKey);

  const opCount = recipients.length;
  // baseFee × (1 + opCount) — show this estimate in UI before signing
  const baseFee = String(100 * (1 + opCount));

  const tx = new TransactionBuilder(senderAccount, {
    fee: baseFee,
    networkPassphrase: Networks.TESTNET, // NEVER a hardcoded string
  });

  for (const r of recipients) {
    const destination = r.muxed || r.address; // prefer M... if provided

    if (r.needsConversion && r.path) {
      tx.addOperation(Operation.pathPaymentStrictReceive({
        sendAsset: Asset.native(),
        sendMax: r.sendMaxEstimate, // include slippage buffer (e.g. ×1.05)
        destination,
        destAsset: r.destAsset,
        destAmount: r.amount,
        path: r.path,
      }));
    } else {
      tx.addOperation(Operation.payment({
        destination,
        asset: r.asset ?? Asset.native(),
        amount: r.amount,
      }));
    }
  }

  return tx.setTimeout(30).build();
}
```

### Freighter Integration (v6-correct)

```typescript
// web/src/lib/sign.ts
import { Networks } from '@stellar/stellar-sdk';

export async function signWithFreighter(txXdr: string): Promise<string> {
  // Dynamic import ONLY — static import breaks SSR in Next.js
  const { signTransaction } = await import('@stellar/freighter-api');

  const result = await signTransaction(txXdr, {
    networkPassphrase: Networks.TESTNET,
  });

  // v6: result is { signedTxXdr, signerAddress } — NOT a bare string
  return result.signedTxXdr;
}
```

### Submit and Poll for Finality

```typescript
// web/src/lib/payment.ts (continued)
import { Horizon, TransactionBuilder, Networks } from '@stellar/stellar-sdk';

const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');

export async function submitAndPoll(signedXdr: string) {
  const tx = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
  const response = await horizon.submitTransaction(tx as any);

  // PENDING is NOT success — poll for finality
  // (Classic Horizon transactions resolve synchronously on submit,
  //  but we still read response.successful to be explicit.)
  if (!response.successful) {
    const result = (response as any).extras?.result_codes;
    throw new Error(`Transaction failed: ${JSON.stringify(result)}`);
  }

  return { hash: response.hash, ledger: response.ledger };
}
```

> **Gotcha**: `sendTransaction` returning PENDING is not success. For classic multi-op txs via Horizon, `submitTransaction` resolves when the ledger closes (synchronous), but always verify `response.successful` before showing the user a success state.

### Pathfinder Integration

```typescript
// web/src/lib/pathfinder.ts
import { Horizon, Asset } from '@stellar/stellar-sdk';

const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');

export async function findPath(
  sourceAsset: Asset,
  destAsset: Asset,
  destAmount: string
) {
  try {
    const paths = await horizon
      .strictReceivePaths(sourceAsset, destAmount, [destAsset])
      .call();
    return paths.records[0] ?? null; // null = no DEX route
  } catch {
    return null;
  }
}
```

### Trustline Pre-Flight

```typescript
// web/src/lib/trustline.ts
import { Horizon } from '@stellar/stellar-sdk';

const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');

export async function hasTrustline(
  address: string,
  assetCode: string,
  assetIssuer: string
): Promise<boolean> {
  try {
    const account = await horizon.loadAccount(address);
    return account.balances.some(
      (b) =>
        b.asset_type !== 'native' &&
        (b as any).asset_code === assetCode &&
        (b as any).asset_issuer === assetIssuer
    );
  } catch {
    return false; // account not found = no trustline
  }
}
```

### Muxed Account Construction

```typescript
// web/src/lib/muxed.ts
import { MuxedAccount } from '@stellar/stellar-sdk';

// Build an M... address from a base G... address and an off-chain member ID
export function buildMuxedAddress(baseAddress: string, memberId: bigint): string {
  const muxed = new MuxedAccount.fromAddress(baseAddress, memberId.toString());
  return muxed.accountId(); // returns M... string
}
```

---

## 5. Component & Data Specifications

### Frontend Components

| Component | Responsibility |
|---|---|
| `WalletButton` | Dynamic Freighter import, connect/disconnect, address display |
| `RecipientEditor` | CSV drag-drop + inline table editor with row validation |
| `PathfinderBadge` | Per-row indicator: `DEX path found` / `Direct payment` / `No route` |
| `TrustlineWarning` | Per-row warning when recipient lacks trustline for target asset |
| `Preview` | Collapsible op-by-op panel: recipient, type, amount, asset, fee estimate |
| `SignAndSubmit` | Orchestrates buildBatchTx → signWithFreighter → submitAndPoll |
| `StatusPanel` | Polling progress, final Stellar Expert link, per-op confirmations |

### In-Memory Data Model

```typescript
interface Recipient {
  id: string;           // off-chain label (e.g. "Maria Cruz")
  address: string;      // G... base address
  muxed?: string;       // M... if member ID provided
  amount: string;       // human-readable (e.g. "5.00")
  asset: Asset;         // destination asset
  needsConversion: boolean;
  path?: Asset[];       // DEX path if needsConversion
  sendMaxEstimate?: string; // sendMax with 5% slippage buffer
  trustlineOk: boolean; // result of pre-flight check
}

interface Batch {
  senderPubKey: string;
  recipients: Recipient[];
  opCount: number;
  feeEstimate: string;  // in XLM stroops
  builtXDR?: string;
  txHash?: string;
}
```

---

## 6. Testing Strategy

### Unit Tests

- CSV parsing: comma/semicolon delimiters, quoted fields, extra whitespace.
- Address validation: valid G…, valid M…, invalid strings rejected.
- Muxed address construction: given base G… + member ID → expected M… string.
- Fee estimation: `baseFee × (1 + opCount)` matches Horizon result within ±10%.
- `sendMax` slippage buffer: `destAmount × 1.05` correct for i128 representation.

### Integration Tests

- Build XDR for 1, 3, and 10 recipients; decode and verify op types and amounts.
- Pathfinder returns valid path for XLM → USDC (testnet has adequate liquidity).
- Trustline pre-flight: account with USDC trustline returns `true`; account without returns `false`.

### End-to-End Tests (20 testnet runs)

- 5 runs: 10 recipients, all XLM direct payment. Verify atomicity and latency ≤ 20 s.
- 5 runs: 5 XLM + 5 USDC recipients (mixed asset, USDC recipients have trustlines).
- 5 runs: path payment (XLM → USDC via DEX). Verify `PathPaymentStrictReceive` op in result.
- 5 edge-case runs: 1 recipient with missing trustline → UI warning blocks submit.

### Error Path Coverage

| Scenario | Expected UI Behavior |
|---|---|
| Pathfinder returns no route | Preview shows `No DEX route` warning; op falls back to direct payment if same asset |
| Recipient missing trustline | Row marked red in preview; `Create & Sign` button disabled |
| `bad_seq` on submit | Retry once with fresh sequence number; show error on second failure |
| Freighter extension missing | Timeout after 5 s; show "Install Freighter" link |
| Tx rejected by user in Freighter | Show "Signing cancelled" state; allow re-attempt |

---

## 7. Security & Privacy

- Private keys are handled exclusively by Freighter. The app never accesses `secretKey`.
- `@stellar/freighter-api` imported with dynamic `await import(...)` — static import breaks SSR and may expose the extension in a server context.
- Freighter calls wrapped with a 5-second timeout to handle missing-extension hangs.
- Address checksum validation applied to all G… and M… inputs before build.
- XDR is not persisted to `localStorage`; only `txHash` and public keys are stored.
- No server component — all transaction building is client-side, reducing attack surface.
- Recipient amounts are validated as positive finite decimals (max 7 decimal places, Stellar's precision).

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| DEX path not available for desired conversion | Medium | Medium | Pre-check pathfinder in preview; clearly show fallback option |
| Recipient missing trustline | High (USDC recipients) | High (op fails) | Pre-flight trustline check; block submit until resolved |
| `bad_seq` from stale account sequence | Low | Medium | Fetch fresh account sequence immediately before `build()` |
| Fee spike with 10 ops | Low | Low | Show fee estimate early; cap MVP at 10 recipients |
| XDR size exceeds Stellar limits | Very low | High | Check `tx.toEnvelope().toXDR().length` before signing |
| Freighter v6 breaking change | Low | High | Wrap call in try/catch; check `.signedTxXdr` property exists |
| Testnet congestion during demo | Low | Medium | Pre-run 5 warmup transactions; have backup demo keypairs ready |

---

## 9. Judging Rubric Alignment & Bonus Strategy

### Base Score Analysis (Target: 85–100 / 100)

| Criterion | Weight | How MuxPay Earns It | Target |
|---|---|---|---|
| **Meaningful Use of Stellar** | 25 pts | Multi-op atomicity, muxed accounts, PathPaymentStrictReceive — three primitives that are *native to Stellar* and have no equivalent on EVM chains | 22–25 |
| **Problem & Real-World Relevance** | 20 pts | Directly addresses Filipino cooperative/OFW group payouts; differentiates from SDP by targeting informal small-group admins | 17–20 |
| **Functionality & Completeness** | 20 pts | Full golden path runs on testnet; Stellar Expert link confirms delivery; all error states handled | 18–20 |
| **Technical Execution & Code Quality** | 15 pts | v15 SDK patterns (rpc namespace), Freighter v6 (.signedTxXdr), simulation awareness, polling for finality | 13–15 |
| **Product Thinking & UX** | 10 pts | Empty states, trustline warnings, pathfinder badge, loading indicators, disabled submit on warnings | 8–10 |
| **Presentation & Demo Clarity** | 10 pts | 2–4 min video showing CSV paste → preview → sign → Stellar Expert link | 8–10 |

**Base score estimate: 86–100**

### Bonus Point Strategy (Target: +7 to +10)

| Bonus | Points | Action Required |
|---|---|---|
| **Underused Stellar primitives** | +2 | Muxed accounts (M…) are explicitly listed as an underused primitive in JUDGING.md. Ensure the demo CSV includes at least one M… address and explain it in the README. |
| **Ecosystem composability** | +3 | PathPaymentStrictReceive routes through Stellar's native DEX (Aquarius/Soroswap liquidity). Call this out explicitly as composability in the README. |
| **Genuine novelty** | +3 | No existing public Stellar project provides a browser-native, noncustodial, multi-op batch payout UI for informal Filipino groups. Reference novelty check against `stellar-300-ideas.md` and `stellar_repos.txt` in the README. |
| **Testnet-to-mainnet readiness** | +2 | Add a clear mainnet migration checklist to the README: change `Networks.TESTNET` to `Networks.PUBLIC`, swap Horizon/RPC URLs, swap USDC issuer. All env-variable driven. |

---

## 10. Submission Readiness
### Demo Script (Live / Video)

```
0:00 – Open MuxPay dApp; click Connect Wallet → Freighter popup → connected (show address)
0:20 – Paste 5-recipient CSV (2 XLM direct, 2 USDC path, 1 M... muxed)
0:40 – Show preview: per-op details, fee estimate, DEX path badges, trustline status
1:00 – Click "Create & Sign" → Freighter signs (one prompt)
1:15 – Show polling "Waiting for ledger…" → SUCCESS
1:30 – Click Stellar Expert link → show all 5 ops in one tx
1:50 – Explain atomicity: all ops in one tx = either all succeed or none
2:00 – Show muxed account in op: M... address mapped from member ID
2:20 – Q&A / summary
```

---

## 11. Roadmap

### v1 — MVP (This Submission)

- Web UI (Next.js 16 + Tailwind v4)
- CSV upload + inline editor, up to 10 recipients
- Freighter connect + single-sign multi-op tx
- XLM direct payments + USDC path payments via DEX
- Muxed account support (M… input)
- Trustline pre-flight check + warning
- Stellar Expert deep link on success

### v2 — Post-Hackathon

- Batch size > 10 via unsigned envelope helper (server-assisted, non-custodial)
- SEP-7 payment request QR codes for recipient confirmation
- Webhook notifications for recipients (delivery confirmation)
- Scheduled / recurring payouts (barangay monthly stipends)

### v3 — Smart Contract Layer

- Soroban on-chain splitting contract for trust-minimized timed distributions
- Sponsored reserves (`BeginSponsoringFutureReserves`) so recipients with zero XLM can still receive USDC
- Multi-sig approval for group-controlled treasury payout authorization

---

## 12. Appendix

### Network Reference

| Resource | Value |
|---|---|
| Soroban RPC | `https://soroban-testnet.stellar.org` |
| Horizon | `https://horizon-testnet.stellar.org` |
| Friendbot | `https://friendbot.stellar.org?addr=YOUR_KEY` |
| Network passphrase | `Networks.TESTNET` (never hardcode the string) |
| USDC issuer (Circle, testnet) | `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5` |
| Explorer | `https://stellar.expert/explorer/testnet` |

### README Template (for Submission)

```markdown
# MuxPay Splitter

Atomic batch payout for Filipino cooperative and OFW group admins — one Freighter signature pays all recipients simultaneously.

## Problem
Group admins (barangay treasurers, OFW pool coordinators, cooperative officers) manually send tens of individual Stellar payments to distribute shared funds. Each transaction is separate: higher fees, manual errors, and no atomicity. One failed payment leaves the batch in an inconsistent state.

## How It Works
1. Admin pastes a CSV of recipients (address, amount, asset)
2. App checks DEX path availability and trustlines per recipient
3. Admin reviews the op-by-op preview and fee estimate
4. One Freighter signature submits a single multi-op transaction
5. All recipients are paid simultaneously — atomically

## How It Uses Stellar
- **Multi-operation transaction**: atomic delivery — all ops commit or none do
- **Muxed accounts (M…)**: map off-chain member IDs to ledger-addressable sub-accounts
- **PathPaymentStrictReceive**: sender pays XLM; recipient receives USDC via native DEX
- **Horizon pathfinder**: pre-flight DEX route check before the tx is built
- **Trustline pre-flight**: warns admin before signing if any recipient lacks a trustline

## Track
Track 2 — Financial Inclusion & Everyday Payments

## Tech Stack
- Framework: Next.js 16, TypeScript, Tailwind v4
- Stellar SDK: @stellar/stellar-sdk v15
- Wallet: @stellar/freighter-api v6
- Network: Stellar testnet

## Setup & Run
\`\`\`bash
git clone <repo>
cd muxpay-splitter/web
npm install
npm run dev
# open http://localhost:3000
# Install Freighter browser extension and switch to Testnet
\`\`\`

## Network Details
- Network: Stellar testnet
- Horizon: https://horizon-testnet.stellar.org
- USDC issuer: GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5

## Novelty
No existing public Stellar project provides a browser-native, noncustodial, multi-op batch UI specifically for informal Filipino group payouts. The Stellar Disbursement Platform targets enterprise-scale server-side flows; MuxPay targets a single admin with a wallet and a spreadsheet. Checked against stellar-300-ideas.md (ideas 26–80, Track 2) and stellar_repos.txt.

## Mainnet Migration
Flip four env vars: NEXT_PUBLIC_NETWORK=public, NEXT_PUBLIC_HORIZON_URL, NEXT_PUBLIC_RPC_URL (provider-specific), NEXT_PUBLIC_USDC_ISSUER. No code changes needed.

## Team
- [Name] — @[github-username]

## License
MIT
```

### Demo Testnet Setup

```bash
# 1. Fund sender account
curl "https://friendbot.stellar.org?addr=SENDER_G..."

# 2. Fund recipient accounts (need XLM for minimum balance)
curl "https://friendbot.stellar.org?addr=RECIPIENT1_G..."
# ... repeat for each

# 3. Add USDC trustlines to recipients that will receive USDC
# Use Stellar Lab: lab.stellar.org or the trustline.ts helper
# USDC issuer: GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5

# 4. Fund sender with testnet USDC (if sending USDC)
# Circle testnet faucet: https://faucet.circle.com → select Stellar testnet

# 5. Prepare demo CSV
# recipient_id,address,amount,asset
# Maria Cruz,G...,5.00,XLM
# Juan Dela Cruz,M...,3.00,XLM
# Ana Reyes,G...,10.00,USDC
```

---

*v2.0 — Rewritten against StellarX PUP judging rubric, TRACKS.md Track 2, SDK v15 patterns, Freighter v6, and bonus point strategy. Stellar primitives: multi-op atomic tx, muxed accounts, PathPaymentStrictReceive, trustline pre-flight.*
