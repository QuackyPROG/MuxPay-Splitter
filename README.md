# MuxPay Splitter

A Stellar-powered payment splitter that automates splitting a single incoming
payment across multiple recipients (merchant, vendor, platform fee) with
transparent, on-chain settlement.

## One-line description
Split single payments to multiple recipients on Stellar (Testnet/Mainnet).

## Problem
Small merchants, marketplaces, and informal seller groups often need to split
payments and share fees with minimal friction. Manual reconciliation is error-
prone and slow. MuxPay automates splitting so funds are distributed reliably
and quickly.

## How It Works
- The payer initiates a payment from the web UI and connects a Freighter wallet.
- The frontend either calls a Soroban contract that performs the split, or
  constructs a set of atomic operations that distribute funds to recipients.
- Transactions are simulated, signed by the payer, submitted to Soroban RPC/
  Horizon, and polled until finality.

## How It Uses Stellar
- Payments: uses Stellar payments and transactions for value transfer.
- Soroban: optional on-chain splitting logic and state (examples in
  `contracts/`).
- Wallet integration: Freighter for signing; best-practice simulation + polling
  of transaction status before accepting success.

## Track
Track 2 — Financial Inclusion & Everyday Payments

## Tech Stack
- Frontend: Next.js (TypeScript) in `web/`
- UI: Tailwind CSS
- Stellar libraries: `@stellar/stellar-sdk` (v15+), `@stellar/freighter-api` (v6+)
- Contracts: Rust + `soroban-sdk` (contracts in `contracts/`)

## Setup & Run
Prerequisites:
- Node 18+ and npm
- Rust and Cargo (only if building/deploying contracts)
- Freighter browser extension for signing

1. Clone the repo

```bash
git clone https://github.com/<your-org>/mux-pay.git
cd mux-pay
```

2. Run the frontend

```bash
cd web
npm install
# Set environment variables in a .env.local or your shell:
# NEXT_PUBLIC_SOROBAN_RPC=https://soroban-testnet.stellar.org
# NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
# NEXT_PUBLIC_NETWORK=TESTNET
npm run dev
```

Open http://localhost:3000 and connect a Freighter wallet configured for Testnet.

3. Build & deploy contracts (optional)

```bash
cd contracts/savings-goal
cargo test
cargo build --target wasm32-unknown-unknown --release
# Use the Stellar CLI or your preferred tool to deploy the generated WASM to testnet
# stellar contract deploy --wasm target/wasm32-unknown-unknown/release/<contract>.wasm --network testnet
```

Once deployed, add the contract ID to `web/.env.local` as `NEXT_PUBLIC_CONTRACT_ID`
and restart the frontend.

## Network Details
- Network: testnet (recommended for judging); mainnet supported with configuration
- Soroban RPC: https://soroban-testnet.stellar.org
- Horizon: https://horizon-testnet.stellar.org
- Network passphrase: `Test SDF Network ; September 2015`

## Contract IDs / Asset Issuers
- Contract IDs: (fill after deployment)
- Asset issuers: (fill if using custom assets)

## Team
- [Full Name] — @[github-username]
- [Full Name] — @[github-username]

## License
This project is available under the MIT License. See the `LICENSE` file.

## Notes for Judges
- This README follows the StellarX submission guidelines. The repo contains
  a working frontend in `web/` and an example Soroban contract in
  `contracts/savings-goal/` to demonstrate splitting logic.

