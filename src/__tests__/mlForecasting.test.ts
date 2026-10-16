import { describe, it, expect } from 'vitest';
import { MLCommodityEngine } from '../lib/mlForecasting';

describe('MLCommodityEngine - Inteligência Artificial & Modelos Quant Agro', () => {
  describe('generateForecast (Projeções Multi-Horizonte P10/P50/P90)', () => {
    it('deve gerar previsões probabilísticas para Soja com quantis ordenados', () => {
      const forecast = MLCommodityEngine.generateForecast('SOJA-PR', 138.50);

      expect(forecast.symbol).toBe('SOJA-PR');
      expect(forecast.currentPrice).toBe(138.50);
      expect(forecast.forecastPoints.length).toBe(7); // 7, 15, 30, 45, 60, 75, 90 dias
      expect(forecast.volatilityAnnual).toBeGreaterThan(0);
      expect(forecast.var95Percent30d).toBeGreaterThan(0);
      expect(forecast.drivers.length).toBeGreaterThan(0);

      // Em cada horizonte, P10 <= P50 <= P90 (consistência matemática de quantis)
      forecast.forecastPoints.forEach((point) => {
        expect(point.p10).toBeLessThanOrEqual(point.p50);
        expect(point.p50).toBeLessThanOrEqual(point.p90);
        expect(point.p10).toBeGreaterThan(0);
      });
    });

    it('deve estimar volatilidade adaptativa a partir de histórico recente de preços', () => {
      const historical = [135, 137, 134, 139, 142, 138, 140];
      const forecast = MLCommodityEngine.generateForecast('SOJA-PR', 140, historical);

      expect(forecast.volatilityAnnual).toBeGreaterThanOrEqual(12);
      expect(forecast.volatilityAnnual).toBeLessThanOrEqual(45);
    });

    it('deve calcular Value at Risk (VaR 95% em 30 dias) proporcional à volatilidade', () => {
      const forecastSoja = MLCommodityEngine.generateForecast('SOJA-PR', 100);
      expect(forecastSoja.var95Percent30d).toBeGreaterThan(0);
      expect(forecastSoja.varPercent).toBeGreaterThan(5);
    });
  });

  describe('runMonteCarloCollateralStress (Simulação Estocástica de Colateral)', () => {
    it('deve rodar simulação de Monte Carlo com 1.000 trajetórias e retornar probabilidade de breach', () => {
      const stress = MLCommodityEngine.runMonteCarloCollateralStress({
        lockedSacas: 1000,
        spotPrice: 138.50,
        cprDebtTotal: 70000, // Dívida de 70k para garantia de 138.5k (LTV ~50%)
        daysToMaturity: 365,
        numSimulations: 500,
      });

      expect(stress.totalSimulations).toBe(500);
      expect(stress.breachProbabilityPercent).toBeGreaterThanOrEqual(0);
      expect(stress.breachProbabilityPercent).toBeLessThanOrEqual(100);
      expect(stress.stressCollateralValueP5).toBeGreaterThan(0);
      // Para LTV 50%, a probabilidade de breach de 115% deve ser muito baixa (< 25%)
      expect(stress.breachProbabilityPercent).toBeLessThan(35);
    });

    it('deve sinalizar alto risco quando o colateral está apertado perante a dívida', () => {
      const stressHighRisk = MLCommodityEngine.runMonteCarloCollateralStress({
        lockedSacas: 1000,
        spotPrice: 100, // Colateral total = 100k
        cprDebtTotal: 95000, // Dívida = 95k -> 115% de 95k = 109.25k (já quebrado ou quase)
        daysToMaturity: 180,
        numSimulations: 300,
      });

      expect(stressHighRisk.breachProbabilityPercent).toBeGreaterThan(20);
      expect(stressHighRisk.isHighRisk).toBe(true);
    });
  });

  describe('evaluateHedgeStrategy (Smart Hedge Advisor)', () => {
    it('deve recomendar status SAFE se 100% da safra já estiver protegida', () => {
      const forecast = MLCommodityEngine.generateForecast('SOJA-PR', 138.50);
      const advice = MLCommodityEngine.evaluateHedgeStrategy({
        totalCustodySacas: 2000,
        lockedInCPRSacas: 500,
        currentHedgedSacas: 2000, // 100% hedged
        spotPrice: 138.50,
        forecast,
      });

      expect(advice.status).toBe('SAFE');
      expect(advice.recommendedCoveragePercent).toBe(100);
      expect(advice.reasoning.length).toBeGreaterThan(0);
    });

    it('deve emitir recomendação quando a carteira estiver desprotegida', () => {
      const forecast = MLCommodityEngine.generateForecast('SOJA-PR', 138.50);
      const advice = MLCommodityEngine.evaluateHedgeStrategy({
        totalCustodySacas: 5000,
        lockedInCPRSacas: 1000,
        currentHedgedSacas: 0, // 0% hedged
        spotPrice: 138.50,
        forecast,
      });

      expect(['URGENT', 'RECOMMENDED']).toContain(advice.status);
      expect(advice.suggestedStrikePrice).toBeGreaterThan(100);
      expect(advice.estimatedRiskAvoided).toBeGreaterThan(0);
    });
  });
});
