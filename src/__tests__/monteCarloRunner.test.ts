import { describe, it, expect } from 'vitest';
import { MonteCarloRunner } from '../lib/monteCarloRunner';

describe('MonteCarloRunner - Execução Assíncrona e Performance', () => {
  it('deve rodar simulação de Monte Carlo assíncrona com métricas de tempo de execução', async () => {
    const res = await MonteCarloRunner.runAsync({
      lockedSacas: 1000,
      spotPrice: 138.5,
      cprDebtTotal: 65000,
      daysToMaturity: 180,
      numSimulations: 500,
    });

    expect(res.totalSimulations).toBe(500);
    expect(res.breachProbabilityPercent).toBeGreaterThanOrEqual(0);
    expect(res.breachProbabilityPercent).toBeLessThanOrEqual(100);
    expect(res.stressCollateralValueP5).toBeGreaterThan(0);
    expect(typeof res.isHighRisk).toBe('boolean');
    expect(res.executionTimeMs).toBeDefined();
    expect(res.executionTimeMs).toBeGreaterThanOrEqual(0);
  });
});
