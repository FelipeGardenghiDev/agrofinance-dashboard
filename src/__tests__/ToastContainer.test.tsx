import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ToastContainer from '../app/components/ui/ToastContainer';
import { useAgroFinanceStore } from '../lib/store';

describe('ToastContainer - Feedback Global de Notificações', () => {
  beforeEach(() => {
    useAgroFinanceStore.getState().resetToDefaultData();
  });

  it('não deve renderizar nada quando não houver toasts', () => {
    render(<ToastContainer />);
    expect(screen.queryByTestId('toast-container')).not.toBeInTheDocument();
  });

  it('deve renderizar o toast adicionado com título e mensagem e estilo acessível', () => {
    render(<ToastContainer />);

    act(() => {
      useAgroFinanceStore.getState().addToast({
        type: 'success',
        title: 'Depósito Efetuado',
        message: 'R$ 1.500,00 creditados na sua conta.',
      });
    });

    const container = screen.getByTestId('toast-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('aria-live', 'polite');

    expect(screen.getByText('Depósito Efetuado')).toBeInTheDocument();
    expect(screen.getByText('R$ 1.500,00 creditados na sua conta.')).toBeInTheDocument();
    expect(screen.getByTestId('toast-success')).toBeInTheDocument();
  });

  it('deve remover o toast ao clicar no botão fechar', () => {
    render(<ToastContainer />);

    act(() => {
      useAgroFinanceStore.getState().addToast({
        type: 'error',
        title: 'Falha no PIX',
        message: 'Chave não encontrada',
      });
    });

    expect(screen.getByText('Falha no PIX')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /fechar notificação/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Falha no PIX')).not.toBeInTheDocument();
    expect(screen.queryByTestId('toast-container')).not.toBeInTheDocument();
  });
});
