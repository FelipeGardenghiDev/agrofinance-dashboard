import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Transaction, RWAAsset, HedgeContract, HedgeSimulationResult, HedgeType } from './types';

// Utility para merge de classes Tailwind

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ==================== FORMATAÇÃO DE MOEDA ====================

// Formata valor em BRL
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Formata valor sem símbolo de moeda
export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

// ==================== FORMATAÇÃO DE DATA ====================

// Formata data pro padrão brasileiro
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

// Formata data com hora
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

// Retorna data relativa (por ex: "há 2 dias")
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'agora mesmo';
  if (diffMins < 60) return `há ${diffMins} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays < 7) return `há ${diffDays} dias`;
  
  return formatDate(dateString);
};

// Valida CPF com cálculo dos dígitos verificadores (Módulo 11 da Receita Federal)
export const isValidCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;

  // Rejeita sequências com todos os dígitos repetidos (ex: 111.111.111-11, 000.000.000-00)
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  // Validação do 1º dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i), 10) * (10 - i);
  }
  let rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(cleaned.charAt(9), 10)) return false;

  // Validação do 2º dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i), 10) * (11 - i);
  }
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(cleaned.charAt(10), 10)) return false;

  return true;
};

// Formata CPF com máscara
export const formatCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// Máscara CPF parcial para privacidade
export const maskCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, '');
  return `***${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-**`;
};

// Valida valor monetário
export const isValidAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

// Converte string de valor para número
export const parseAmount = (value: string): number => {
  const cleaned = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};

// ==================== STATUS & BADGES ====================

// Retorna classes de cor para status de transação
export const getTransactionStatusColor = (status: string): string => {
  const colors = {
    completed: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return colors[status as keyof typeof colors] || colors.pending;
};

// Retorna classes de cor para status KYC
export const getKYCStatusColor = (status: string): string => {
  const colors = {
    approved: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    under_review: 'bg-blue-100 text-blue-800 border-blue-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[status as keyof typeof colors] || colors.pending;
};

// Traduz status para português
export const translateStatus = (status: string): string => {
  const translations: Record<string, string> = {
    completed: 'Concluída',
    pending: 'Pendente',
    failed: 'Falhou',
    cancelled: 'Cancelada',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    under_review: 'Em análise',
  };
  return translations[status] || status;
};

// Traduz tipo de transação
export const translateTransactionType = (type: string): string => {
  const translations: Record<string, string> = {
    IN: 'Entrada',
    OUT: 'Saída',
  };
  return translations[type] || type;
};

// Traduz categoria de transação
export const translateCategory = (category: string): string => {
  const translations: Record<string, string> = {
    pix: 'PIX',
    ted: 'TED',
    investment: 'Investimento',
    withdrawal: 'Resgate',
    dividend: 'Dividendo',
    fee: 'Taxa',
    rwa_sale: 'Venda RWA',
    rwa_redemption: 'Resgate Físico',
  };
  return translations[category] || category;
};

// ==================== PERFORMANCE ====================

// Formata percentual de performance
export const formatPerformance = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

// Retorna cor baseada na performance
export const getPerformanceColor = (value: number): string => {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-600';
};

// ==================== TRUNCATE & HASH ====================

// Trunca hash de transação
export const truncateHash = (hash: string, startChars = 6, endChars = 4): string => {
  if (hash.length <= startChars + endChars) return hash;
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
};

// Trunca texto longo
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

// ==================== ARRAY HELPERS ====================

// Ordena array por campo
export const sortBy = <T>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// ==================== DEBOUNCE ====================

// Debounce para otimização de inputs
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// ==================== RANDOM ID ====================

// Gera ID único simples (só pro mock)
export const generateId = (prefix = 'ID'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

// ==================== EXPORTAÇÃO CSV ====================

// Gera conteúdo CSV estruturado com padrão BRL e encoding UTF-8 BOM
export const generateTransactionsCSV = (transactions: Transaction[]): string => {
  const headers = [
    'ID',
    'Data',
    'Hora',
    'Tipo',
    'Categoria',
    'Descrição',
    'Valor (R$)',
    'Status',
    'Origem',
    'Destino',
    'Observações',
    'Hash Blockchain',
  ];

  const escapeCSV = (value: string | number | undefined | null) => {
    if (value === undefined || value === null) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = transactions.map((tx) => {
    const d = new Date(tx.date);
    const dateFormatted = !isNaN(d.getTime())
      ? d.toLocaleDateString('pt-BR')
      : tx.date;
    const timeFormatted = !isNaN(d.getTime())
      ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : '';
    const formattedAmount =
      (tx.type === 'IN' ? '' : '-') + tx.amount.toFixed(2).replace('.', ',');

    return [
      escapeCSV(tx.id),
      escapeCSV(dateFormatted),
      escapeCSV(timeFormatted),
      escapeCSV(tx.type === 'IN' ? 'Entrada' : 'Saída'),
      escapeCSV(translateCategory(tx.category)),
      escapeCSV(tx.description),
      escapeCSV(formattedAmount),
      escapeCSV(translateStatus(tx.status)),
      escapeCSV(tx.fromAddress || '-'),
      escapeCSV(tx.toAddress || '-'),
      escapeCSV(tx.memo || '-'),
      escapeCSV(tx.txHash || '-'),
    ].join(';');
  });

  return '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
};

// Dispara download automático do CSV no navegador
export const downloadCSV = (content: string, filename: string) => {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ==================== CÁLCULO FINANCEIRO - CPR DIGITAL (CRÉDITO RURAL) ====================

export interface CPRSimulationResult {
  requestedAmount: number;
  termMonths: number;
  annualRate: number; // ex: 11.5
  monthlyRate: number; // taxa equivalente mensal
  monthlyPayment: number; // parcela Price
  totalRepayment: number;
  totalInterest: number;
  maxLtv: number; // percentual (ex: 70)
  requiredCollateralValue: number;
  requiredTokens: number;
  availableTokens: number;
  isEligible: boolean;
  effectiveLtv: number;
}

export const calculateCPRSimulation = (
  requestedAmount: number,
  termMonths: number,
  asset: RWAAsset,
  annualRate: number = 11.5,
  maxLtv: number = 0.70
): CPRSimulationResult => {
  const safeAmount = Math.max(0, requestedAmount);
  const safeMonths = Math.max(1, termMonths);

  // Taxa mensal equivalente a partir da taxa anual (juros compostos): (1 + ia)^(1/12) - 1
  const decimalAnnual = annualRate / 100;
  const monthlyRate = Math.pow(1 + decimalAnnual, 1 / 12) - 1;

  // Fórmula Price para cálculo da parcela fixa: PMT = PV * [i * (1 + i)^n] / [(1 + i)^n - 1]
  const factor = Math.pow(1 + monthlyRate, safeMonths);
  const monthlyPayment =
    safeAmount > 0
      ? Number(((safeAmount * (monthlyRate * factor)) / (factor - 1)).toFixed(2))
      : 0;

  const totalRepayment = Number((monthlyPayment * safeMonths).toFixed(2));
  const totalInterest = Number(Math.max(0, totalRepayment - safeAmount).toFixed(2));

  // Garantia RWA necessária: Valor do Empréstimo / LTV Máximo
  const requiredCollateralValue = Number((safeAmount / maxLtv).toFixed(2));
  const requiredTokens = Math.ceil(requiredCollateralValue / (asset.pricePerToken || 1));
  const availableTokens = Math.max(0, asset.quantity - (asset.lockedQuantity || 0));
  const isEligible = safeAmount > 0 && availableTokens >= requiredTokens;
  const actualCollateralValue = requiredTokens * asset.pricePerToken;
  const effectiveLtv =
    actualCollateralValue > 0
      ? Number(((safeAmount / actualCollateralValue) * 100).toFixed(1))
      : 0;

  return {
    requestedAmount: safeAmount,
    termMonths: safeMonths,
    annualRate,
    monthlyRate,
    monthlyPayment,
    totalRepayment,
    totalInterest,
    maxLtv: maxLtv * 100,
    requiredCollateralValue,
    requiredTokens,
    availableTokens,
    isEligible,
    effectiveLtv,
  };
};

// Copia texto com fallback robusto
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch {
    return false;
  }
};

// ==================== SIMULAÇÃO & DERIVATIVOS HEDGE B3 ====================

export const calculateHedgeSimulation = (
  type: HedgeType,
  commodityName: string,
  commoditySymbol: string,
  targetMaturity: string,
  quantitySacas: number,
  strikePrice: number,
  currentSpotPrice: number,
  availableBalance: number
): HedgeSimulationResult => {
  const safeQuantity = Math.max(0, quantitySacas);
  const safeStrike = Math.max(0, strikePrice);
  const safeSpot = Math.max(0, currentSpotPrice);

  const totalProtectedValue = Number((safeQuantity * safeStrike).toFixed(2));

  // Taxa de prêmio com base no moneyness (Strike vs Spot)
  let baseRate = 3.2; // ~3.2% ao semestre para ATM
  if (safeSpot > 0) {
    const moneyness = safeStrike / safeSpot;
    if (moneyness >= 1.05) baseRate = 4.5;
    else if (moneyness > 1.0) baseRate = 3.8;
    else if (moneyness < 0.95) baseRate = 2.2;
    else if (moneyness < 1.0) baseRate = 2.8;
  }

  const premiumCost = Number((totalProtectedValue * (baseRate / 100)).toFixed(2));
  const isEligible = safeQuantity >= 50 && safeStrike > 0 && availableBalance >= premiumCost;
  const isITM = safeStrike > safeSpot;
  const intrinsicValuePerSaca = Math.max(0, Number((safeStrike - safeSpot).toFixed(2)));

  // Cenário de stress: queda de 10% no preço spot
  const stressDropSpot = safeSpot * 0.90;
  const potentialProtectionGain = safeStrike > stressDropSpot
    ? Number(((safeStrike - stressDropSpot) * safeQuantity).toFixed(2))
    : 0;

  return {
    type,
    commodityName,
    commoditySymbol,
    targetMaturity,
    quantitySacas: safeQuantity,
    strikePrice: safeStrike,
    currentSpotPrice: safeSpot,
    totalProtectedValue,
    premiumRatePercent: baseRate,
    premiumCost,
    isEligible,
    isITM,
    intrinsicValuePerSaca,
    potentialProtectionGain,
  };
};

export const calculateHedgePayoff = (contract: HedgeContract): {
  isITM: boolean;
  payoffPerSaca: number;
  totalPayoff: number;
  netGain: number;
} => {
  const isITM = contract.strikePrice > contract.currentSpotPrice;
  const payoffPerSaca = Math.max(0, Number((contract.strikePrice - contract.currentSpotPrice).toFixed(2)));
  const totalPayoff = Number((payoffPerSaca * contract.quantitySacas).toFixed(2));
  const netGain = Number((totalPayoff - contract.premiumCost).toFixed(2));

  return {
    isITM,
    payoffPerSaca,
    totalPayoff,
    netGain,
  };
};