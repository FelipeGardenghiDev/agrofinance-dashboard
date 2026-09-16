import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Account, Portfolio, KYC, Transaction, RWAAsset, ThemeMode } from './types';
import type { OperationFormValues } from './validations';
import { mockAccount, mockPortfolio, mockKYC, mockTransactions, mockRWAAssets } from './mockData';
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
  theme: ThemeMode;
  isHydrated: boolean;
  setIsHydrated: (val: boolean) => void;
  
  // Ações de Negócio
  setTheme: (theme: ThemeMode) => void;
  executeOperation: (data: OperationFormValues) => { success: boolean; error?: string; transaction?: Transaction };
  resetToDefaultData: () => void;
  addDeposit: (amount: number, description?: string) => void;
  getFilteredTransactions: (filters: { type?: string; status?: string; searchTerm?: string }) => Transaction[];
}

export type FeeAgroStore = AgroFinanceStore;

export const useAgroFinanceStore = create<AgroFinanceStore>()(
  persist(
    (set, get) => ({
      account: mockAccount,
      portfolio: mockPortfolio,
      kyc: mockKYC,
      transactions: mockTransactions,
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

        if (amount > state.account.availableBalance) {
          return { success: false, error: 'Saldo insuficiente para realizar esta operação.' };
        }

        // Calcula novo saldo disponível
        const newAvailableBalance = Number((state.account.availableBalance - amount).toFixed(2));

        // Se for investimento RWA, atualiza os tokens no portfólio
        let updatedPortfolio = { ...state.portfolio };
        let assetName = '';

        if (data.type === 'investment_rwa' && data.assetId) {
          const targetAsset = state.portfolio.assets.find(a => a.assetId === data.assetId);
          if (targetAsset) {
            assetName = targetAsset.assetName;
            const tokensBought = Math.round(amount / targetAsset.pricePerToken);
            const updatedAssets: RWAAsset[] = state.portfolio.assets.map(asset => {
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
          fee: data.type === 'ted' ? 18.90 : 0,
          txHash: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
        };

        // Aplica as mudanças no estado
        set({
          account: {
            ...state.account,
            availableBalance: newAvailableBalance,
          },
          portfolio: updatedPortfolio,
          transactions: [newTransaction, ...state.transactions],
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

        set({
          account: {
            ...state.account,
            availableBalance: newAvailableBalance,
          },
          transactions: [newTransaction, ...state.transactions],
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
        });
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('agrofinance-storage-v1');
            localStorage.removeItem('feeagro-storage-v1');
          } catch {}
        }
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

