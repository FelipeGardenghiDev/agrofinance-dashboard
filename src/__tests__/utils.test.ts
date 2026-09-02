import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  parseAmount,
  translateStatus,
  translateCategory,
  translateTransactionType,
  sortBy,
  truncateHash,
  maskCPF,
} from '../lib/utils';

describe('utils - Funções Utilitárias e de Formatação', () => {
  describe('formatCurrency', () => {
    it('deve formatar valores monetários no padrão brasileiro R$', () => {
      const formatted = formatCurrency(1250.5);
      // Substitui non-breaking space se houver
      const normalized = formatted.replace(/\u00a0/g, ' ');
      expect(normalized).toBe('R$ 1.250,50');
    });

    it('deve formatar zero corretamente', () => {
      const formatted = formatCurrency(0);
      const normalized = formatted.replace(/\u00a0/g, ' ');
      expect(normalized).toBe('R$ 0,00');
    });
  });

  describe('parseAmount', () => {
    it('deve converter strings monetárias com pontos e vírgulas para números válidos', () => {
      expect(parseAmount('1.250,50')).toBe(1250.5);
      expect(parseAmount('50.000,00')).toBe(50000);
      expect(parseAmount('99,99')).toBe(99.99);
      expect(parseAmount('1000')).toBe(1000);
    });

    it('deve retornar 0 para valores vazios ou inválidos', () => {
      expect(parseAmount('')).toBe(0);
      expect(parseAmount('abc')).toBe(0);
    });
  });

  describe('traduções de domínios', () => {
    it('deve traduzir corretamente status e tipos', () => {
      expect(translateStatus('completed')).toBe('Concluída');
      expect(translateStatus('pending')).toBe('Pendente');
      expect(translateStatus('failed')).toBe('Falhou');
      expect(translateTransactionType('IN')).toBe('Entrada');
      expect(translateTransactionType('OUT')).toBe('Saída');
      expect(translateCategory('investment')).toBe('Investimento');
    });
  });

  describe('truncateHash & maskCPF', () => {
    it('deve truncar hash de blockchain com prefixo e sufixo', () => {
      const hash = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      const truncated = truncateHash(hash, 6, 4);
      expect(truncated).toBe('0x742d...f44e');
    });

    it('deve mascarar CPF para preservar privacidade', () => {
      const cpf = '12345678900';
      expect(maskCPF(cpf)).toBe('***456.789-**');
    });
  });

  describe('sortBy', () => {
    it('deve ordenar array de objetos por chave numérica de forma ascendente e descendente', () => {
      const items = [{ val: 10 }, { val: 50 }, { val: 20 }];
      const asc = sortBy(items, 'val', 'asc');
      expect(asc.map(i => i.val)).toEqual([10, 20, 50]);

      const desc = sortBy(items, 'val', 'desc');
      expect(desc.map(i => i.val)).toEqual([50, 20, 10]);
    });
  });
});
