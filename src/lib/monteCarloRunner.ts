import { MLCommodityEngine } from './mlForecasting';

export interface MonteCarloParams {
  lockedSacas: number;
  spotPrice: number;
  cprDebtTotal: number;
  daysToMaturity: number;
  numSimulations?: number;
}

export interface MonteCarloResult {
  totalSimulations: number;
  breachProbabilityPercent: number;
  stressCollateralValueP5: number;
  isHighRisk: boolean;
  executionTimeMs?: number;
  isOffloaded?: boolean;
}

const WORKER_CODE = `
self.onmessage = function(e) {
  const params = e.data;
  const nSims = params.numSimulations || 1000;
  const t = params.daysToMaturity / 365.25;
  const vol = 0.23;
  const dt = t;
  const sqrtDt = Math.sqrt(dt);

  let breaches = 0;
  const simulatedCollateralValues = [];

  for (let i = 0; i < nSims; i++) {
    const u1 = Math.random() || 0.0001;
    const u2 = Math.random() || 0.0001;
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

    const simPrice = params.spotPrice * Math.exp((-0.5 * vol * vol * dt) + (vol * sqrtDt * z));
    const colVal = simPrice * params.lockedSacas;
    simulatedCollateralValues.push(colVal);

    if (colVal < params.cprDebtTotal * 1.15) {
      breaches++;
    }
  }

  simulatedCollateralValues.sort((a, b) => a - b);
  const p5Value = simulatedCollateralValues[Math.floor(nSims * 0.05)];
  const breachProbability = Number(((breaches / nSims) * 100).toFixed(1));

  self.postMessage({
    totalSimulations: nSims,
    breachProbabilityPercent: breachProbability,
    stressCollateralValueP5: Number(p5Value.toFixed(2)),
    isHighRisk: breachProbability > 15.0,
    isOffloaded: true
  });
};
`;

export class MonteCarloRunner {
  /**
   * Executa a simulação de Monte Carlo em Web Worker em segundo plano (evita congelar a interface a 60 FPS)
   * com fallback transparente para execução síncrona.
   */
  static async runAsync(params: MonteCarloParams): Promise<MonteCarloResult> {
    const start = typeof performance !== 'undefined' ? performance.now() : Date.now();

    // Se estiver em ambiente de teste ou SSR (sem Worker), roda síncrono
    if (typeof window === 'undefined' || typeof Worker === 'undefined' || typeof Blob === 'undefined') {
      const res = MLCommodityEngine.runMonteCarloCollateralStress(params);
      const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
      return {
        ...res,
        executionTimeMs: Number((end - start).toFixed(2)),
        isOffloaded: false,
      };
    }

    return new Promise((resolve) => {
      try {
        const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        const worker = new Worker(workerUrl);

        worker.onmessage = (e) => {
          const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
          resolve({
            ...e.data,
            executionTimeMs: Number((end - start).toFixed(2)),
          });
        };

        worker.onerror = () => {
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
          // Fallback para síncrono
          const res = MLCommodityEngine.runMonteCarloCollateralStress(params);
          resolve({ ...res, isOffloaded: false });
        };

        worker.postMessage(params);
      } catch {
        // Fallback síncrono se houver restrição de CSP ou ambiente
        const res = MLCommodityEngine.runMonteCarloCollateralStress(params);
        resolve({ ...res, isOffloaded: false });
      }
    });
  }
}
