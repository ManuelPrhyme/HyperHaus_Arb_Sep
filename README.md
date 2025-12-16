# HyperHaus

Community‑driven crypto capital allocation and vesting platform

## Overview

HyperHaus is a decentralized platform that allows individuals to create guilds, join guilds, propose trades, and collectively allocate crypto capital.
It connects capital holders with skilled traders, enabling anyone to participate in wealth creation through consensus‑driven trading and long‑term vesting.

## Core Concepts

- Guilds: Communities where members pool capital and govern trading decisions.
- Trade Proposals: Members propose trades; guilds vote to approve or reject.
- Consensus Voting: Majority rules for larger guilds, unanimous approval for small guilds.
- Capital Deployment: Approved proposals release funds to the proposer (trader).
- Profit/Loss Sharing: Margins are distributed fairly between traders, members, and vesting contracts.
- Vesting: Ensures long‑term alignment by locking part of profits into schedules claimable over time.

## Margin Distribution

When a trade closes, the margin (profit or loss) is handled as follows:

### Profits

- 40% → Vesting Contract
- Creates vesting schedules for each member based on their stake.
- 60% → Immediate Distribution
- 40% → Trader’s Account (reward for executing the trade)
- 60% → Other Guild Members (distributed pro‑rata by stake)

### Losses

- 40% → Absorbed by Trader
- 60% → Distributed among members proportionally to their stake

## End‑to‑End Flow

[Create Guild] → [Join Guild] → [Propose Trade] → [Vote] → [Execute Trade]
→ [Return Funds] → [Distribute Margin] → [Vesting Contract]

## Contracts

### HyperHaus (Core)

- Guild creation, membership, proposals, voting, trade execution
- Profit/loss distribution logic
- Interfaces with Vesting contract for long‑term rewards

### HyperHausVesting

- Creates vesting schedules for guild members
- Weekly vesting after cliff period
- Claim and cancellation functions
- Resets yearly to manage cycles

### Smart Contract Tech Stack

- Smart Contracts: Solidity (v0.8.28)
- Testing & Deployment: Amazon Q Developer, Kiro IDE, Foundry
- Consensus & Governance: DAO‑style voting logic
- Capital Pooling: Native token contributions tracked per guild
- Vesting: Custom schedules per member stake

### Frontend Tech Stack

- React.js
- Redux: for state management
- Privy: for wallet connector
- Tailwindcss: for styling

## Using Kiro IDE & Amazon Q Developer

I refactored the codebase and integrated an AI analytics modal for the guild members to get feedback about a proposal before they vote on it
![WhatsApp Image 2025-11-25 at 12 59 33_989dcc04](https://github.com/user-attachments/assets/b8a6d1c7-a56d-4a71-bbe8-943894de61ea)
![WhatsApp Image 2025-11-25 at 12 41 27_726f3878](https://github.com/user-attachments/assets/1ec639a3-75f5-4d90-b17b-f97d064e5c41)
