import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseAgroTelemetry } from '../lib/supabaseAgro';

describe('SupabaseAgroTelemetry - Auditoria Quant & Ops Room Telemetry', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('deve formatar e enfileirar evento de telemetria sem estourar exceção', async () => {
    // Simula falha de rede ou offline
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network offline simulation'));

    const result = await SupabaseAgroTelemetry.emitOpsEvent({
      eventType: 'HEDGE_SIMULATION',
      agentType: 'quant',
      sessionId: 'agrofinance-test',
      payload: {
        symbol: 'SOJA-PR',
        strike: 140,
        riskScore: 88,
      },
    });

    expect(result.success).toBe(false);
    expect(result.queuedLocally).toBe(true);
    expect(SupabaseAgroTelemetry.getPendingQueue().length).toBeGreaterThan(0);
  });

  it('deve enviar com sucesso quando fetch responder com 200/201', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(null, { status: 201 }));

    const result = await SupabaseAgroTelemetry.emitOpsEvent({
      eventType: 'CPR_ISSUED',
      payload: {
        amount: 50000,
        contractNumber: 'CPR-TEST-1',
      },
    });

    expect(result.success).toBe(true);
  });
});
