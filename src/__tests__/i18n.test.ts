import { describe, it, expect, beforeEach } from 'vitest';
import { I18nManager, DICTIONARY } from '../lib/i18n';

describe('i18n - Sistema de Internacionalização Institucional', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve ter suporte aos idiomas pt-BR e en', () => {
    expect(DICTIONARY['pt-BR']).toBeDefined();
    expect(DICTIONARY['en']).toBeDefined();
    expect(DICTIONARY['pt-BR'].nav_dashboard).toBe('Dashboard');
    expect(DICTIONARY['en'].welcome).toBe('Hello');
  });

  it('deve retornar idioma padrão pt-BR quando storage vazio', () => {
    expect(I18nManager.getLocale()).toBe('pt-BR');
    expect(I18nManager.t('available_balance')).toBe('Saldo Disponível');
  });

  it('deve alternar para inglês e traduzir chaves corretamente', () => {
    I18nManager.setLocale('en');
    expect(I18nManager.getLocale()).toBe('en');
    expect(I18nManager.t('available_balance')).toBe('Available Balance');
    expect(I18nManager.t('rwa_custody')).toBe('RWA Custody');
    expect(I18nManager.t('dossier_btn')).toBe('📄 Bank Audit Dossier (PDF)');
  });

  it('deve disparar evento customizado de locale ao mudar idioma', () => {
    let triggered = false;
    window.addEventListener('agrofinance_locale_changed', () => {
      triggered = true;
    }, { once: true });

    I18nManager.setLocale('pt-BR');
    expect(triggered).toBe(true);
  });
});
