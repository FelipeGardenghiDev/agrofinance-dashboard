'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAgroFinanceStore } from '@/lib/store';
import { MLCommodityEngine } from '@/lib/mlForecasting';
import { SupabaseAgroTelemetry } from '@/lib/supabaseAgro';
import { formatCurrency } from '@/lib/utils';
import Badge from '../ui/Badge';

export default function SmartHedgeAdvisorCard() {
  const portfolio = useAgroFinanceStore((state) => state.portfolio);
  const hedgeContracts = useAgroFinanceStore((state) => state.hedgeContracts || []);
  const cprContracts = useAgroFinanceStore((state) => state.cprContracts || []);
  const [telemetrySent, setTelemetrySent] = useState(false);

  // Calcula sacas totais em custódia
  const totalCustodySacas = useMemo(() => {
    return portfolio?.assets.reduce((sum, a) => sum + a.quantity, 0) || 0;
  }, [portfolio]);

  const lockedInCPRSacas = useMemo(() => {
    return cprContracts
      .filter((c) => c.status === 'active')
      .reduce((sum, c) => sum + c.collateralQuantity, 0);
  }, [cprContracts]);

  const currentHedgedSacas = useMemo(() => {
    return hedgeContracts
      .filter((c) => c.status === 'active')
      .reduce((sum, c) => sum + c.quantitySacas, 0);
  }, [hedgeContracts]);

  // Preço base da soja no porto
  const spotPrice = 138.5;

  // 1. Gera previsão preditiva
  const forecast = useMemo(() => {
    return MLCommodityEngine.generateForecast('SOJA-PR', spotPrice);
  }, [spotPrice]);

  // 2. Avalia a carteira com o Smart Hedge Advisor
  const advisor = useMemo(() => {
    return MLCommodityEngine.evaluateHedgeStrategy({
      totalCustodySacas,
      lockedInCPRSacas,
      currentHedgedSacas,
      spotPrice,
      forecast,
    });
  }, [totalCustodySacas, lockedInCPRSacas, currentHedgedSacas, spotPrice, forecast]);

  const handleApplyClick = () => {
    if (!telemetrySent) {
      SupabaseAgroTelemetry.emitOpsEvent({
        eventType: 'HEDGE_SIMULATION',
        payload: {
          recommendation: advisor.actionTitle,
          suggestedStrikePrice: advisor.suggestedStrikePrice,
          suggestedDerivative: advisor.suggestedDerivative,
          totalCustodySacas,
          currentHedgedSacas,
          estimatedRiskAvoided: advisor.estimatedRiskAvoided,
        },
      });
      setTelemetrySent(true);
    }
  };

  const statusVariant =
    advisor.status === 'URGENT'
      ? 'error'
      : advisor.status === 'RECOMMENDED'
      ? 'warning'
      : 'success';

  return (
    <div className="bg-linear-to-br from-gray-900 via-gray-900 to-agro-azul-escuro rounded-2xl p-6 text-white shadow-lg border border-gray-800 relative overflow-hidden">
      {/* Glow de fundo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-agro-verde-musgo/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-agro-verde-musgo/20 border border-agro-verde-musgo/30 flex items-center justify-center text-xl shrink-0">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">Smart Hedge Advisor (IA Quant)</h3>
              <Badge variant={statusVariant}>
                {advisor.status === 'URGENT'
                  ? 'Ação Recomendada'
                  : advisor.status === 'RECOMMENDED'
                  ? 'Alerta Moderado'
                  : 'Carteira Segura'}
              </Badge>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Análise contínua de risco de carteira RWA com base em modelos de volatilidade estocástica
            </p>
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-gray-800 sm:pl-4">
          <span className="text-[11px] text-gray-400 block">Risco Evitado Estimado</span>
          <span className="text-lg font-black text-emerald-400">
            {formatCurrency(advisor.estimatedRiskAvoided)}
          </span>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-5 items-center">
        {/* Recomendação e Resumo */}
        <div className="md:col-span-7 space-y-3">
          <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/60">
            <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
              <span>🎯</span>
              <span>{advisor.actionTitle}</span>
            </h4>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
              {advisor.summary}
            </p>
          </div>

          {/* Drivers XAI (Explainable AI) */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Fatores Determinantes (XAI):
            </span>
            <ul className="text-xs text-gray-300 space-y-1">
              {advisor.reasoning.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 shrink-0">›</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Métricas e CTA */}
        <div className="md:col-span-5 bg-gray-950/60 rounded-xl p-4 border border-gray-800 space-y-3.5">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-400 block text-[11px]">Strike Sugerido</span>
              <span className="font-bold text-white text-sm">
                {formatCurrency(advisor.suggestedStrikePrice)}/sc
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Cobertura Alvo</span>
              <span className="font-bold text-white text-sm">
                {advisor.recommendedCoveragePercent}% da safra
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Derivativo</span>
              <span className="font-semibold text-blue-300 text-xs uppercase">
                {advisor.suggestedDerivative === 'commodity_put' ? 'Opção Put B3' : 'NDF Dólar'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">VaR 95% (30d)</span>
              <span className="font-bold text-amber-400 text-xs">
                -R$ {forecast.var95Percent30d.toFixed(2)}/sc
              </span>
            </div>
          </div>

          <Link
            href="/hedge"
            onClick={handleApplyClick}
            className="w-full block text-center py-2.5 px-4 rounded-xl font-bold text-xs bg-agro-verde-musgo hover:bg-emerald-600 text-white transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Abrir Simulador & Travar Preço na B3 →
          </Link>
        </div>
      </div>
    </div>
  );
}
