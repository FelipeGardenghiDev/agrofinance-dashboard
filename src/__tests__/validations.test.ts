import { describe, it, expect } from 'vitest';
import { createOperationSchema } from '../lib/validations';

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
});
