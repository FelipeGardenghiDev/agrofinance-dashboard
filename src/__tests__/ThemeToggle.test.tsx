import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '../app/components/ui/ThemeToggle';
import { useAgroFinanceStore } from '../lib/store';

describe('ThemeToggle - Alternador de Tema', () => {
  beforeEach(() => {
    useAgroFinanceStore.getState().setTheme('light');
  });

  it('deve renderizar o botão com o tema atual', () => {
    render(<ThemeToggle />);
    const toggleButton = screen.getByRole('button', { name: /alternar tema/i });
    expect(toggleButton).toBeInTheDocument();
    expect(screen.getByText('Claro')).toBeInTheDocument();
  });

  it('deve abrir o menu dropdown com as opções Claro, Escuro e Sistema ao clicar', () => {
    render(<ThemeToggle />);
    const toggleButton = screen.getByRole('button', { name: /alternar tema/i });
    
    // Antes do clique não deve ter opções no dropdown
    expect(screen.queryByText('Escuro')).not.toBeInTheDocument();

    // Clica para abrir
    fireEvent.click(toggleButton);

    expect(screen.getByText('Escuro')).toBeInTheDocument();
    expect(screen.getByText('Sistema')).toBeInTheDocument();
  });

  it('deve alterar o tema para dark ao selecionar a opção Escuro', () => {
    render(<ThemeToggle />);
    const toggleButton = screen.getByRole('button', { name: /alternar tema/i });
    fireEvent.click(toggleButton);

    const darkOption = screen.getByText('Escuro');
    fireEvent.click(darkOption);

    expect(useAgroFinanceStore.getState().theme).toBe('dark');
  });

  it('deve fechar o dropdown ao pressionar a tecla Escape', () => {
    render(<ThemeToggle />);
    const toggleButton = screen.getByRole('button', { name: /alternar tema/i });
    fireEvent.click(toggleButton);
    expect(screen.getByText('Escuro')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Escuro')).not.toBeInTheDocument();
  });
});
