import type { 
  Account, 
  Portfolio, 
  RWAAsset, 
  KYC, 
  Transaction, 
  AppData,
  Warehouse,
  AppNotification,
  CPRContract,
  HedgeContract,
  MarketQuote
} from './types';

// ==================== CONTA ====================
export const mockAccount: Account = {
  accountId: 'ACC-2024-BR-001',
  ownerName: 'João Silva Santos',
  currency: 'BRL',
  availableBalance: 125480.75,
  createdAt: '2026-01-15T10:30:00Z',
};

// ==================== PORTFOLIO RWA ====================
export const mockRWAAssets: RWAAsset[] = [
  {
    assetId: 'RWA-SOJA-001',
    assetName: 'Soja Premium - Safra 2025/26',
    assetType: 'SOJA',
    tokenSymbol: 'SOJA24',
    quantity: 1250, // tokens
    lockedQuantity: 0,
    pricePerToken: 48.50, // R$ por token
    totalValue: 60625.00, // 1250 * 48.50
    lastUpdate: new Date().toISOString(),
    performance24h: 2.3, // +2.3%
  },
  {
    assetId: 'RWA-SOJA-002',
    assetName: 'Soja Orgânica - Exportação',
    assetType: 'SOJA',
    tokenSymbol: 'SOJAO',
    quantity: 800,
    lockedQuantity: 300,
    pricePerToken: 52.75,
    totalValue: 42200.00,
    lastUpdate: new Date().toISOString(),
    performance24h: 1.8,
  },
  {
    assetId: 'RWA-MILHO-001',
    assetName: 'Milho Híbrido - Safra 2025',
    assetType: 'MILHO',
    tokenSymbol: 'MLHO25',
    quantity: 2000,
    pricePerToken: 28.30,
    totalValue: 56600.00,
    lastUpdate: new Date().toISOString(),
    performance24h: -0.5,
  },
  {
    assetId: 'RWA-MILHO-002',
    assetName: 'Milho Premium - Grão Especial',
    assetType: 'MILHO',
    tokenSymbol: 'MLHOP',
    quantity: 1500,
    pricePerToken: 31.20,
    totalValue: 46800.00,
    lastUpdate: new Date().toISOString(),
    performance24h: 0.8,
  },
];

export const mockPortfolio: Portfolio = {
  assets: mockRWAAssets,
  totalValue: mockRWAAssets.reduce((sum, asset) => sum + asset.totalValue, 0),
};

// ==================== KYC ====================
export const mockKYC: KYC = {
  status: 'approved',
  submittedAt: '2026-01-20T14:22:00Z',
  reviewedAt: '2026-01-21T09:15:00Z',
  documents: {
    cpf: true,
    proofOfAddress: true,
    selfie: true,
  },
};

// ==================== TRANSAÇÕES ====================
export const mockTransactions: Transaction[] = [
  {
    id: 'TRX-001',
    date: '2026-02-08T09:15:30Z',
    description: 'Investimento em Soja Premium',
    type: 'OUT',
    category: 'investment',
    amount: 24250.00,
    status: 'completed',
    toAddress: 'RWA-SOJA-001',
    txHash: '0x7f3d...a9c2',
    fee: 12.50,
    memo: 'Aporte inicial - Safra 2025/26',
  },
  {
    id: 'TRX-002',
    date: '2026-02-07T14:22:15Z',
    description: 'PIX recebido - Cliente Agro',
    type: 'IN',
    category: 'pix',
    amount: 15000.00,
    status: 'completed',
    fromAddress: '***123.456.789-**',
    memo: 'Pagamento serviços consultoria',
  },
  {
    id: 'TRX-003',
    date: '2026-02-06T11:05:42Z',
    description: 'Dividendos - Milho Híbrido',
    type: 'IN',
    category: 'dividend',
    amount: 842.50,
    status: 'completed',
    fromAddress: 'RWA-MILHO-001',
    txHash: '0x9e2f...b1d4',
    memo: 'Rendimento mensal',
  },
  {
    id: 'TRX-004',
    date: '2026-02-05T16:30:00Z',
    description: 'TED enviada - Fornecedor',
    type: 'OUT',
    category: 'ted',
    amount: 8500.00,
    status: 'completed',
    toAddress: 'Banco do Brasil - Ag 1234',
    fee: 18.90,
    memo: 'Pagamento insumos agrícolas',
  },
  {
    id: 'TRX-005',
    date: '2026-02-04T10:12:33Z',
    description: 'Resgate parcial - Soja Orgânica',
    type: 'IN',
    category: 'withdrawal',
    amount: 5280.00,
    status: 'completed',
    fromAddress: 'RWA-SOJA-002',
    txHash: '0x4c1a...e7f3',
    fee: 8.50,
  },
  {
    id: 'TRX-006',
    date: '2026-02-03T13:45:20Z',
    description: 'PIX enviado',
    type: 'OUT',
    category: 'pix',
    amount: 2350.00,
    status: 'completed',
    toAddress: '***987.654.321-**',
    memo: 'Pagamento serviços',
  },
  {
    id: 'TRX-007',
    date: '2026-02-02T08:30:15Z',
    description: 'Taxa de manutenção mensal',
    type: 'OUT',
    category: 'fee',
    amount: 29.90,
    status: 'completed',
    memo: 'Mensalidade plano premium',
  },
  {
    id: 'TRX-008',
    date: '2026-02-01T15:20:00Z',
    description: 'Investimento em Milho Premium',
    type: 'OUT',
    category: 'investment',
    amount: 18720.00,
    status: 'completed',
    toAddress: 'RWA-MILHO-002',
    txHash: '0x8b5d...c4e9',
    fee: 15.00,
    memo: 'Diversificação portfolio',
  },
  {
    id: 'TRX-009',
    date: '2026-01-31T11:10:45Z',
    description: 'PIX recebido',
    type: 'IN',
    category: 'pix',
    amount: 7500.00,
    status: 'completed',
    fromAddress: '***555.444.333-**',
    memo: 'Venda equipamento agrícola',
  },
  {
    id: 'TRX-010',
    date: '2026-01-30T09:00:00Z',
    description: 'Investimento em Soja Orgânica',
    type: 'OUT',
    category: 'investment',
    amount: 21100.00,
    status: 'completed',
    toAddress: 'RWA-SOJA-002',
    txHash: '0x3f8c...d2a1',
    fee: 10.50,
    memo: 'Aporte em soja premium',
  },
  {
    id: 'TRX-011',
    date: '2026-01-29T16:45:30Z',
    description: 'Transferência agendada',
    type: 'OUT',
    category: 'pix',
    amount: 3200.00,
    status: 'pending',
    toAddress: '***111.222.333-**',
    memo: 'Pagamento agendado para 10/02',
  },
  {
    id: 'TRX-012',
    date: '2026-01-28T14:15:00Z',
    description: 'TED recebida',
    type: 'IN',
    category: 'ted',
    amount: 12000.00,
    status: 'completed',
    fromAddress: 'Caixa Econômica - Ag 5678',
    memo: 'Crédito rural aprovado',
  },
];

// ==================== NOTIFICAÇÕES & ALERTAS ====================
export const mockNotifications: AppNotification[] = [
  {
    id: 'NOTIF-001',
    title: 'Cotação em Alta: Soja Premium',
    message: 'O token SOJA24 valorizou +2.3% nas últimas 24h, cotado a R$ 48,50/saca na B3/CBOT.',
    timestamp: '2026-02-08T11:45:00Z',
    type: 'rwa_price',
    priority: 'high',
    read: false,
    actionUrl: '/dashboard',
    actionLabel: 'Ver Gráfico',
  },
  {
    id: 'NOTIF-002',
    title: 'Liberação de Armazém (CDA/WA)',
    message: 'Lote de 500 sacas de Milho Híbrido autorizado para expedição no Silo Central de Sorriso/MT.',
    timestamp: '2026-02-08T08:30:00Z',
    type: 'redemption',
    priority: 'medium',
    read: false,
    actionUrl: '/transactions',
    actionLabel: 'Ver Comprovante',
  },
  {
    id: 'NOTIF-003',
    title: 'Cadastro de Produtor Rural Aprovado',
    message: 'Seu status KYC e documentação regulatória junto ao Banco Central do Brasil estão 100% regulares.',
    timestamp: '2026-02-07T16:20:00Z',
    type: 'kyc',
    priority: 'low',
    read: true,
    actionUrl: '/dashboard',
    actionLabel: 'Ver Status',
  },
  {
    id: 'NOTIF-004',
    title: 'Dividendos de Milho Creditados',
    message: 'Rendimento de R$ 842,50 depositado automaticamente referente à custódia de MLHO25.',
    timestamp: '2026-02-06T11:05:42Z',
    type: 'operation',
    priority: 'medium',
    read: true,
    actionUrl: '/transactions',
    actionLabel: 'Extrato',
  },
];

// ==================== CRÉDITO RURAL & CONTRATOS CPR ====================
export const mockCPRContracts: CPRContract[] = [
  {
    id: 'CPR-2026-001',
    contractNumber: 'CPR-2026-001',
    borrowerName: 'João Silva Santos',
    amount: 10000.00,
    collateralAssetId: 'RWA-SOJA-002',
    collateralQuantity: 300,
    collateralValue: 15825.00, // 300 * 52.75
    ltv: 63.2,
    interestRateAnnual: 11.5,
    termMonths: 12,
    monthlyPayment: 886.15,
    totalRepayment: 10633.80,
    status: 'active',
    createdAt: '2026-01-25T10:00:00Z',
    dueDate: '2027-01-25T10:00:00Z',
    cprHash: '0x9c3f...7b1a',
  },
];

// ==================== CONTRATOS DE HEDGE & DERIVATIVOS B3 ====================
export const mockHedgeContracts: HedgeContract[] = [
  {
    id: 'HDG-001',
    contractNumber: 'HDG-2026-B3-SOJA-8921',
    type: 'commodity_put',
    commodityName: 'Soja Premium B3',
    commoditySymbol: 'SOJA24',
    targetMaturity: 'Março/2027',
    quantitySacas: 1200,
    strikePrice: 52.00,
    currentSpotPrice: 48.50,
    totalProtectedValue: 62400.00,
    premiumCost: 1996.80,
    status: 'active',
    createdAt: '2026-02-01T14:30:00Z',
    expiryDate: '2027-03-31T18:00:00Z',
    b3RegistryHash: '0xb37a...99e1',
  },
  {
    id: 'HDG-002',
    contractNumber: 'HDG-2026-B3-MLHO-4112',
    type: 'commodity_put',
    commodityName: 'Milho Híbrido B3',
    commoditySymbol: 'MLHO25',
    targetMaturity: 'Julho/2026',
    quantitySacas: 2500,
    strikePrice: 26.50,
    currentSpotPrice: 28.30,
    totalProtectedValue: 66250.00,
    premiumCost: 1457.50,
    status: 'active',
    createdAt: '2026-02-10T11:00:00Z',
    expiryDate: '2026-07-31T18:00:00Z',
    b3RegistryHash: '0xb39c...33f2',
  },
  {
    id: 'HDG-003',
    contractNumber: 'HDG-2026-B3-NDF-6340',
    type: 'ndf_usd',
    commodityName: 'NDF Cambial Dólar PTAX',
    commoditySymbol: 'USD/BRL',
    targetMaturity: 'Novembro/2026',
    quantitySacas: 800,
    strikePrice: 5.65,
    currentSpotPrice: 5.42,
    totalProtectedValue: 45200.00,
    premiumCost: 1446.40,
    status: 'active',
    createdAt: '2026-01-28T16:15:00Z',
    expiryDate: '2026-11-30T18:00:00Z',
    b3RegistryHash: '0xb3fa...71b8',
  },
];

// ==================== COTAÇÕES DE MERCADO AO VIVO (B3 / CBOT) ====================
export const initialMarketQuotes: MarketQuote[] = [
  {
    symbol: 'SOJA-PR',
    name: 'Soja Paranaguá',
    price: 134.80,
    change24h: 1.45,
    lastDirection: 'up',
    unit: 'sc 60kg',
    updatedAt: new Date().toISOString(),
  },
  {
    symbol: 'SOJA-CBOT',
    name: 'Soja Chicago (CBOT)',
    price: 1042.50,
    change24h: 0.85,
    lastDirection: 'up',
    unit: '¢/bu',
    updatedAt: new Date().toISOString(),
  },
  {
    symbol: 'MILHO-B3',
    name: 'Milho Campinas B3',
    price: 64.20,
    change24h: -0.62,
    lastDirection: 'down',
    unit: 'sc 60kg',
    updatedAt: new Date().toISOString(),
  },
  {
    symbol: 'USD/BRL',
    name: 'Dólar PTAX',
    price: 5.4210,
    change24h: -0.35,
    lastDirection: 'down',
    unit: 'R$',
    updatedAt: new Date().toISOString(),
  },
  {
    symbol: 'BOI-B3',
    name: 'Boi Gordo B3 (BGI)',
    price: 248.50,
    change24h: 0.40,
    lastDirection: 'up',
    unit: '@ à vista',
    updatedAt: new Date().toISOString(),
  },
  {
    symbol: 'SOJA24-RWA',
    name: 'Soja Premium RWA',
    price: 48.50,
    change24h: 2.30,
    lastDirection: 'up',
    unit: 'token',
    updatedAt: new Date().toISOString(),
  },
];

// ==================== DADOS CONSOLIDADOS ====================
export const mockAppData: AppData = {
  account: mockAccount,
  portfolio: mockPortfolio,
  kyc: mockKYC,
  transactions: mockTransactions,
  notifications: mockNotifications,
  cprContracts: mockCPRContracts,
  hedgeContracts: mockHedgeContracts,
  marketQuotes: initialMarketQuotes,
};

// ==================== HELPERS ====================

/**
 * Simula delay de API call
 */
export const simulateApiDelay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Busca transações com filtros
 */
export const getFilteredTransactions = (
  filters: {
    type?: string;
    status?: string;
    searchTerm?: string;
  }
): Transaction[] => {
  let filtered = [...mockTransactions];

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
};

/**
 * Busca ativo por ID
 */
export const getAssetById = (assetId: string): RWAAsset | undefined => {
  return mockRWAAssets.find(asset => asset.assetId === assetId);
};

// ==================== ARMAZÉNS CREDENCIADOS PARA RESGATE FÍSICO ====================
export const mockWarehouses: Warehouse[] = [
  {
    id: 'wh-sorriso',
    name: 'Silo Central Cooperativa Agro SP - Sorriso',
    city: 'Sorriso',
    state: 'MT',
    capacity: '120.000 ton',
  },
  {
    id: 'wh-bebedouro',
    name: 'Terminal Graneleiro Bebedouro Agro RWA',
    city: 'Bebedouro',
    state: 'SP',
    capacity: '85.000 ton',
  },
  {
    id: 'wh-rioverde',
    name: 'Armazém Geral RWA Cerrado Verde',
    city: 'Rio Verde',
    state: 'GO',
    capacity: '95.000 ton',
  },
  {
    id: 'wh-santos',
    name: 'Terminal Portuário Graneleiro Exportação',
    city: 'Santos',
    state: 'SP',
    capacity: '150.000 ton',
  },
];