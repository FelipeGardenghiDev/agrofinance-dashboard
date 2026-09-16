import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationCenter from '../app/components/features/NotificationCenter';
import { useAgroFinanceStore } from '../lib/store';

describe('NotificationCenter - Central de Alertas e Notificações', () => {
  beforeEach(() => {
    useAgroFinanceStore.getState().resetToDefaultData();
  });

  it('deve renderizar o botão do sino e o badge com o total de notificações não lidas', () => {
    render(<NotificationCenter />);
    const button = screen.getByRole('button', { name: /notificações e alertas/i });
    expect(button).toBeInTheDocument();

    const badge = screen.getByTestId('unread-badge');
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toBe('2'); // NOTIF-001 e NOTIF-002 não lidas no mock
  });

  it('deve abrir o dropdown de notificações ao clicar no sino', () => {
    render(<NotificationCenter />);
    const button = screen.getByRole('button', { name: /notificações e alertas/i });

    // Dropdown inicialmente fechado
    expect(screen.queryByTestId('notifications-dropdown')).not.toBeInTheDocument();

    fireEvent.click(button);

    // Dropdown visível
    expect(screen.getByTestId('notifications-dropdown')).toBeInTheDocument();
    expect(screen.getByText('Alertas & Notificações')).toBeInTheDocument();
    expect(screen.getByText(/Cotação em Alta: Soja Premium/i)).toBeInTheDocument();
  });

  it('deve permitir filtrar entre Todas, Não lidas e RWA', () => {
    render(<NotificationCenter />);
    const button = screen.getByRole('button', { name: /notificações e alertas/i });
    fireEvent.click(button);

    // Filtro Não lidas
    const unreadTab = screen.getByRole('button', { name: /Não lidas/i });
    fireEvent.click(unreadTab);
    expect(screen.getByText(/Cotação em Alta: Soja Premium/i)).toBeInTheDocument();
    // Aprovado é read: true, então não deve aparecer no filtro Não lidas
    expect(screen.queryByText(/Cadastro de Produtor Rural Aprovado/i)).not.toBeInTheDocument();

    // Filtro RWA
    const rwaTab = screen.getByRole('button', { name: /RWA & Grãos/i });
    fireEvent.click(rwaTab);
    expect(screen.getByText(/Liberação de Armazém \(CDA\/WA\)/i)).toBeInTheDocument();
  });

  it('deve marcar todas as notificações como lidas ao clicar em "Ler todas"', () => {
    render(<NotificationCenter />);
    const button = screen.getByRole('button', { name: /notificações e alertas/i });
    fireEvent.click(button);

    const markAllButton = screen.getByText('Ler todas');
    fireEvent.click(markAllButton);

    // Badge de não lidas deve desaparecer
    expect(screen.queryByTestId('unread-badge')).not.toBeInTheDocument();

    // Todas no store estão lidas
    const currentNotifs = useAgroFinanceStore.getState().notifications;
    expect(currentNotifs.every((n) => n.read)).toBe(true);
  });

  it('deve fechar o dropdown ao pressionar a tecla Escape', () => {
    render(<NotificationCenter />);
    const button = screen.getByRole('button', { name: /notificações e alertas/i });
    fireEvent.click(button);
    expect(screen.getByTestId('notifications-dropdown')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('notifications-dropdown')).not.toBeInTheDocument();
  });

  it('deve limpar todas as notificações ao clicar em "Limpar"', () => {
    render(<NotificationCenter />);
    const button = screen.getByRole('button', { name: /notificações e alertas/i });
    fireEvent.click(button);

    const clearButton = screen.getByTitle('Limpar todas as notificações');
    fireEvent.click(clearButton);

    expect(screen.getByText('Nenhuma notificação encontrada')).toBeInTheDocument();
    expect(useAgroFinanceStore.getState().notifications.length).toBe(0);
  });
});
