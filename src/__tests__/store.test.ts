import { describe, it, expect, beforeEach } from 'vitest';
import { useAgroFinanceStore, useFeeAgroStore } from '../lib/store';
import { mockAccount, mockPortfolio, mockTransactions } from '../lib/mockData';

describe('useAgroFinanceStore - Gerenciamento de Estado e Reatividade', () => {
  beforeEach(() => {
    useAgroFinanceStore.getState().resetToDefaultData();
  });

  it('deve inicializar com os dados padrões de conta e portfólio', () => {
    const state = useAgroFinanceStore.getState();
    expect(state.account.accountId).toBe(mockAccount.accountId);
    expect(state.account.availableBalance).toBe(mockAccount.availableBalance);
    expect(state.portfolio.assets.length).toBe(mockPortfolio.assets.length);
    expect(state.transactions.length).toBe(mockTransactions.length);
  });

  it('deve debitar o saldo disponível ao executar uma operação PIX com sucesso', () => {
    const initialBalance = useAgroFinanceStore.getState().account.availableBalance;
    const transferAmount = 5000;

    const result = useAgroFinanceStore.getState().executeOperation({
      type: 'pix',
      beneficiary: '123.456.789-00',
      amount: '5.000,00',
      memo: 'Pagamento teste',
    });

    expect(result.success).toBe(true);
    expect(result.transaction).toBeDefined();

    const updatedState = useAgroFinanceStore.getState();
    expect(updatedState.account.availableBalance).toBe(Number((initialBalance - transferAmount).toFixed(2)));
  });

  it('deve inserir a nova transação no topo do histórico com data e status corretos', () => {
    const previousTxCount = useAgroFinanceStore.getState().transactions.length;

    const result = useAgroFinanceStore.getState().executeOperation({
      type: 'pix',
      beneficiary: '04.253.987/0001-44',
      amount: '1.250,00',
      memo: 'Adubo Safra 2026',
    });

    const updatedTransactions = useAgroFinanceStore.getState().transactions;
    expect(updatedTransactions.length).toBe(previousTxCount + 1);

    const newestTx = updatedTransactions[0];
    expect(newestTx.id).toBe(result.transaction?.id);
    expect(newestTx.amount).toBe(1250);
    expect(newestTx.type).toBe('OUT');
    expect(newestTx.status).toBe('completed');
    expect(newestTx.toAddress).toBe('04.253.987/0001-44');
    expect(newestTx.memo).toBe('Adubo Safra 2026');
  });

  it('deve atualizar tokens no portfólio RWA ao realizar um investimento', () => {
    const targetAssetId = 'RWA-SOJA-001';
    const initialAsset = useAgroFinanceStore.getState().portfolio.assets.find(a => a.assetId === targetAssetId)!;
    const initialQuantity = initialAsset.quantity;

    // Investir R$ 4.850,00 (preço por token é R$ 48,50 -> deve adicionar 100 tokens)
    const result = useAgroFinanceStore.getState().executeOperation({
      type: 'investment_rwa',
      beneficiary: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      amount: '4.850,00',
      assetId: targetAssetId,
    });

    expect(result.success).toBe(true);

    const updatedAsset = useAgroFinanceStore.getState().portfolio.assets.find(a => a.assetId === targetAssetId)!;
    expect(updatedAsset.quantity).toBe(initialQuantity + 100);
  });

  it('deve recusar operação e manter saldo intacto quando o valor exceder o saldo disponível', () => {
    const initialBalance = useAgroFinanceStore.getState().account.availableBalance;

    const result = useAgroFinanceStore.getState().executeOperation({
      type: 'pix',
      beneficiary: '123.456.789-00',
      amount: (initialBalance + 1000).toString(),
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Saldo insuficiente');
    expect(useAgroFinanceStore.getState().account.availableBalance).toBe(initialBalance);
  });

  it('deve restaurar todos os dados padrões ao chamar resetToDefaultData', () => {
    // Realiza uma operação para alterar o estado
    useAgroFinanceStore.getState().executeOperation({
      type: 'pix',
      beneficiary: '123.456.789-00',
      amount: '10.000,00',
    });

    expect(useAgroFinanceStore.getState().account.availableBalance).not.toBe(mockAccount.availableBalance);

    // Reseta
    useAgroFinanceStore.getState().resetToDefaultData();

    expect(useAgroFinanceStore.getState().account.availableBalance).toBe(mockAccount.availableBalance);
    expect(useAgroFinanceStore.getState().transactions.length).toBe(mockTransactions.length);
  });

  it('deve gerenciar estado de tema (light, dark, system)', () => {
    // Padrão do mock ou inicial
    expect(['light', 'dark', 'system']).toContain(useAgroFinanceStore.getState().theme);

    useAgroFinanceStore.getState().setTheme('dark');
    expect(useAgroFinanceStore.getState().theme).toBe('dark');

    useAgroFinanceStore.getState().setTheme('light');
    expect(useAgroFinanceStore.getState().theme).toBe('light');

    useAgroFinanceStore.getState().setTheme('system');
    expect(useAgroFinanceStore.getState().theme).toBe('system');
  });

  it('deve manter compatibilidade retroativa com useFeeAgroStore', () => {
    expect(useFeeAgroStore).toBe(useAgroFinanceStore);
  });
});
