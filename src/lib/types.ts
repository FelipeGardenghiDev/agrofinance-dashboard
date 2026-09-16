// Tipos e interfaces do projeto RWA Banking - fee agro

// ==================== CONTA ====================
export interface Account {
  accountId: string;
  ownerName: string;
  currency: 'BRL';
  availableBalance: number;
  createdAt: string;
}

// ==================== RWA PORTFOLIO ====================
export type AssetType = 'SOJA' | 'MILHO';

export interface RWAAsset {
  assetId: string;
  assetName: string;
  assetType: AssetType;
  tokenSymbol: string;
  quantity: number; // quantidade total de tokens
  lockedQuantity?: number; // quantidade bloqueada em garantia (CPR)
  pricePerToken: number; // preço em BRL por token
  totalValue: number; // quantity * pricePerToken
  lastUpdate: string;
  performance24h: number; // percentual de variação nas últimas 24h
}

export interface Portfolio {
  assets: RWAAsset[];
  totalValue: number;
}

// ==================== KYC ====================
export type KYCStatus = 'pending' | 'approved' | 'rejected' | 'under_review';

export interface KYC {
  status: KYCStatus;
  submittedAt: string;
  reviewedAt?: string;
  documents: {
    cpf: boolean;
    proofOfAddress: boolean;
    selfie: boolean;
  };
}

// ==================== TRANSAÇÕES ====================
export type TransactionType = 'IN' | 'OUT';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type TransactionCategory = 
  | 'pix' 
  | 'ted' 
  | 'investment' 
  | 'withdrawal' 
  | 'dividend' 
  | 'fee'
  | 'rwa_sale'
  | 'rwa_redemption';

export interface Transaction {
  id: string;
  date: string; // ISO string
  description: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  status: TransactionStatus;
  fromAddress?: string;
  toAddress?: string;
  txHash?: string; // hash simulado para transações blockchain
  fee?: number;
  memo?: string;
}

// ==================== ARMAZÉNS CREDENCIADOS (RESGATE FÍSICO) ====================
export interface Warehouse {
  id: string;
  name: string;
  city: string;
  state: string;
  capacity: string;
}

// ==================== OPERAÇÕES (NOVA TRANSAÇÃO) ====================
export type OperationType = 'pix' | 'ted' | 'investment_rwa' | 'sell_rwa' | 'redeem_rwa';

export interface Operation {
  type: OperationType;
  beneficiary: string; // CPF, chave PIX, armazém ou wallet address
  amount: number;
  memo?: string;
  assetId?: string; // para operações com tokens RWA
  tokens?: number; // quantidade de tokens envolvidos
  warehouse?: string; // armazém credenciado no resgate físico
  network?: string; // para operações blockchain
}

export interface OperationFormData {
  type: OperationType;
  beneficiary: string;
  amount: string; // string no form, number depois
  memo?: string;
  assetId?: string;
  tokens?: number;
  warehouse?: string;
}

// ==================== FILTROS ====================
export interface TransactionFilters {
  type?: TransactionType | 'ALL';
  status?: TransactionStatus | 'ALL';
  category?: TransactionCategory | 'ALL';
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}

export type SortField = 'date' | 'amount';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// ==================== NOTIFICAÇÕES & ALERTAS ====================
export type NotificationType = 'system' | 'rwa_price' | 'redemption' | 'kyc' | 'operation';
export type NotificationPriority = 'low' | 'medium' | 'high';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string; // ISO string
  type: NotificationType;
  priority?: NotificationPriority;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

// ==================== TOAST & FEEDBACK UX ====================
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms
}

// ==================== CRÉDITO RURAL & CPR DIGITAL ====================
export interface CPRContract {
  id: string;
  contractNumber: string; // ex: CPR-2026-0042
  borrowerName: string;
  amount: number; // Valor financiado concedido (R$)
  collateralAssetId: string;
  collateralQuantity: number; // Quantidade de sacas/tokens retidos em garantia
  collateralValue: number; // Valor de mercado da garantia no momento da contratação
  ltv: number; // Percentual Loan-to-Value (ex: 60%)
  interestRateAnnual: number; // Taxa de juros anual (ex: 11.5%)
  termMonths: number; // 6, 12 ou 24 meses
  monthlyPayment: number; // Valor estimado da parcela
  totalRepayment: number; // Montante total a pagar com juros
  status: 'active' | 'settled' | 'defaulted';
  createdAt: string; // ISO
  dueDate: string; // ISO
  cprHash: string; // Hash de registro em cartório / B3
}

export interface CreditSimulation {
  requestedAmount: number;
  termMonths: number;
  assetId: string;
  ltv: number;
  monthlyPayment: number;
  totalInterest: number;
  totalRepayment: number;
  requiredTokens: number;
  interestRateAnnual: number;
}

// ==================== DADOS DA APLICAÇÃO ====================
export interface AppData {
  account: Account;
  portfolio: Portfolio;
  kyc: KYC;
  transactions: Transaction[];
  notifications: AppNotification[];
  cprContracts: CPRContract[];
}

// ==================== TEMA ====================
export type ThemeMode = 'light' | 'dark' | 'system';