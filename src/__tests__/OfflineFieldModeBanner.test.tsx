import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import OfflineFieldModeBanner from '../app/components/features/OfflineFieldModeBanner';
import { useAgroFinanceStore } from '../lib/store';

describe('Modo Campo & Resiliência Offline (PWA)', () => {
  beforeEach(() => {
    act(() => {
      useAgroFinanceStore.getState().resetToDefaultData();
      useAgroFinanceStore.getState().setOfflineFieldMode(false);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('não deve renderizar o banner quando estiver online', () => {
    render(<OfflineFieldModeBanner />);
    expect(screen.queryByTestId('offline-field-mode-banner')).not.toBeInTheDocument();
  });

  it('deve renderizar o banner de Modo Campo quando isOfflineFieldMode for true', () => {
    act(() => {
      useAgroFinanceStore.getState().setOfflineFieldMode(true);
    });

    render(<OfflineFieldModeBanner />);
    expect(screen.getByTestId('offline-field-mode-banner')).toBeInTheDocument();
    expect(screen.getByText(/Modo Campo Ativo \(Offline\)/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Sem conexão com a internet. Os saldos, custódia RWA e contratos continuam disponíveis via cache local/i)
    ).toBeInTheDocument();
  });

  it('deve permitir desativar o Modo Campo clicando em "Simular Reconexão"', () => {
    act(() => {
      useAgroFinanceStore.getState().setOfflineFieldMode(true);
    });

    render(<OfflineFieldModeBanner />);

    const reconnectBtn = screen.getByRole('button', { name: /Simular Reconexão/i });
    expect(reconnectBtn).toBeInTheDocument();

    act(() => {
      fireEvent.click(reconnectBtn);
    });

    expect(useAgroFinanceStore.getState().isOfflineFieldMode).toBe(false);
    expect(screen.queryByTestId('offline-field-mode-banner')).not.toBeInTheDocument();
  });

  it('deve responder aos eventos nativos do navegador online e offline', () => {
    render(<OfflineFieldModeBanner />);

    // Simula evento nativo 'offline'
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(useAgroFinanceStore.getState().isOfflineFieldMode).toBe(true);

    // Simula evento nativo 'online'
    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(useAgroFinanceStore.getState().isOfflineFieldMode).toBe(false);

    // Deve ter adicionado toast de conexão restabelecida
    const toasts = useAgroFinanceStore.getState().toasts;
    expect(toasts.some((t) => t.title.includes('Conexão Restabelecida'))).toBe(true);
  });
});
