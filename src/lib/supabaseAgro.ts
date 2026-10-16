/**
 * Supabase & Operations Room Telemetry Client para AgroFinance
 * Conecta o ecossistema Agro com o Ops Room da FGSOFT (public.ops_events)
 * com resiliência total a falhas (offline-first & silent fallback).
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vlanohkshwjkkekkljtv.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy_fallback_for_resilience';

export interface OpsEventPayload {
  eventType: 'CPR_SIMULATION' | 'CPR_ISSUED' | 'HEDGE_SIMULATION' | 'HEDGE_CONTRACT_CREATED' | 'ML_FORECAST_GENERATED' | 'RISK_ALERT';
  agentType?: string;
  sessionId?: string;
  payload: Record<string, unknown>;
}

export class SupabaseAgroTelemetry {
  private static localEventQueue: OpsEventPayload[] = [];

  /**
   * Envia evento de auditoria quant para public.ops_events no Supabase
   * Utiliza chamada REST direta (zero dependências extras, compatível com Edge e Browser)
   */
  static async emitOpsEvent(event: OpsEventPayload): Promise<{ success: boolean; queuedLocally?: boolean; error?: string }> {
    const record = {
      event_type: event.eventType,
      agent_type: event.agentType || 'quant',
      session_id: event.sessionId || 'agrofinance',
      payload: {
        ...event.payload,
        environment: process.env.NODE_ENV || 'production',
        timestamp: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    };

    try {
      if (typeof window !== 'undefined' && !window.navigator.onLine) {
        this.localEventQueue.push(event);
        return { success: true, queuedLocally: true };
      }

      const res = await fetch(`${SUPABASE_URL}/rest/v1/ops_events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(record),
      });

      if (!res.ok) {
        // Fallback silencioso para não quebrar a transação bancária do produtor
        this.localEventQueue.push(event);
        return { success: false, queuedLocally: true, error: `Supabase status: ${res.status}` };
      }

      return { success: true };
    } catch (err) {
      // Guarda na fila local em caso de falha de rede/DNS
      this.localEventQueue.push(event);
      return {
        success: false,
        queuedLocally: true,
        error: err instanceof Error ? err.message : 'Network error',
      };
    }
  }

  /**
   * Retorna os eventos pendentes na fila local
   */
  static getPendingQueue(): OpsEventPayload[] {
    return [...this.localEventQueue];
  }

  /**
   * Tenta esvaziar a fila quando a conectividade for restaurada
   */
  static async flushPendingQueue(): Promise<number> {
    if (this.localEventQueue.length === 0) return 0;
    const items = [...this.localEventQueue];
    this.localEventQueue = [];
    let flushed = 0;

    for (const item of items) {
      const res = await this.emitOpsEvent(item);
      if (res.success && !res.queuedLocally) {
        flushed++;
      }
    }
    return flushed;
  }
}
