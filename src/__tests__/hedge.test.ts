import { describe, it, expect, beforeEach } from 'vitest';
import { calculateHedgeSimulation, calculateHedgePayoff } from '../lib/utils';
import { useAgroFinanceStore } from '../lib/store';
import { mockHedgeContracts } from '../lib/mockData';
import type { HedgeContract } from '../lib/types';

describe('Cálculos Financeiros de Hedge & Derivativos B3/CBOT', () => {
  it('deve calcular corretamente uma simulação de Opção Put No Dinheiro (ATM)', () => {
    const sim = calculateHedgeSimulation(
      'commodity_put',
      'Soja Premium B3',
      'SOJA24',
      'Março/2027',
      1000,
      50.00,
      50.00,
      100000
    );

    expect(sim.totalProtectedValue).toBe(50000); // 1000 * 50
    expect(sim.premiumRatePercent).toBe(3.2);
    expect(sim.premiumCost).toBe(1600); // 50000 * 0.032
    expect(sim.isEligible).toBe(true);
    expect(sim.isITM).toBe(false);
    expect(sim.intrinsicValuePerSaca).toBe(0);
  });

  it('deve identificar posição Dentro do Dinheiro (ITM) com ganho intrínseco e prêmio ajustado', () => {
    // Strike de R$ 55 com Spot de R$ 50 -> Strike > Spot por 10% (ITM)
    const sim = calculateHedgeSimulation(
      'commodity_put',
      'Soja Premium B3',
      'SOJA24',
      'Março/2027',
      1000,
      55.00,
      50.00,
      100000
    );

    expect(sim.totalProtectedValue).toBe(55000);
    expect(sim.isITM).toBe(true);
    expect(sim.intrinsicValuePerSaca).toBe(5.00);
    expect(sim.premiumRatePercent).toBe(4.5);
    expect(sim.premiumCost).toBe(2475); // 55000 * 0.045
    expect(sim.isEligible).toBe(true);
  });

  it('deve identificar posição Fora do Dinheiro (OTM) com prêmio mais econômico', () => {
    // Strike de R$ 45 com Spot de R$ 50 -> Strike < Spot por 10% (OTM)
    const sim = calculateHedgeSimulation(
      'commodity_put',
      'Soja Premium B3',
      'SOJA24',
      'Março/2027',
      1000,
      45.00,
      50.00,
      100000
    );

    expect(sim.isITM).toBe(false);
    expect(sim.intrinsicValuePerSaca).toBe(0);
    expect(sim.premiumRatePercent).toBe(2.2);
    expect(sim.premiumCost).toBe(990); // 45000 * 0.022
  });

  it('deve reprovar elegibilidade quando saldo em conta for insuficiente para o prêmio', () => {
    const sim = calculateHedgeSimulation(
      'commodity_put',
      'Soja Premium B3',
      'SOJA24',
      'Março/2027',
      5000,
      50.00,
      50.00,
      500 // saldo disponível muito baixo para cobrir R$ 8.000 de prêmio
    );

    expect(sim.isEligible).toBe(false);
  });

  it('deve calcular payoff de liquidação para contratos ITM e OTM', () => {
    const itmContract: HedgeContract = {
      id: 'HDG-TEST-1',
      contractNumber: 'HDG-2026-TEST',
      type: 'commodity_put',
      commodityName: 'Soja Premium',
      commoditySymbol: 'SOJA24',
      targetMaturity: 'Março/2027',
      quantitySacas: 1000,
      strikePrice: 52.00,
      currentSpotPrice: 48.00,
      totalProtectedValue: 52000,
      premiumCost: 1600,
      status: 'active',
      createdAt: new Date().toISOString(),
      expiryDate: new Date().toISOString(),
      b3RegistryHash: '0xb3...test',
    };

    const itmPayoff = calculateHedgePayoff(itmContract);
    expect(itmPayoff.isITM).toBe(true);
    expect(itmPayoff.payoffPerSaca).toBe(4.00); // 52 - 48
    expect(itmPayoff.totalPayoff).toBe(4000); // 4 * 1000
    expect(itmPayoff.netGain).toBe(2400); // 4000 - 1600

    const otmContract: HedgeContract = {
      ...itmContract,
      strikePrice: 46.00,
      currentSpotPrice: 50.00,
    };

    const otmPayoff = calculateHedgePayoff(otmContract);
    expect(otmPayoff.isITM).toBe(false);
    expect(otmPayoff.payoffPerSaca).toBe(0);
    expect(otmPayoff.totalPayoff).toBe(0);
    expect(otmPayoff.netGain).toBe(-1600); // Perda limitada ao prêmio
  });
});

describe('Gerenciamento de Estado de Hedge no Store (Zustand)', () => {
  beforeEach(() => {
    useAgroFinanceStore.getState().resetToDefaultData();
  });

  it('deve inicializar o store com contratos simulados da B3', () => {
    const contracts = useAgroFinanceStore.getState().hedgeContracts;
    expect(contracts.length).toBe(mockHedgeContracts.length);
    expect(contracts[0].contractNumber).toContain('HDG-2026-B3');
  });

  it('deve contratar uma nova trava de preço com débito em conta e registro de transação', () => {
    const initialBalance = useAgroFinanceStore.getState().account.availableBalance;
    const initialTransactions = useAgroFinanceStore.getState().transactions.length;

    const res = useAgroFinanceStore.getState().requestHedge({
      type: 'commodity_put',
      commodityName: 'Soja Premium B3',
      commoditySymbol: 'SOJA24',
      targetMaturity: 'Maio/2027',
      quantitySacas: 1000,
      strikePrice: 50.00,
      currentSpotPrice: 48.00,
      premiumRatePercent: 3.5,
    });

    expect(res.success).toBe(true);
    expect(res.contract).toBeDefined();

    const state = useAgroFinanceStore.getState();
    const expectedPremium = 1750; // (1000 * 50) * 0.035
    expect(state.account.availableBalance).toBe(Number((initialBalance - expectedPremium).toFixed(2)));
    expect(state.transactions.length).toBe(initialTransactions + 1);
    expect(state.transactions[0].category).toBe('fee');
    expect(state.transactions[0].amount).toBe(expectedPremium);
    expect(state.hedgeContracts[0].id).toBe(res.contract!.id);
  });

  it('deve recusar contratação se o saldo for insuficiente para pagar o prêmio', () => {
    // Reduz saldo da conta para R$ 10
    useAgroFinanceStore.setState((s) => ({
      account: { ...s.account, availableBalance: 10 },
    }));

    const res = useAgroFinanceStore.getState().requestHedge({
      type: 'commodity_put',
      commodityName: 'Soja Premium B3',
      commoditySymbol: 'SOJA24',
      targetMaturity: 'Maio/2027',
      quantitySacas: 2000,
      strikePrice: 50.00,
      currentSpotPrice: 48.00,
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain('Saldo insuficiente');
  });

  it('deve liquidar/exercer opção ITM creditando o ganho de proteção no saldo', () => {
    // Contrato HDG-001 tem Strike 52.00 e Spot 48.50 para 1200 sacas -> Lucro de 3.50 * 1200 = R$ 4.200,00
    const initialBalance = useAgroFinanceStore.getState().account.availableBalance;
    const res = useAgroFinanceStore.getState().settleHedge('HDG-001');

    expect(res.success).toBe(true);
    expect(res.gain).toBe(4200);

    const state = useAgroFinanceStore.getState();
    expect(state.account.availableBalance).toBe(Number((initialBalance + 4200).toFixed(2)));
    
    const contract = state.hedgeContracts.find((c) => c.id === 'HDG-001');
    expect(contract?.status).toBe('exercised');

    // Transação de crédito registrada
    expect(state.transactions[0].type).toBe('IN');
    expect(state.transactions[0].category).toBe('dividend');
    expect(state.transactions[0].amount).toBe(4200);
  });

  it('deve resetar os contratos de hedge ao restaurar dados da demo', () => {
    useAgroFinanceStore.getState().requestHedge({
      type: 'commodity_put',
      commodityName: 'Milho Extra',
      commoditySymbol: 'MLHO25',
      targetMaturity: 'Agosto/2026',
      quantitySacas: 500,
      strikePrice: 30.00,
      currentSpotPrice: 28.00,
    });

    expect(useAgroFinanceStore.getState().hedgeContracts.length).toBe(mockHedgeContracts.length + 1);

    useAgroFinanceStore.getState().resetToDefaultData();
    expect(useAgroFinanceStore.getState().hedgeContracts.length).toBe(mockHedgeContracts.length);
  });
});
