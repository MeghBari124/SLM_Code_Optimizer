/**
 * x402 Payment Middleware for Hono
 * Implements HTTP 402 Payment Required flow
 */

import type { Context, Next } from 'hono';
import { logger } from '@/common/logger';
import { facilitator } from './facilitator';
import { getResourceConfig } from './config';
import { X402_HEADERS } from './types';
import type { X402Challenge } from './types';

/**
 * x402 Middleware Factory
 * Returns middleware that protects routes with payment requirements
 */
export function x402Middleware() {
  return async (c: Context, next: Next) => {
    const method = c.req.method;
    const path = c.req.path;

    logger.debug('x402 middleware check', { method, path });

    // Get resource configuration
    const resource = getResourceConfig(method, path);
    
    if (!resource) {
      // Not a protected resource, continue
      logger.debug('Resource not protected', { method, path });
      return next();
    }

    logger.debug('Protected resource accessed', {
      method,
      path,
      price: resource.price,
    });

    // Check for payment proof in headers
    const transactionId = c.req.header(X402_HEADERS.TRANSACTION_ID);
    const walletAddress = c.req.header(X402_HEADERS.WALLET_ADDRESS);

    if (!resource.accepts?.length) {
      logger.warn('Protected resource has no payment accept configuration', { method, path });
      return c.json(
        {
          success: false,
          error: {
            code: 'PAYMENT_CONFIGURATION_ERROR',
            message: 'Payment configuration is missing for this resource.',
          },
        },
        500
      );
    }

    if (!transactionId) {
      // No payment provided - return 402 Payment Required
      logger.info('No payment provided, returning 402', { method, path });
      return return402Challenge(c, resource);
    }

    // Verify payment
    logger.info('Verifying payment', { transactionId, walletAddress });
    
    const payToAddress = resource.accepts[0]?.payTo;

    if (!payToAddress) {
      logger.warn('Protected resource has no payTo address configured', { method, path });
      return c.json(
        {
          success: false,
          error: {
            code: 'PAYMENT_CONFIGURATION_ERROR',
            message: 'Payment destination is not configured.',
          },
        },
        500
      );
    }

    const verification = await facilitator.verifyPayment(
      transactionId,
      parsePrice(resource.price),
      payToAddress
    );

    if (!verification.valid) {
      logger.warn('Payment verification failed', {
        transactionId,
        error: verification.error,
      });

      return c.json(
        {
          success: false,
          error: {
            code: 'INVALID_PAYMENT',
            message: verification.error || 'Payment verification failed',
          },
        },
        402
      );
    }

    // Payment verified - attach payment info to context
    logger.info('Payment verified successfully', {
      transactionId: verification.transactionId,
      amount: verification.amount,
    });

    // Store payment info in context for access in route handlers
    c.set('payment', {
      transactionId: verification.transactionId,
      amount: verification.amount,
      sender: verification.sender,
    });

    // Allow request to proceed
    return next();
  };
}

/**
 * Return 402 Payment Required with x402 challenge
 */
function return402Challenge(c: Context, resource: any) {
  const challenge: X402Challenge = {
    accepts: resource.accepts,
  };

  logger.debug('Returning 402 challenge', { challenge });

  return c.json(challenge, 402, {
    'Content-Type': 'application/json',
    'WWW-Authenticate': 'X402',
  });
}

/**
 * Parse price string to microunits
 * Example: "$0.02" -> 20000 (assuming 6 decimals for USDC)
 */
function parsePrice(priceString: string): number {
  const price = parseFloat(priceString.replace('$', ''));
  // Convert to microunits (6 decimals for USDC)
  return Math.round(price * 1_000_000);
}
