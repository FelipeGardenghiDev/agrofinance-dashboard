import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MainLayout from '../app/components/layout/MainLayout';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('MainLayout', () => {
  it('deve renderizar o Header, banners e o conteúdo principal encapsulado', () => {
    render(
      <MainLayout>
        <div data-testid="test-child">Conteúdo da Página Agro</div>
      </MainLayout>
    );

    expect(screen.getByText('AgroFinance')).toBeInTheDocument();
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Cotações de mercado ao vivo/i })).toBeInTheDocument();
  });
});
