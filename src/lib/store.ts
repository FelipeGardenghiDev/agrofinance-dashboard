import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Account, Portfolio, KYC, Transaction, RWAAsset, ThemeMode, AppNotification } from './types';
import type { OperationFormValues } from './validations';
import { mockAccount, mockPortfolio, mockKYC, mockTransactions, mockRWAAssets, mockNotifications } from './mockData';
import { parseAmount } from './utils';

export const applyThemeToDocument = (theme: ThemeMode) => {
  if (typeof window === 'undefined') return;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export interface AgroFinanceStore {
  account: Account;
  portfolio: Portfolio;
  kyc: KYC;
  transactions: Transaction[];
  notifications: AppNotification[];
  theme: ThemeMode;
  isHydrated: boolean;
  setIsHydrated: (val: boolean) => void;
  
  // Ações de Negócio
  setTheme: (theme: ThemeMode) => void;
  executeOperation: (data: OperationFormValues) => { success: boolean; error?: string; transaction?: Transaction };
  resetToDefaultData: () => void;
  addDeposit: (amount: number, description?: string) => void;
  getFilteredTransactions: (filters: { type?: string; status?: string; searchTerm?: string }) => Transaction[];

  // Ações de Notificações
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'> & { id?: string; timestamp?: string; read?: boolean }) => void;
}

export type FeeAgroStore = AgroFinanceStore;

export const useAgroFinanceStore = create<AgroFinanceStore>()(
  persist(
    (set, get) => ({
      account: mockAccount,
      portfolio: mockPortfolio,
      kyc: mockKYC,
      transactions: mockTransactions,
      notifications: mockNotifications,
      theme: 'system' as ThemeMode,
      isHydrated: false,

      setIsHydrated: (val: boolean) => set({ isHydrated: val }),

      setTheme: (theme: ThemeMode) => {
        set({ theme });
        applyThemeToDocument(theme);
      },

      executeOperation: (data: OperationFormValues) => {
        const state = get();
        const amount = parseAmount(data.amount);

        if (amount <= 0) {
          return { success: false, error: 'O valor deve ser maior que zero.' };
        }

        // ==================== OPERAÇÃO DE VENDA RWA ====================
        if (data.type === 'sell_rwa') {
          if (!data.assetId) {
            return { success: false, error: 'Selecione o ativo RWA para venda.' };
          }

          const targetAsset = state.portfolio.assets.find((a) => a.assetId === data.assetId);
          if (!targetAsset) {
            return { success: false, error: 'Ativo RWA não encontrado no portfólio.' };
          }

          const tokensToSell =
            data.tokens && data.tokens > 0
              ? data.tokens
              : Math.min(targetAsset.quantity, Math.round(amount / targetAsset.pricePerToken));

          if (tokensToSell <= 0 || tokensToSell > targetAsset.quantity) {
            return {
              success: false,
              error: `Quantidade de tokens insuficiente (custódia atual: ${targetAsset.quantity} tokens).`,
            };
          }

          const saleValue = Number((tokensToSell * targetAsset.pricePerToken).toFixed(2));
          const newAvailableBalance = Number((state.account.availableBalance + saleValue).toFixed(2));

          const updatedAssets: RWAAsset[] = state.portfolio.assets.map((asset) => {
            if (asset.assetId === data.assetId) {
              const newQuantity = asset.quantity - tokensToSell;
              const newTotalValue = Number((newQuantity * asset.pricePerToken).toFixed(2));
              return {
                ...asset,
                quantity: newQuantity,
                totalValue: newTotalValue,
                lastUpdate: new Date().toISOString(),
              };
            }
            return asset;
          });

          const totalPortfolioValue = updatedAssets.reduce((sum, a) => sum + a.totalValue, 0);
          const updatedPortfolio = {
            assets: updatedAssets,
            totalValue: Number(totalPortfolioValue.toFixed(2)),
          };

          const newTransaction: Transaction = {
            id: `TRX-${Date.now().toString().slice(-5)}`,
            date: new Date().toISOString(),
            description: `Venda de Tokens RWA - ${targetAsset.assetName}`,
            type: 'IN',
            category: 'rwa_sale',
            amount: saleValue,
            status: 'completed',
            fromAddress: `Custódia RWA (${targetAsset.tokenSymbol})`,
            toAddress: `${state.account.ownerName} (Saldo em Conta)`,
            memo:
              data.memo?.trim() ||
              `Venda liquidada: ${tokensToSell.toLocaleString('pt-BR')} tokens a ${targetAsset.pricePerToken.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/token`,
            txHash: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
          };

          const saleNotif: AppNotification = {
            id: `NOTIF-${Date.now().toString().slice(-6)}`,
            title: 'Liquidação RWA Concluída',
            message: `Venda de ${tokensToSell.toLocaleString('pt-BR')} tokens de ${targetAsset.assetName} liquidada com crédito de ${saleValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} em conta.`,
            timestamp: new Date().toISOString(),
            type: 'operation',
            priority: 'medium',
            read: false,
            actionUrl: '/transactions',
            actionLabel: 'Ver Comprovante',
          };

          set({
            account: {
              ...state.account,
              availableBalance: newAvailableBalance,
            },
            portfolio: updatedPortfolio,
            transactions: [newTransaction, ...state.transactions],
            notifications: [saleNotif, ...state.notifications],
          });

          return { success: true, transaction: newTransaction };
        }

        // ==================== OPERAÇÃO DE RESGATE FÍSICO RWA ====================
        if (data.type === 'redeem_rwa') {
          if (!data.assetId) {
            return { success: false, error: 'Selecione o ativo RWA para resgate físico.' };
          }

          const targetAsset = state.portfolio.assets.find((a) => a.assetId === data.assetId);
          if (!targetAsset) {
            return { success: false, error: 'Ativo RWA não encontrado no portfólio.' };
          }

          const tokensToRedeem =
            data.tokens && data.tokens > 0
              ? data.tokens
              : Math.min(targetAsset.quantity, Math.round(amount / targetAsset.pricePerToken));

          if (tokensToRedeem <= 0 || tokensToRedeem > targetAsset.quantity) {
            return {
              success: false,
              error: `Quantidade de sacas/tokens para resgate inválida ou insuficiente (disponível: ${targetAsset.quantity} tokens).`,
            };
          }

          const redemptionValue = Number((tokensToRedeem * targetAsset.pricePerToken).toFixed(2));

          const updatedAssets: RWAAsset[] = state.portfolio.assets.map((asset) => {
            if (asset.assetId === data.assetId) {
              const newQuantity = asset.quantity - tokensToRedeem;
              const newTotalValue = Number((newQuantity * asset.pricePerToken).toFixed(2));
              return {
                ...asset,
                quantity: newQuantity,
                totalValue: newTotalValue,
                lastUpdate: new Date().toISOString(),
              };
            }
            return asset;
          });

          const totalPortfolioValue = updatedAssets.reduce((sum, a) => sum + a.totalValue, 0);
          const updatedPortfolio = {
            assets: updatedAssets,
            totalValue: Number(totalPortfolioValue.toFixed(2)),
          };

          const warehouseName = data.warehouse || 'Armazém Geral Credenciado';

          const newTransaction: Transaction = {
            id: `TRX-${Date.now().toString().slice(-5)}`,
            date: new Date().toISOString(),
            description: `Resgate Físico de Grãos - ${targetAsset.assetName}`,
            type: 'OUT',
            category: 'rwa_redemption',
            amount: redemptionValue,
            status: 'completed',
            fromAddress: `Burn Smart Contract (${targetAsset.tokenSymbol})`,
            toAddress: warehouseName,
            memo:
              data.memo?.trim() ||
              `Certificado CDA/WA: ${tokensToRedeem.toLocaleString('pt-BR')} sacas liberadas para carregamento em ${warehouseName}`,
            txHash: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
          };

          const redeemNotif: AppNotification = {
            id: `NOTIF-${Date.now().toString().slice(-6)}`,
            title: 'Certificado CDA/WA Emitido',
            message: `Resgate físico de ${tokensToRedeem.toLocaleString('pt-BR')} sacas liberado para retirada no armazém ${warehouseName}.`,
            timestamp: new Date().toISOString(),
            type: 'redemption',
            priority: 'high',
            read: false,
            actionUrl: '/transactions',
            actionLabel: 'Ver Comprovante',
          };

          set({
            portfolio: updatedPortfolio,
            transactions: [newTransaction, ...state.transactions],
            notifications: [redeemNotif, ...state.notifications],
          });

          return { success: true, transaction: newTransaction };
        }

        // ==================== OPERAÇÕES FINANCEIRAS DE DÉBITO (PIX, TED, APORTE) ====================
        if (amount > state.account.availableBalance) {
          return { success: false, error: 'Saldo insuficiente para realizar esta operação.' };
        }

        // Calcula novo saldo disponível
        const newAvailableBalance = Number((state.account.availableBalance - amount).toFixed(2));

        // Se for investimento RWA, atualiza os tokens no portfólio
        let updatedPortfolio = { ...state.portfolio };
        let assetName = '';

        if (data.type === 'investment_rwa' && data.assetId) {
          const targetAsset = state.portfolio.assets.find((a) => a.assetId === data.assetId);
          if (targetAsset) {
            assetName = targetAsset.assetName;
            const tokensBought = Math.round(amount / targetAsset.pricePerToken);
            const updatedAssets: RWAAsset[] = state.portfolio.assets.map((asset) => {
              if (asset.assetId === data.assetId) {
                const newQuantity = asset.quantity + tokensBought;
                const newTotalValue = Number((newQuantity * asset.pricePerToken).toFixed(2));
                return {
                  ...asset,
                  quantity: newQuantity,
                  totalValue: newTotalValue,
                  lastUpdate: new Date().toISOString(),
                };
              }
              return asset;
            });

            const totalPortfolioValue = updatedAssets.reduce((sum, a) => sum + a.totalValue, 0);
            updatedPortfolio = {
              assets: updatedAssets,
              totalValue: Number(totalPortfolioValue.toFixed(2)),
            };
          }
        }

        // Cria o registro da nova transação
        const newTransaction: Transaction = {
          id: `TRX-${Date.now().toString().slice(-5)}`,
          date: new Date().toISOString(),
          description:
            data.type === 'pix'
              ? `PIX enviado - ${data.beneficiary}`
              : data.type === 'ted'
              ? `TED enviada - ${data.beneficiary}`
              : `Aporte RWA - ${assetName || data.assetId || 'Ativo Agro'}`,
          type: 'OUT',
          category: data.type === 'investment_rwa' ? 'investment' : data.type,
          amount: amount,
          status: 'completed',
          toAddress: data.beneficiary,
          memo: data.memo?.trim() || undefined,
          fee: data.type === 'ted' ? 18.9 : 0,
          txHash: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
        };

        // Notificação da operação
        const opNotif: AppNotification = {
          id: `NOTIF-${Date.now().toString().slice(-6)}`,
          title:
            data.type === 'investment_rwa'
              ? 'Aporte RWA Confirmado'
              : `${data.type.toUpperCase()} Enviado`,
          message:
            data.type === 'investment_rwa'
              ? `Compra de tokens de ${assetName || 'Ativo Agro'} concluída no valor de ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`
              : `Transferência de ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} enviada para ${data.beneficiary}.`,
          timestamp: new Date().toISOString(),
          type: 'operation',
          priority: data.type === 'investment_rwa' ? 'medium' : 'low',
          read: false,
          actionUrl: data.type === 'investment_rwa' ? '/dashboard' : '/transactions',
          actionLabel: data.type === 'investment_rwa' ? 'Ver Portfólio' : 'Ver Extrato',
        };

        // Aplica as mudanças no estado
        set({
          account: {
            ...state.account,
            availableBalance: newAvailableBalance,
          },
          portfolio: updatedPortfolio,
          transactions: [newTransaction, ...state.transactions],
          notifications: [opNotif, ...state.notifications],
        });

        return { success: true, transaction: newTransaction };
      },

      addDeposit: (amount: number, description = 'Depósito PIX Recebido') => {
        const state = get();
        if (amount <= 0) return;

        const newAvailableBalance = Number((state.account.availableBalance + amount).toFixed(2));
        const newTransaction: Transaction = {
          id: `TRX-${Date.now().toString().slice(-5)}`,
          date: new Date().toISOString(),
          description,
          type: 'IN',
          category: 'pix',
          amount,
          status: 'completed',
          fromAddress: '***.***.***-**',
          memo: 'Depósito simulado via PIX',
        };

        const depositNotif: AppNotification = {
          id: `NOTIF-${Date.now().toString().slice(-6)}`,
          title: 'Depósito PIX Recebido',
          message: `Depósito de ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} creditado em seu saldo disponível.`,
          timestamp: new Date().toISOString(),
          type: 'operation',
          priority: 'medium',
          read: false,
          actionUrl: '/transactions',
          actionLabel: 'Ver Extrato',
        };

        set({
          account: {
            ...state.account,
            availableBalance: newAvailableBalance,
          },
          transactions: [newTransaction, ...state.transactions],
          notifications: [depositNotif, ...state.notifications],
        });
      },

      resetToDefaultData: () => {
        set({
          account: { ...mockAccount },
          portfolio: {
            assets: [...mockRWAAssets],
            totalValue: mockPortfolio.totalValue,
          },
          kyc: { ...mockKYC },
          transactions: [...mockTransactions],
          notifications: [...mockNotifications],
        });
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('agrofinance-storage-v1');
            localStorage.removeItem('feeagro-storage-v1');
          } catch {}
        }
      },

      markNotificationAsRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllNotificationsAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      deleteNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearAllNotifications: () => {
        set({ notifications: [] });
      },

      addNotification: (notif) => {
        const newNotif: AppNotification = {
          id: notif.id || `NOTIF-${Date.now().toString().slice(-6)}`,
          title: notif.title,
          message: notif.message,
          timestamp: notif.timestamp || new Date().toISOString(),
          type: notif.type,
          priority: notif.priority || 'medium',
          read: notif.read ?? false,
          actionUrl: notif.actionUrl,
          actionLabel: notif.actionLabel,
        };
        set((state) => ({
          notifications: [newNotif, ...state.notifications],
        }));
      },

      getFilteredTransactions: (filters: { type?: string; status?: string; searchTerm?: string }) => {
        const { transactions } = get();
        let filtered = [...transactions];

        if (filters.type && filters.type !== 'ALL') {
          filtered = filtered.filter(t => t.type === filters.type);
        }

        if (filters.status && filters.status !== 'ALL') {
          filtered = filtered.filter(t => t.status === filters.status);
        }

        if (filters.searchTerm) {
          const term = filters.searchTerm.toLowerCase();
          filtered = filtered.filter(
            t =>
              t.description.toLowerCase().includes(term) ||
              t.memo?.toLowerCase().includes(term)
          );
        }

        return filtered;
      },
    }),
    {
      name: 'agrofinance-storage-v1',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setIsHydrated(true);
        if (state?.theme) {
          applyThemeToDocument(state.theme);
        }
      },
    }
  )
);

// Alias de retrocompatibilidade
export const useFeeAgroStore = useAgroFinanceStore;

