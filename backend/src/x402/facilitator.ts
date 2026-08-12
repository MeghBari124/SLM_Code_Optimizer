/**
 * x402 Facilitator
 * Re-exports the facilitator client from middleware module.
 * 
 * The facilitator is now handled by the official @x402-avm/core package's
 * HTTPFacilitatorClient, which communicates with the GoPlausible facilitator
 * at https://facilitator.goplausible.xyz to verify and settle payments
 * on the Algorand blockchain.
 */

export { facilitatorClient } from './middleware';
