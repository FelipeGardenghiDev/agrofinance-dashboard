import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Header from '../app/components/layout/Header';
import { useAgroFinanceStore } from '../lib/store';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('Header & Navegação Principal', () => {
  beforeEach(() => {
    act(() => {
      useAgroFinanceStore.getState().resetToDefaultData();
      useAgroFinanceStore.getState().setOfflineFieldMode(false);
    });
  });

  it('deve renderizar o logo AgroFinance e links de navegação desktop', () => {
    render(<Header />);

    expect(screen.getByText('AgroFinance')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Transações/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Crédito & CPR/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Hedge & B3/i })).toBeInTheDocument();
  });

  it('deve alternar o Modo Campo pelo botão do header', () => {
    render(<Header />);

    const offlineBtn = screen.getByTestId('header-offline-toggle');
    expect(offlineBtn).toHaveTextContent('Modo Campo');

    act(() => {
      fireEvent.click(offlineBtn);
    });

    expect(useAgroFinanceStore.getState().isOfflineFieldMode).toBe(true);
    expect(offlineBtn).toHaveTextContent('Modo Campo (ON)');
  });

  it('deve acionar o reset dos dados da demo com confirmação do usuário', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<Header />);

    const resetBtn = screen.getByTitle('Restaurar dados iniciais da demo');
    act(() => {
      fireEvent.click(resetBtn);
    });

    expect(confirmSpy).toHaveBeenCalled();
    expect(screen.getByText('Dados Resetados!')).toBeInTheDocument();
    confirmSpy.mockRestore();
  });

  it('deve abrir e fechar o menu mobile ao clicar no botão de menu', () => {
    render(<Header />);

    const menuToggle = screen.getByLabelText('Abrir menu de navegação');
    act(() => {
      fireEvent.click(menuToggle);
    });

    // O menu mobile deve estar aberto com os links visíveis
    expect(screen.getByTestId('header-offline-toggle-mobile')).toBeInTheDocument();

    // Clica novamente para fechar
    act(() => {
      fireEvent.click(menuToggle);
    });

    expect(screen.queryByTestId('header-offline-toggle-mobile')).not.toBeInTheDocument();
  });
});
