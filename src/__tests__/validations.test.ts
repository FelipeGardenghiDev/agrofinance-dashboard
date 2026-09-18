import { describe, it, expect } from 'vitest';
import { createOperationSchema } from '../lib/validations';
import { mockRWAAssets } from '../lib/mockData';

describe('createOperationSchema - Validações de Regras de Negócio', () => {
  const currentBalance = 50000;
  const schema = createOperationSchema(currentBalance);

  it('deve aprovar uma operação PIX válida dentro do limite de saldo', () => {
    const validData = {
      type: 'pix' as const,
      beneficiary: '123.456.789-00',
      amount: '2.500,00',
      memo: 'Pagamento de insumos',
    };

    const result = schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('deve aprovar uma operação TED válida com observação opcional', () => {
    const validTed = {
      type: 'ted' as const,
      beneficiary: 'Banco 001 - Ag 1234 - C/C 12345-6',
      amount: '15000',
    };

    const result = schema.safeParse(validTed);
    expect(result.success).toBe(true);
  });

  it('deve reprovar quando o valor for zero', () => {
    const invalidData = {
      type: 'pix' as const,
      beneficiary: '123.456.789-00',
      amount: '0,00',
    };

    const result = schema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.message.includes('maior que zero'))).toBe(true);
    }
  });

  it('deve reprovar quando o valor for negativo', () => {
    const invalidData = {
      type: 'pix' as const,
      beneficiary: '123.456.789-00',
      amount: '-500,00',
    };

    const result = schema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('deve reprovar dinamicamente quando o valor exceder o saldo disponível atual', () => {
    const overBalanceData = {
      type: 'pix' as const,
      beneficiary: '123.456.789-00',
      amount: '50000.01',
    };

    const result = schema.safeParse(overBalanceData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.message.includes('Saldo insuficiente'))).toBe(true);
    }
  });

  it('deve aprovar transferência exatamente igual ao saldo disponível (saldo zero após operação)', () => {
    const exactBalanceData = {
      type: 'pix' as const,
      beneficiary: '123.456.789-00',
      amount: '50.000,00',
    };

    const result = schema.safeParse(exactBalanceData);
    expect(result.success).toBe(true);
  });

  it('deve reprovar destinatário/chave com menos de 11 caracteres', () => {
    const shortBeneficiary = {
      type: 'pix' as const,
      beneficiary: 'curto',
      amount: '100,00',
    };

    const result = schema.safeParse(shortBeneficiary);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.message.includes('mínimo 11 caracteres'))).toBe(true);
    }
  });

  it('deve aprovar venda RWA válida e reprovar quando não selecionar o ativo', () => {
    const rwaSchema = createOperationSchema(50000);
    
    // Sem ativo selecionado deve falhar
    const invalidSale = {
      type: 'sell_rwa' as const,
      amount: '5.000,00',
    };
    expect(rwaSchema.safeParse(invalidSale).success).toBe(false);

    // Com ativo selecionado deve passar
    const validSale = {
      type: 'sell_rwa' as const,
      assetId: 'RWA-SOJA-001',
      amount: '5.000,00',
    };
    expect(rwaSchema.safeParse(validSale).success).toBe(true);
  });

  it('deve validar resgate físico exigindo ativo e armazém credenciado', () => {
    const rwaSchema = createOperationSchema(50000);

    // Sem armazém deve falhar
    const noWarehouse = {
      type: 'redeem_rwa' as const,
      assetId: 'RWA-MILHO-001',
      amount: '3.000,00',
    };
    expect(rwaSchema.safeParse(noWarehouse).success).toBe(false);

    // Com ativo e armazém deve passar
    const validRedeem = {
      type: 'redeem_rwa' as const,
      assetId: 'RWA-MILHO-001',
      amount: '3.000,00',
      warehouse: 'Silo Central Cooperativa Agro SP',
    };
    expect(rwaSchema.safeParse(validRedeem).success).toBe(true);
  });

  it('deve validar limites de saldo de tokens e pertencimento ao portfólio do produtor', () => {
    const portfolioSchema = createOperationSchema(50000, mockRWAAssets);

    // Venda de ativo inexistente na carteira
    const nonExistentSale = {
      type: 'sell_rwa' as const,
      assetId: 'RWA-CAFE-999',
      amount: '10.000,00',
    };
    const res1 = portfolioSchema.safeParse(nonExistentSale);
    expect(res1.success).toBe(false);
    if (!res1.success) {
      expect(res1.error.issues.some(i => i.message.includes('não encontrado'))).toBe(true);
    }

    // Venda acima do saldo total de tokens daquele ativo
    const overSale = {
      type: 'sell_rwa' as const,
      assetId: 'RWA-SOJA-001',
      amount: '200.000,00',
    };
    const res2 = portfolioSchema.safeParse(overSale);
    expect(res2.success).toBe(false);
    if (!res2.success) {
      expect(res2.error.issues.some(i => i.message.includes('insuficiente'))).toBe(true);
    }

    // Aporte de investimento sem ativo deve falhar
    const noAssetDeposit = {
      type: 'investment_rwa' as const,
      amount: '10.000,00',
    };
    expect(portfolioSchema.safeParse(noAssetDeposit).success).toBe(false);

    // Aporte de investimento válido
    const validDeposit = {
      type: 'investment_rwa' as const,
      assetId: 'RWA-SOJA-001',
      amount: '10.000,00',
    };
    expect(portfolioSchema.safeParse(validDeposit).success).toBe(true);
  });
});
