import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import LiveMarketTicker from '../app/components/features/LiveMarketTicker';
import { useAgroFinanceStore } from '../lib/store';
import { initialMarketQuotes } from '../lib/mockData';

describe('LiveMarketTicker & Cotações em Tempo Real (B3 / CBOT)', () => {
  beforeEach(() => {
    act(() => {
      useAgroFinanceStore.getState().resetToDefaultData();
    });
  });

  it('deve renderizar o ticker com badge AO VIVO e cotações das commodities', () => {
    render(<LiveMarketTicker />);

    expect(screen.getByRole('region', { name: /Cotações de mercado ao vivo/i })).toBeInTheDocument();
    expect(screen.getByText('AO VIVO')).toBeInTheDocument();
    expect(screen.getByText('SOJA-PR')).toBeInTheDocument();
    expect(screen.getByText('MILHO-B3')).toBeInTheDocument();
    expect(screen.getByText('USD/BRL')).toBeInTheDocument();
  });

  it('deve alternar entre Pausar e Retomar as cotações ao clicar no botão de controle', () => {
    render(<LiveMarketTicker />);

    const pauseButton = screen.getByRole('button', { name: /Pausar/i });
    expect(pauseButton).toBeInTheDocument();

    // Clica para pausar
    act(() => {
      fireEvent.click(pauseButton);
    });

    expect(screen.getByText('PAUSADO')).toBeInTheDocument();
    expect(useAgroFinanceStore.getState().isLiveMarketActive).toBe(false);

    // Clica para retomar
    const resumeButton = screen.getByRole('button', { name: /Retomar/i });
    act(() => {
      fireEvent.click(resumeButton);
    });

    expect(screen.getByText('AO VIVO')).toBeInTheDocument();
    expect(useAgroFinanceStore.getState().isLiveMarketActive).toBe(true);
  });

  it('deve disparar um tick de mercado manual e exibir feedback em toast', () => {
    render(<LiveMarketTicker />);

    const tickButton = screen.getByRole('button', { name: /Simular Tick/i });
    expect(tickButton).toBeInTheDocument();

    act(() => {
      fireEvent.click(tickButton);
    });

    const toasts = useAgroFinanceStore.getState().toasts;
    expect(toasts.length).toBeGreaterThan(0);
    expect(toasts[0].title).toContain('Tick de Mercado Disparado');
  });

  it('deve recalcular os preços de tokens RWA e o patrimônio total ao aplicar um tick no store', () => {
    const initialPortfolioValue = useAgroFinanceStore.getState().portfolio.totalValue;
    expect(initialPortfolioValue).toBeGreaterThan(0);

    act(() => {
      useAgroFinanceStore.getState().applyMarketTick();
    });

    const newPortfolio = useAgroFinanceStore.getState().portfolio;
    expect(newPortfolio.assets.length).toBeGreaterThan(0);
    // Cada ativo deve ter totalValue = quantity * pricePerToken
    newPortfolio.assets.forEach((asset) => {
      expect(asset.totalValue).toBe(Number((asset.quantity * asset.pricePerToken).toFixed(2)));
    });

    // O total da carteira deve ser a soma dos ativos
    const sumAssets = newPortfolio.assets.reduce((sum, a) => sum + a.totalValue, 0);
    expect(newPortfolio.totalValue).toBe(Number(sumAssets.toFixed(2)));
  });

  it('deve resetar as cotações e o status do ticker ao restaurar dados da demo', () => {
    act(() => {
      useAgroFinanceStore.getState().toggleLiveMarket();
    });
    expect(useAgroFinanceStore.getState().isLiveMarketActive).toBe(false);

    act(() => {
      useAgroFinanceStore.getState().resetToDefaultData();
    });

    expect(useAgroFinanceStore.getState().isLiveMarketActive).toBe(true);
    expect(useAgroFinanceStore.getState().marketQuotes.length).toBe(initialMarketQuotes.length);
  });
});
