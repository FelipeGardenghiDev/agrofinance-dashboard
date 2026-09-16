import { describe, it, expect, beforeEach } from 'vitest';
import { useAgroFinanceStore } from '../lib/store';
import { calculateCPRSimulation } from '../lib/utils';
import { mockRWAAssets } from '../lib/mockData';

describe('Crédito Rural & CPR Digital (Cédula de Produto Rural com Colateral RWA)', () => {
  beforeEach(() => {
    useAgroFinanceStore.getState().resetToDefaultData();
  });

  it('deve calcular a simulação financeira da CPR via Tabela Price com LTV máximo de 70%', () => {
    const asset = mockRWAAssets[0]; // Soja Premium (R$ 48,50)
    const requestedAmount = 25000;
    const termMonths = 12;

    const simulation = calculateCPRSimulation(requestedAmount, termMonths, asset, 11.5, 0.70);

    expect(simulation.requestedAmount).toBe(25000);
    expect(simulation.termMonths).toBe(12);
    expect(simulation.annualRate).toBe(11.5);
    expect(simulation.monthlyPayment).toBeGreaterThan(0);
    expect(simulation.totalRepayment).toBeGreaterThan(requestedAmount);
    expect(simulation.totalInterest).toBe(Number((simulation.totalRepayment - requestedAmount).toFixed(2)));

    // Exigência de colateral: R$ 25.000 / 0.70 = ~R$ 35.714,29 -> / 48.50 = ~737 sacas
    expect(simulation.requiredTokens).toBeGreaterThan(700);
    expect(simulation.requiredTokens).toBeLessThan(800);
    expect(simulation.isEligible).toBe(true);
    expect(simulation.effectiveLtv).toBeLessThanOrEqual(70);
  });

  it('deve indicar inelegibilidade quando a quantidade de sacas livres na carteira for insuficiente', () => {
    const asset = { ...mockRWAAssets[0], quantity: 50, lockedQuantity: 0 }; // apenas 50 sacas disponíveis
    const requestedAmount = 100000; // empréstimo alto

    const simulation = calculateCPRSimulation(requestedAmount, 12, asset, 11.5, 0.70);

    expect(simulation.isEligible).toBe(false);
    expect(simulation.requiredTokens).toBeGreaterThan(simulation.availableTokens);
  });

  it('deve contratar CPR, creditar saldo em conta, bloquear sacas como garantia e registrar contrato ativo', () => {
    const initialState = useAgroFinanceStore.getState();
    const initialBalance = initialState.account.availableBalance;
    const targetAssetId = 'RWA-SOJA-001';
    const initialAsset = initialState.portfolio.assets.find((a) => a.assetId === targetAssetId)!;
    const initialLocked = initialAsset.lockedQuantity || 0;
    const initialContractsCount = initialState.cprContracts.length;

    const loanAmount = 20000;
    const res = useAgroFinanceStore.getState().requestCPR({
      amount: loanAmount,
      termMonths: 12,
      assetId: targetAssetId,
    });

    expect(res.success).toBe(true);
    expect(res.contract).toBeDefined();
    expect(res.contract?.status).toBe('active');
    expect(res.contract?.amount).toBe(loanAmount);

    const updatedState = useAgroFinanceStore.getState();
    // Saldo em conta creditado com o valor do empréstimo
    expect(updatedState.account.availableBalance).toBe(Number((initialBalance + loanAmount).toFixed(2)));

    // Sacas bloqueadas como garantia no portfólio
    const updatedAsset = updatedState.portfolio.assets.find((a) => a.assetId === targetAssetId)!;
    expect(updatedAsset.lockedQuantity).toBeGreaterThan(initialLocked);

    // Contrato adicionado
    expect(updatedState.cprContracts.length).toBe(initialContractsCount + 1);

    // Transação de desembolso registrada no extrato
    const newestTx = updatedState.transactions[0];
    expect(newestTx.description).toContain('Crédito Rural CPR');
    expect(newestTx.type).toBe('IN');
    expect(newestTx.amount).toBe(loanAmount);

    // Toast de sucesso disparado
    expect(updatedState.toasts.length).toBeGreaterThan(0);
    expect(updatedState.toasts[updatedState.toasts.length - 1].title).toContain('CPR');
  });

  it('deve recusar contratação de CPR quando o colateral livre for insuficiente', () => {
    const initialState = useAgroFinanceStore.getState();
    const initialBalance = initialState.account.availableBalance;

    // Tenta pegar empréstimo milionário que excede as sacas sob custódia
    const res = useAgroFinanceStore.getState().requestCPR({
      amount: 5000000,
      termMonths: 12,
      assetId: 'RWA-SOJA-001',
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain('insuficiente');
    expect(useAgroFinanceStore.getState().account.availableBalance).toBe(initialBalance);
  });

  it('deve liquidar (quitar) CPR, debitar saldo em conta e liberar as sacas da garantia', () => {
    // Cria um contrato para quitação
    const setupRes = useAgroFinanceStore.getState().requestCPR({
      amount: 5000,
      termMonths: 6,
      assetId: 'RWA-MILHO-001',
    });
    expect(setupRes.success).toBe(true);
    const contractId = setupRes.contract!.id;

    const stateBeforeSettle = useAgroFinanceStore.getState();
    const balanceBeforeSettle = stateBeforeSettle.account.availableBalance;
    const targetAssetBefore = stateBeforeSettle.portfolio.assets.find((a) => a.assetId === 'RWA-MILHO-001')!;
    const lockedBefore = targetAssetBefore.lockedQuantity || 0;

    // Quita o contrato
    const settleRes = useAgroFinanceStore.getState().settleCPR(contractId);
    expect(settleRes.success).toBe(true);

    const stateAfterSettle = useAgroFinanceStore.getState();
    const settledContract = stateAfterSettle.cprContracts.find((c) => c.id === contractId)!;
    expect(settledContract.status).toBe('settled');

    // Saldo debitado pelo montante da quitação
    expect(stateAfterSettle.account.availableBalance).toBeLessThan(balanceBeforeSettle);

    // Sacas desbloqueadas
    const targetAssetAfter = stateAfterSettle.portfolio.assets.find((a) => a.assetId === 'RWA-MILHO-001')!;
    expect(targetAssetAfter.lockedQuantity).toBe(lockedBefore - setupRes.contract!.collateralQuantity);

    // Transação de quitação no extrato
    expect(stateAfterSettle.transactions[0].description).toContain('Quitação');
    expect(stateAfterSettle.transactions[0].type).toBe('OUT');
  });
});
