/**
 * Sistema de Internacionalização (i18n) Institucional
 * Suporte nativo a Português (Brasil) e Inglês (Global RWA Investors)
 * com persistência em localStorage e zero dependências externas.
 */

export type Locale = 'pt-BR' | 'en';

export const DICTIONARY = {
  'pt-BR': {
    // Navegação
    nav_dashboard: 'Dashboard',
    nav_transactions: 'Transações',
    nav_credit: 'Crédito & CPR',
    nav_hedge: 'Hedge & B3',
    nav_new_operation: 'Nova Operação',
    
    // Header
    subtitle_header: 'Crédito & Agronegócio Digital',
    field_mode: 'Modo Campo',
    field_mode_on: 'Modo Campo (ON)',
    reset_demo: 'Restaurar',
    
    // Dashboard & KPIs
    welcome: 'Olá',
    welcome_sub: 'Bem-vindo(a) ao seu dashboard de investimentos RWA',
    available_balance: 'Saldo Disponível',
    rwa_custody: 'Custódia RWA',
    active_commodities: 'commodities ativas',
    rural_credit: 'Crédito Rural CPR',
    compliance_kyc: 'Compliance & KYC',
    verified_producer: 'Produtor Verificado',
    pending_docs: 'Docs Pendentes',
    
    // Ações
    dossier_btn: '📄 Dossiê Bancário (PDF)',
    notifications_btn: '🔔 Alertas Preditivos',
    what_if_title: 'Simulador de Cenários Macroeconômicos (What-If Analysis)',
    barter_title: 'Poder de Compra Agro & Barter (Relação de Troca)',
  },
  'en': {
    // Navigation
    nav_dashboard: 'Dashboard',
    nav_transactions: 'Transactions',
    nav_credit: 'Credit & CPR',
    nav_hedge: 'Hedge & B3',
    nav_new_operation: 'New Operation',
    
    // Header
    subtitle_header: 'Digital Agribusiness & Credit',
    field_mode: 'Field Mode',
    field_mode_on: 'Field Mode (ON)',
    reset_demo: 'Reset Demo',
    
    // Dashboard & KPIs
    welcome: 'Hello',
    welcome_sub: 'Welcome to your RWA agricultural investment dashboard',
    available_balance: 'Available Balance',
    rwa_custody: 'RWA Custody',
    active_commodities: 'active commodities',
    rural_credit: 'Rural Credit CPR',
    compliance_kyc: 'Compliance & KYC',
    verified_producer: 'Verified Farmer',
    pending_docs: 'Pending Docs',
    
    // Actions
    dossier_btn: '📄 Bank Audit Dossier (PDF)',
    notifications_btn: '🔔 Predictive Alerts',
    what_if_title: 'Macroeconomic What-If Scenario Simulator',
    barter_title: 'Agro Purchasing Power & Barter Ratio',
  },
};

export class I18nManager {
  private static STORAGE_KEY = 'agrofinance_locale';

  static getLocale(): Locale {
    if (typeof window === 'undefined') return 'pt-BR';
    const saved = localStorage.getItem(this.STORAGE_KEY) as Locale | null;
    return saved === 'en' ? 'en' : 'pt-BR';
  }

  static setLocale(locale: Locale): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEY, locale);
    window.dispatchEvent(new Event('agrofinance_locale_changed'));
  }

  static t(key: keyof typeof DICTIONARY['pt-BR'], locale?: Locale): string {
    const loc = locale || this.getLocale();
    return DICTIONARY[loc]?.[key] || DICTIONARY['pt-BR'][key] || key;
  }
}
