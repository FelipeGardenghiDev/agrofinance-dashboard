import { describe, it, expect } from 'vitest';
import { FinancialMath } from '../lib/financialMath';
import Decimal from 'decimal.js';

describe('FinancialMath - Precisão Arbitrária e Cálculos Institucionais', () => {
  it('deve eliminar o erro de ponto flutuante IEEE 754 (0.1 + 0.2 === 0.3)', () => {
    // No JS padrão: 0.1 + 0.2 = 0.30000000000000004
    expect(0.1 + 0.2).not.toBe(0.3);

    const sum = FinancialMath.add(0.1, 0.2);
    expect(sum.toNumber()).toBe(0.3);
    expect(sum.toString()).toBe('0.3');
  });

  it('deve somar múltiplos valores com formatações variadas', () => {
    const sum = FinancialMath.add('R$ 1.000,50', 500, new Decimal(250.25));
    expect(sum.toNumber()).toBe(1750.75);
  });

  it('deve multiplicar com precisão centesimal exata', () => {
    const result = FinancialMath.multiply(138.50, 1500);
    expect(result.toNumber()).toBe(207750);
  });

  it('deve proteger divisão por zero retornando zero sem travar a aplicação', () => {
    const safeDiv = FinancialMath.divide(100, 0);
    expect(safeDiv.toNumber()).toBe(0);
    expect(safeDiv.isZero()).toBe(true);
  });

  describe('calculateCPR (Cédula de Produto Rural & Tabela Price)', () => {
    it('deve calcular corretamente a amortização Price de CPR com colateral', () => {
      const cpr = FinancialMath.calculateCPR({
        requestedAmount: 50000,
        termMonths: 12,
        spotPricePerSaca: 138.50,
        annualInterestRatePercent: 11.5,
        ltvMaxPercent: 70,
      });

      expect(cpr.amount).toBe(50000);
      expect(cpr.monthlyPayment).toBeGreaterThan(4300);
      expect(cpr.monthlyPayment).toBeLessThan(4600);
      expect(cpr.totalRepayment).toBeGreaterThan(50000);
      expect(cpr.totalInterest).toBe(Number((cpr.totalRepayment - 50000).toFixed(2)));
      expect(cpr.requiredTokens).toBeGreaterThan(0);
      expect(cpr.collateralValue).toBe(Number((cpr.requiredTokens * 138.50).toFixed(2)));
      expect(cpr.effectiveLtvPercent).toBeLessThanOrEqual(70);
    });

    it('deve lidar com taxa de juros zero de forma linear', () => {
      const cpr = FinancialMath.calculateCPR({
        requestedAmount: 12000,
        termMonths: 12,
        spotPricePerSaca: 100,
        annualInterestRatePercent: 0,
        ltvMaxPercent: 70,
      });

      expect(cpr.monthlyPayment).toBe(1000);
      expect(cpr.totalRepayment).toBe(12000);
      expect(cpr.totalInterest).toBe(0);
    });
  });

  describe('calculateHedge (Derivativos B3 / Opção Put)', () => {
    it('deve calcular o payoff de opção Put In-The-Money (preço de mercado abaixo do strike)', () => {
      const hedge = FinancialMath.calculateHedge({
        quantitySacas: 1000,
        strikePrice: 140,
        currentSpotPrice: 130, // Mercado caiu -> Put valorizou
        premiumRatePercent: 3.5,
      });

      expect(hedge.totalProtectedValue).toBe(140000);
      expect(hedge.premiumCost).toBe(4900); // 3.5% de 140.000
      expect(hedge.isITM).toBe(true);
      expect(hedge.intrinsicValuePerSaca).toBe(10);
      expect(hedge.totalIntrinsicValue).toBe(10000);
    });

    it('deve calcular o payoff de opção Put Out-of-The-Money quando preço de mercado sobe', () => {
      const hedge = FinancialMath.calculateHedge({
        quantitySacas: 1000,
        strikePrice: 140,
        currentSpotPrice: 155, // Mercado subiu -> Put não dá direito a exercício
        premiumRatePercent: 3.5,
      });

      expect(hedge.isITM).toBe(false);
      expect(hedge.intrinsicValuePerSaca).toBe(0);
      expect(hedge.totalIntrinsicValue).toBe(0);
    });
  });

  describe('generateIdempotencyKey', () => {
    it('deve gerar chave única com prefixo correto', () => {
      const key1 = FinancialMath.generateIdempotencyKey('cpr');
      const key2 = FinancialMath.generateIdempotencyKey('cpr');

      expect(key1).toMatch(/^cpr_/);
      expect(key2).toMatch(/^cpr_/);
      expect(key1).not.toBe(key2);
    });
  });
});
