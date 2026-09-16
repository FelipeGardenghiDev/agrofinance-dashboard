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
  quantity: number; // quantidade de tokens
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

// ==================== DADOS DA APLICAÇÃO ====================
export interface AppData {
  account: Account;
  portfolio: Portfolio;
  kyc: KYC;
  transactions: Transaction[];
}

// ==================== TEMA ====================
export type ThemeMode = 'light' | 'dark' | 'system';