import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '../app/api/quotes/route';

describe('Route Handler - /api/quotes', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('deve retornar cotação real do Dólar PTAX quando a API externa responder com sucesso', async () => {
    const mockApiResponse = {
      USDBRL: {
        code: 'USD',
        codein: 'BRL',
        name: 'Dólar Americano/Real Brasileiro',
        high: '5.8500',
        low: '5.7400',
        varBid: '0.0500',
        pctChange: '0.86',
        bid: '5.8120',
        ask: '5.8130',
        timestamp: '1789767005',
        create_date: '2026-09-18 18:30:05',
      },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockApiResponse,
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.isLiveExternal).toBe(true);
    expect(data.data.symbol).toBe('USD/BRL');
    expect(data.data.price).toBe(5.812);
    expect(data.data.change24h).toBe(0.86);
  });

  it('deve utilizar fallback resiliente local caso a API externa falhe ou sofra timeout', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Connection timeout'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(false);
    expect(data.isLiveExternal).toBe(false);
    expect(data.data.symbol).toBe('USD/BRL');
    expect(data.data.price).toBe(5.75);
    expect(data.source).toContain('Fallback Cache');
  });
});
