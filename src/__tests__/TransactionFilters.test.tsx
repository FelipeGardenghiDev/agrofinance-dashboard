import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionFilters from '../app/components/features/TransactionFilters';

describe('TransactionFilters - Componente de Filtros de Extrato', () => {
  it('deve renderizar os campos de filtro por tipo, status e busca', () => {
    const handleFilterChange = vi.fn();
    render(<TransactionFilters onFilterChange={handleFilterChange} />);

    expect(screen.getByText('Filtros')).toBeInTheDocument();
    expect(screen.getByText('Tipo')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Descrição ou memo...')).toBeInTheDocument();
  });

  it('deve disparar onFilterChange ao alterar o filtro de Tipo', () => {
    const handleFilterChange = vi.fn();
    render(<TransactionFilters onFilterChange={handleFilterChange} />);

    const selects = screen.getAllByRole('combobox');
    const typeSelect = selects[0];

    fireEvent.change(typeSelect, { target: { value: 'IN' } });

    expect(handleFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'IN',
      })
    );
  });

  it('deve disparar onFilterChange ao digitar no campo de busca', async () => {
    const user = userEvent.setup();
    const handleFilterChange = vi.fn();
    render(<TransactionFilters onFilterChange={handleFilterChange} />);

    const searchInput = screen.getByPlaceholderText('Descrição ou memo...');
    await user.type(searchInput, 'Soja');

    expect(handleFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        searchTerm: 'Soja',
      })
    );
  });
});
