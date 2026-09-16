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

  it('deve vender tokens RWA a mercado, debitar custódia e creditar saldo em conta', () => {
    const initialBalance = useAgroFinanceStore.getState().account.availableBalance;
    const targetAssetId = 'RWA-SOJA-001';
    const initialAsset = useAgroFinanceStore.getState().portfolio.assets.find(a => a.assetId === targetAssetId)!;
    const initialQuantity = initialAsset.quantity;

    // Vender 250 tokens (250 * 48.50 = 12.125,00)
    const result = useAgroFinanceStore.getState().executeOperation({
      type: 'sell_rwa',
      assetId: targetAssetId,
      amount: '12.125,00',
      tokens: 250,
    });

    expect(result.success).toBe(true);
    expect(result.transaction?.category).toBe('rwa_sale');
    expect(result.transaction?.type).toBe('IN');
    expect(result.transaction?.amount).toBe(12125);

    const updatedState = useAgroFinanceStore.getState();
    expect(updatedState.account.availableBalance).toBe(Number((initialBalance + 12125).toFixed(2)));

    const updatedAsset = updatedState.portfolio.assets.find(a => a.assetId === targetAssetId)!;
    expect(updatedAsset.quantity).toBe(initialQuantity - 250);
  });

  it('deve recusar venda RWA quando a quantidade solicitada exceder a custódia disponível', () => {
    const targetAssetId = 'RWA-SOJA-001';
    const initialAsset = useAgroFinanceStore.getState().portfolio.assets.find(a => a.assetId === targetAssetId)!;

    const result = useAgroFinanceStore.getState().executeOperation({
      type: 'sell_rwa',
      assetId: targetAssetId,
      amount: '999.999,00',
      tokens: initialAsset.quantity + 500,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('insuficiente');
  });

  it('deve resgatar fisicamente commodities (burn de tokens), debitar custódia sem alterar saldo financeiro', () => {
    const initialBalance = useAgroFinanceStore.getState().account.availableBalance;
    const targetAssetId = 'RWA-MILHO-001';
    const initialAsset = useAgroFinanceStore.getState().portfolio.assets.find(a => a.assetId === targetAssetId)!;
    const initialQuantity = initialAsset.quantity;

    // Resgate físico de 500 sacas em armazém credenciado
    const warehouse = 'Silo Central Cooperativa Agro SP - Sorriso';
    const result = useAgroFinanceStore.getState().executeOperation({
      type: 'redeem_rwa',
      assetId: targetAssetId,
      amount: (500 * initialAsset.pricePerToken).toString(),
      tokens: 500,
      warehouse,
    });

    expect(result.success).toBe(true);
    expect(result.transaction?.category).toBe('rwa_redemption');
    expect(result.transaction?.type).toBe('OUT');
    expect(result.transaction?.toAddress).toBe(warehouse);

    const updatedState = useAgroFinanceStore.getState();
    // Saldo em dinheiro permanece inalterado pois houve retirada física de mercadoria
    expect(updatedState.account.availableBalance).toBe(initialBalance);

    const updatedAsset = updatedState.portfolio.assets.find(a => a.assetId === targetAssetId)!;
    expect(updatedAsset.quantity).toBe(initialQuantity - 500);
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

  it('deve gerenciar estado de notificações (marcar como lida, ler todas, adicionar e limpar)', () => {
    const initialState = useAgroFinanceStore.getState();
    expect(initialState.notifications.length).toBeGreaterThan(0);

    const unreadNotif = initialState.notifications.find((n) => !n.read)!;
    expect(unreadNotif).toBeDefined();

    // Marcar como lida
    useAgroFinanceStore.getState().markNotificationAsRead(unreadNotif.id);
    const updatedNotif = useAgroFinanceStore.getState().notifications.find((n) => n.id === unreadNotif.id)!;
    expect(updatedNotif.read).toBe(true);

    // Marcar todas como lidas
    useAgroFinanceStore.getState().markAllNotificationsAsRead();
    expect(useAgroFinanceStore.getState().notifications.every((n) => n.read)).toBe(true);

    // Excluir notificação
    const countBeforeDelete = useAgroFinanceStore.getState().notifications.length;
    useAgroFinanceStore.getState().deleteNotification(unreadNotif.id);
    expect(useAgroFinanceStore.getState().notifications.length).toBe(countBeforeDelete - 1);
    expect(useAgroFinanceStore.getState().notifications.find((n) => n.id === unreadNotif.id)).toBeUndefined();

    // Adicionar notificação customizada
    useAgroFinanceStore.getState().addNotification({
      title: 'Alerta Teste',
      message: 'Mensagem de teste',
      type: 'rwa_price',
      priority: 'high',
    });
    const newest = useAgroFinanceStore.getState().notifications[0];
    expect(newest.title).toBe('Alerta Teste');
    expect(newest.read).toBe(false);

    // Limpar todas
    useAgroFinanceStore.getState().clearAllNotifications();
    expect(useAgroFinanceStore.getState().notifications.length).toBe(0);
  });

  it('deve disparar notificação automaticamente ao executar operações no store', () => {
    const countBefore = useAgroFinanceStore.getState().notifications.length;

    useAgroFinanceStore.getState().executeOperation({
      type: 'pix',
      beneficiary: '123.456.789-00',
      amount: '250,00',
    });

    const notifsAfterOp = useAgroFinanceStore.getState().notifications;
    expect(notifsAfterOp.length).toBe(countBefore + 1);
    expect(notifsAfterOp[0].title).toContain('PIX');
    expect(notifsAfterOp[0].read).toBe(false);

    // Depósito
    useAgroFinanceStore.getState().addDeposit(500);
    const notifsAfterDep = useAgroFinanceStore.getState().notifications;
    expect(notifsAfterDep.length).toBe(countBefore + 2);
    expect(notifsAfterDep[0].title).toContain('Depósito');
  });

  it('deve manter compatibilidade retroativa com useFeeAgroStore', () => {
    expect(useFeeAgroStore).toBe(useAgroFinanceStore);
  });
});
