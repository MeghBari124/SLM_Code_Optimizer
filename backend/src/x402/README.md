# x402 Integration Layer

This directory contains the x402 micropayment integration for AlgoForge.

## Phase 2 Implementation

Files to create:
- `middleware.ts` - x402 Hono middleware
- `facilitator.ts` - GoPlausible facilitator client
- `resources.ts` - Protected resource configuration
- `payments.ts` - Payment verification logic
- `types.ts` - x402-specific types

## Reference

- x402 starter: https://github.com/marotipatre/x402-Project
- AVM docs: https://github.com/GoPlausible/.github/blob/main/profile/algorand-x402-documentation/typescript/x402-avm-paywall-examples.md

## Flow

1. Client requests protected endpoint
2. Middleware intercepts, checks for payment
3. No payment? Return 402 with challenge
4. Client signs with wallet
5. Client retries with payment proof
6. Middleware verifies with facilitator
7. Facilitator settles on Algorand
8. Middleware allows request through

## Status

⏳ To be implemented in Phase 2
