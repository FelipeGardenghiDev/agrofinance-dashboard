import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionDetailModal from '../app/components/features/TransactionDetailModal';
import { Transaction } from '../lib/types';

const mockTx: Transaction = {
  id: 'tx-test-01',
  date: '2026-03-20T10:00:00Z',
  description: 'Venda CPR Soja B3',
  amount: 450000,
  type: 'IN',
  category: 'rwa_sale',
  status: 'completed',
  txHash: '0xabc123456789def0',
  toAddress: 'B3 Custódia Agro',
};

describe('TransactionDetailModal', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('não deve renderizar nada se transaction for null', () => {
    const { container } = render(<TransactionDetailModal transaction={null} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('deve exibir os detalhes completos da transação', () => {
    render(<TransactionDetailModal transaction={mockTx} onClose={vi.fn()} />);

    expect(screen.getByText('Detalhes da Transação')).toBeInTheDocument();
    expect(screen.getByText('Venda CPR Soja B3')).toBeInTheDocument();
    expect(screen.getByText(/0xabc123456789def0/i)).toBeInTheDocument();
  });

  it('deve chamar onClose ao clicar no botão fechar ou pressionar Escape', () => {
    const handleClose = vi.fn();
    render(<TransactionDetailModal transaction={mockTx} onClose={handleClose} />);

    fireEvent.click(screen.getByLabelText('Fechar modal'));
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('deve copiar o hash da transação ao clicar no botão de copiar', () => {
    render(<TransactionDetailModal transaction={mockTx} onClose={vi.fn()} />);

    const copyBtn = screen.getByRole('button', { name: /Copiar/i });
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockTx.txHash);
  });
});
