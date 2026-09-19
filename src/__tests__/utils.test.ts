import { describe, it, expect, vi } from 'vitest';
import {
  formatCurrency,
  parseAmount,
  translateStatus,
  translateCategory,
  translateTransactionType,
  sortBy,
  truncateHash,
  maskCPF,
  isValidCPF,
  generateTransactionsCSV,
  calculateCPRSimulation,
  copyToClipboard,
  downloadCSV,
} from '../lib/utils';
import { mockRWAAssets } from '../lib/mockData';
import type { RWAAsset } from '../lib/types';

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

    it('deve validar CPF corretamente usando algoritmo Módulo 11', () => {
      // CPFs válidos conhecidos (algoritmo Módulo 11)
      expect(isValidCPF('52998224725')).toBe(true);
      expect(isValidCPF('529.982.247-25')).toBe(true);

      // CPFs inválidos (tamanho incorreto)
      expect(isValidCPF('12345')).toBe(false);
      expect(isValidCPF('1234567890123')).toBe(false);

      // CPFs inválidos com dígitos repetidos
      expect(isValidCPF('11111111111')).toBe(false);
      expect(isValidCPF('00000000000')).toBe(false);
      expect(isValidCPF('99999999999')).toBe(false);

      // CPFs com dígitos verificadores incorretos
      expect(isValidCPF('52998224726')).toBe(false);
      expect(isValidCPF('12345678900')).toBe(false);
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

  describe('generateTransactionsCSV', () => {
    it('deve gerar CSV estruturado com BOM UTF-8, cabeçalhos e valores formatados', () => {
      const mockTx = [
        {
          id: 'TX-001',
          date: '2026-03-10T14:30:00Z',
          description: 'Venda de Soja',
          type: 'IN' as const,
          category: 'investment' as const,
          amount: 15400.5,
          status: 'completed' as const,
          fromAddress: '0x123',
          toAddress: '0x456',
          txHash: '0xabc123',
          memo: 'Safra boa',
        },
      ];

      const csv = generateTransactionsCSV(mockTx);

      // Deve começar com BOM UTF-8
      expect(csv.startsWith('\uFEFF')).toBe(true);

      // Deve conter cabeçalhos
      expect(csv).toContain('ID;Data;Hora;Tipo;Categoria;Descrição;Valor (R$);Status;Origem;Destino;Observações;Hash Blockchain');

      // Deve conter linha da transação formatada
      expect(csv).toContain('"TX-001"');
      expect(csv).toContain('"Entrada"');
      expect(csv).toContain('"Investimento"');
      expect(csv).toContain('"Venda de Soja"');
      expect(csv).toContain('"15400,50"');
      expect(csv).toContain('"Concluída"');
      expect(csv).toContain('"0xabc123"');
    });
  });

  describe('calculateCPRSimulation', () => {
    it('deve simular cálculo Price de parcelas e garantia RWA requerida', () => {
      const asset: RWAAsset = {
        ...mockRWAAssets[0],
        quantity: 5000,
        lockedQuantity: 500,
      };

      const result = calculateCPRSimulation(100000, 12, asset, 11.5, 0.7);

      expect(result.requestedAmount).toBe(100000);
      expect(result.termMonths).toBe(12);
      expect(result.monthlyPayment).toBeGreaterThan(8000);
      expect(result.totalRepayment).toBeGreaterThan(100000);
      expect(result.requiredCollateralValue).toBeGreaterThan(140000);
      expect(result.isEligible).toBe(true);
    });

    it('deve retornar não elegível quando os tokens livres forem insuficientes', () => {
      const asset: RWAAsset = {
        ...mockRWAAssets[0],
        quantity: 100,
        lockedQuantity: 90,
      };

      const result = calculateCPRSimulation(500000, 12, asset);
      expect(result.isEligible).toBe(false);
    });
  });

  describe('copyToClipboard & downloadCSV', () => {
    it('deve copiar texto usando navigator.clipboard com sucesso', async () => {
      Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true });
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      });
      const ok = await copyToClipboard('0x123456789');
      expect(ok).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('0x123456789');
    });

    it('deve disparar downloadCSV criando elemento âncora', () => {
      const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url');
      const revokeObjectURLMock = vi.fn();
      globalThis.URL.createObjectURL = createObjectURLMock;
      globalThis.URL.revokeObjectURL = revokeObjectURLMock;

      expect(() => downloadCSV('header1;header2\r\nval1;val2', 'extrato.csv')).not.toThrow();
    });
  });
});
