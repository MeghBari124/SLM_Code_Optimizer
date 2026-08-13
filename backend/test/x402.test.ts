import { describe, it, expect } from 'vitest';
import { app } from '../src/server/app';

describe('x402 Middleware Integration', () => {
  it('should return 402 Payment Required for unpaid analysis request', async () => {
    const response = await app.request('/api/v1/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: 'print("hello")', language: 'python' })
    });

    expect(response.status).toBe(402);
    expect(response.headers.get('payment-required')).toBeDefined();
    
    // Decode base64 header
    const encodedHeader = response.headers.get('payment-required');
    if (encodedHeader) {
      const decoded = JSON.parse(Buffer.from(encodedHeader, 'base64').toString('utf-8'));
      
      expect(decoded.x402Version).toBe(2);
      expect(decoded.error).toBe('Payment required');
      
      const exactScheme = decoded.accepts.find((a: any) => a.scheme === 'exact');
      expect(exactScheme).toBeDefined();
      expect(exactScheme.network).toContain('algorand');
      expect(exactScheme.amount).toBe('20000'); // $0.02 USDC
    }
  });
});
