import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PortfolioAllocationChart from '../app/components/features/PortfolioAllocationChart';
import CommodityTrendsChart from '../app/components/features/CommodityTrendsChart';
import { mockPortfolio } from '../lib/mockData';

describe('PortfolioAllocationChart - Gráfico de Rosca RWA', () => {
  it('deve renderizar o total sob custódia e todos os tokens da carteira', () => {
    render(
      <PortfolioAllocationChart
        assets={mockPortfolio.assets}
        totalValue={mockPortfolio.totalValue}
      />
    );

    // Deve exibir o título
    expect(screen.getByText('Alocação de Ativos RWA')).toBeInTheDocument();
    expect(screen.getByText('4 ativos')).toBeInTheDocument();

    // Deve exibir os tokens na legenda
    expect(screen.getByText('SOJA24')).toBeInTheDocument();
    expect(screen.getByText('SOJAO')).toBeInTheDocument();
    expect(screen.getByText('MLHO25')).toBeInTheDocument();
    expect(screen.getByText('MLHOP')).toBeInTheDocument();
  });

  it('deve renderizar mensagem amigável quando não houver ativos', () => {
    render(<PortfolioAllocationChart assets={[]} totalValue={0} />);
    expect(screen.getByText('Nenhum ativo sob custódia para exibir')).toBeInTheDocument();
  });
});

describe('CommodityTrendsChart - Gráfico de Tendências e Cotações', () => {
  it('deve renderizar com a visão geral do patrimônio por padrão', () => {
    render(<CommodityTrendsChart />);

    expect(screen.getByText('Evolução & Cotações Históricas')).toBeInTheDocument();
    expect(screen.getByText('TOTAL')).toBeInTheDocument();
    expect(screen.getByText('SOJA24')).toBeInTheDocument();
    expect(screen.getByText('MLHO25')).toBeInTheDocument();
  });

  it('deve alternar a série exibida ao clicar no botão de uma commodity', () => {
    render(<CommodityTrendsChart />);

    // Clica no botão do token SOJA24
    const sojaBtn = screen.getByRole('button', { name: 'SOJA24' });
    fireEvent.click(sojaBtn);

    // Deve atualizar os dados e manter o botão ativo
    expect(sojaBtn).toHaveClass('bg-agro-azul-escuro');
  });
});
