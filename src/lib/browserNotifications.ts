/**
 * Sistema de Notificações Preditivas no Navegador (Web Notification API)
 * Dispara alertas preditivos de risco financeiro, chamadas de margem de CPR e travas B3
 * com permissão controlada e fallback silencioso.
 */

export class BrowserNotificationManager {
  private static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Retorna o status de permissão atual ('default', 'granted', 'denied')
   */
  static getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  /**
   * Solicita permissão do usuário para alertas no navegador
   */
  static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Dispara uma notificação nativa do sistema operacional
   */
  static notify(title: string, options?: NotificationOptions): boolean {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return false;
    }

    try {
      const n = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        silent: false,
        ...options,
      });

      // Auto-fechar após 6 segundos se não interagido
      setTimeout(() => n.close(), 6000);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Dispara alerta de margem / risco de CPR
   */
  static alertCPRMarginWarning(contractNumber: string, currentLtvPercent: number): boolean {
    return this.notify(`⚠️ Alerta de Margem CPR #${contractNumber}`, {
      body: `O valor de mercado das sacas em garantia caiu. LTV atual em ${currentLtvPercent}%. Considere travar o preço na B3.`,
      tag: `cpr-margin-${contractNumber}`,
    });
  }

  /**
   * Dispara alerta de oportunidade de Hedge
   */
  static alertHedgeOpportunity(symbol: string, reason: string): boolean {
    return this.notify(`🎯 Oportunidade de Hedge (${symbol})`, {
      body: reason,
      tag: `hedge-opp-${symbol}`,
    });
  }
}
