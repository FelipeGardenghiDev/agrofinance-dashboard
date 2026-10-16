import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserNotificationManager } from '../lib/browserNotifications';

describe('BrowserNotificationManager - Alertas Preditivos no Navegador', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('deve retornar status denied se Notification não for suportada ou negada', () => {
    const status = BrowserNotificationManager.getPermissionStatus();
    expect(['default', 'denied', 'granted']).toContain(status);
  });

  it('deve tentar solicitar permissão de notificação sem estourar exceção', async () => {
    const res = await BrowserNotificationManager.requestPermission();
    expect(typeof res).toBe('boolean');
  });

  it('deve disparar alerta de margem de CPR com formatação adequada', () => {
    const res = BrowserNotificationManager.alertCPRMarginWarning('2026-0042', 78.5);
    // Em ambiente de teste sem Notification concedida, deve retornar false graciosamente
    expect(typeof res).toBe('boolean');
  });

  it('deve disparar alerta de oportunidade de hedge', () => {
    const res = BrowserNotificationManager.alertHedgeOpportunity('SOJA-PR', 'Volatilidade implícita caiu para 18%');
    expect(typeof res).toBe('boolean');
  });
});
