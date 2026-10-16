'use client';

import { useState, useMemo } from 'react';
import { useAgroFinanceStore } from '@/lib/store';
import { formatCurrency, formatNumber } from '@/lib/utils';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function WhatIfMacroSimulator() {
  const portfolio = useAgroFinanceStore((state) => state.portfolio);
  const cprContracts = useAgroFinanceStore((state) => state.cprContracts || []);
  const hedgeContracts = useAgroFinanceStore((state) => state.hedgeContracts || []);

  // Sliders de Cenário Macroeconômico
  const [usdBrlRate, setUsdBrlRate] = useState<number>(5.75);
  const [cropSupplyShockPercent, setCropSupplyShockPercent] = useState<number>(0);
  const [selicRatePercent, setSelicRatePercent] = useState<number>(11.5);

  const baselineSpotSoja = 138.5;
  const baselineUsd = 5.75;

  // Total de sacas em custódia e garantia
  const totalSacas = useMemo(() => {
    return portfolio?.assets.reduce((sum, a) => sum + a.quantity, 0) || 0;
  }, [portfolio]);

  const activeCprDebt = useMemo(() => {
    return cprContracts
      .filter((c) => c.status === 'active')
      .reduce((sum, c) => sum + c.totalRepayment, 0);
  }, [cprContracts]);

  const activeLockedSacas = useMemo(() => {
    return cprContracts
      .filter((c) => c.status === 'active')
      .reduce((sum, c) => sum + c.collateralQuantity, 0);
  }, [cprContracts]);

  const activeHedgedSacas = useMemo(() => {
    return hedgeContracts
      .filter((c) => c.status === 'active')
      .reduce((sum, c) => sum + c.quantitySacas, 0);
  }, [hedgeContracts]);

  // Cálculo de Preço Sob Choque
  // Preço da soja no porto tem correlação cambial direta (+0.65) e elástica com oferta USDA (-0.80)
  const simulatedSpotSoja = useMemo(() => {
    const fxFactor = (usdBrlRate - baselineUsd) / baselineUsd;
    const supplyFactor = -(cropSupplyShockPercent / 100);
    const combinedShock = (fxFactor * 0.70) + (supplyFactor * 0.85);
    return Math.max(50, Number((baselineSpotSoja * (1 + combinedShock)).toFixed(2)));
  }, [usdBrlRate, cropSupplyShockPercent]);

  // Valor da Carteira Simulado
  const simulatedPortfolioValue = useMemo(() => {
    return Number((totalSacas * simulatedSpotSoja).toFixed(2));
  }, [totalSacas, simulatedSpotSoja]);

  const baselinePortfolioValue = useMemo(() => {
    return Number((totalSacas * baselineSpotSoja).toFixed(2));
  }, [totalSacas]);

  const portfolioDiff = simulatedPortfolioValue - baselinePortfolioValue;
  const portfolioDiffPercent = baselinePortfolioValue > 0 ? (portfolioDiff / baselinePortfolioValue) * 100 : 0;

  // LTV Simulado da CPR
  const simulatedCollateralValue = activeLockedSacas * simulatedSpotSoja;
  const simulatedLtv = simulatedCollateralValue > 0 ? Number(((activeCprDebt / simulatedCollateralValue) * 100).toFixed(1)) : 0;
  const isMarginCall = simulatedLtv > 85;

  // Proteção de Hedge Ativa no Choque (Put B3 payoff)
  const hedgePayoffGain = useMemo(() => {
    if (simulatedSpotSoja >= baselineSpotSoja) return 0;
    const priceDrop = baselineSpotSoja - simulatedSpotSoja;
    return Number((activeHedgedSacas * priceDrop).toFixed(2));
  }, [simulatedSpotSoja, activeHedgedSacas]);

  // Presets
  const applyPreset = (preset: 'seca' | 'queda' | 'dolar' | 'reset') => {
    if (preset === 'reset') {
      setUsdBrlRate(5.75);
      setCropSupplyShockPercent(0);
      setSelicRatePercent(11.5);
    } else if (preset === 'seca') {
      setUsdBrlRate(6.10);
      setCropSupplyShockPercent(-18); // Quebra de 18% nos EUA
      setSelicRatePercent(12.5);
    } else if (preset === 'queda') {
      setUsdBrlRate(5.15);
      setCropSupplyShockPercent(15); // Supersafra global
      setSelicRatePercent(10.5);
    } else if (preset === 'dolar') {
      setUsdBrlRate(6.80);
      setCropSupplyShockPercent(0);
      setSelicRatePercent(13.5);
    }
  };

  return (
    <Card className="p-6 border border-gray-200 dark:border-gray-800">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-5 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>🎛️</span>
              <span>Simulador de Cenários Macroeconômicos (What-If Analysis)</span>
            </h3>
            <Badge variant="info">Stress Testing Dinâmico</Badge>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Mova os parâmetros para testar a resiliência patrimonial e das garantias de CPR
          </p>
        </div>

        {/* Botões de Cenários Pré-calibrados */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => applyPreset('seca')}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 font-semibold cursor-pointer transition-all"
          >
            🌾 Quebra Safra EUA
          </button>
          <button
            type="button"
            onClick={() => applyPreset('queda')}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 hover:bg-red-100 font-semibold cursor-pointer transition-all"
          >
            📉 Supersafra / Queda
          </button>
          <button
            type="button"
            onClick={() => applyPreset('dolar')}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 hover:bg-blue-100 font-semibold cursor-pointer transition-all"
          >
            💵 Dólar R$ 6,80
          </button>
          <button
            type="button"
            onClick={() => applyPreset('reset')}
            className="text-[11px] px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 font-medium cursor-pointer transition-all"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Controles de Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Slider 1: Câmbio USD/BRL */}
          <div className="bg-gray-50/80 dark:bg-gray-800/40 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="font-bold text-gray-800 dark:text-gray-200">
                1. Câmbio Dólar Comercial (PTAX)
              </span>
              <span className="font-mono font-bold text-agro-azul-escuro dark:text-blue-400">
                R$ {usdBrlRate.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="4.50"
              max="7.50"
              step="0.05"
              value={usdBrlRate}
              onChange={(e) => setUsdBrlRate(parseFloat(e.target.value))}
              className="w-full accent-agro-azul-escuro dark:accent-blue-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>R$ 4.50 (Real Forte)</span>
              <span>R$ 5.75 (Base Atual)</span>
              <span>R$ 7.50 (Estresse Severo)</span>
            </div>
          </div>

          {/* Slider 2: Oferta Global / Safra USDA */}
          <div className="bg-gray-50/80 dark:bg-gray-800/40 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="font-bold text-gray-800 dark:text-gray-200">
                2. Oferta Global de Grãos (USDA / Clima)
              </span>
              <span
                className={`font-mono font-bold ${
                  cropSupplyShockPercent < 0 ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {cropSupplyShockPercent > 0 ? `+${cropSupplyShockPercent}% (Excedente)` : cropSupplyShockPercent < 0 ? `${cropSupplyShockPercent}% (Seca / Quebra)` : 'Neutro (0%)'}
              </span>
            </div>
            <input
              type="range"
              min="-25"
              max="25"
              step="1"
              value={cropSupplyShockPercent}
              onChange={(e) => setCropSupplyShockPercent(parseInt(e.target.value, 10))}
              className="w-full accent-agro-verde-musgo dark:accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>-25% (Seca Extrema)</span>
              <span>0% (Safra Normal)</span>
              <span>+25% (Supersafra)</span>
            </div>
          </div>

          {/* Slider 3: Taxa de Juros Selic */}
          <div className="bg-gray-50/80 dark:bg-gray-800/40 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="font-bold text-gray-800 dark:text-gray-200">
                3. Taxa Selic / Custo de Financiamento
              </span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                {selicRatePercent.toFixed(1)}% a.a.
              </span>
            </div>
            <input
              type="range"
              min="8.0"
              max="16.0"
              step="0.25"
              value={selicRatePercent}
              onChange={(e) => setSelicRatePercent(parseFloat(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>8.0% (Crédito Barato)</span>
              <span>11.5% (Atual)</span>
              <span>16.0% (Aperto Monetário)</span>
            </div>
          </div>
        </div>

        {/* Painel de Resultados do Choque (5 cols) */}
        <div className="lg:col-span-5 bg-linear-to-b from-gray-900 to-slate-950 p-5 rounded-2xl text-white border border-gray-800 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-800">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Impacto Projetado
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                portfolioDiff >= 0
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-950 text-red-400 border border-red-500/30'
              }`}
            >
              {portfolioDiff >= 0 ? '▲ Ganho Patrimonial' : '▼ Queda Estimada'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Preço Projetado da Saca */}
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Cotação Simulada da Saca:</span>
              <span className="font-mono font-bold text-lg text-white">
                {formatCurrency(simulatedSpotSoja)}
                <span className="text-[11px] text-gray-400 font-normal ml-1">
                  ({simulatedSpotSoja > baselineSpotSoja ? '+' : ''}
                  {formatNumber(((simulatedSpotSoja - baselineSpotSoja) / baselineSpotSoja) * 100, 1)}%)
                </span>
              </span>
            </div>

            {/* Patrimônio da Fazenda */}
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Patrimônio RWA em Custódia:</span>
              <span className="font-mono font-bold text-base text-white">
                {formatCurrency(simulatedPortfolioValue)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Variação Financeira Líquida:</span>
              <span
                className={`font-mono font-bold ${
                  portfolioDiff >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {portfolioDiff >= 0 ? '+' : ''}{formatCurrency(portfolioDiff)} ({portfolioDiffPercent.toFixed(1)}%)
              </span>
            </div>

            {/* LTV & Risco de Margem de CPR */}
            <div className="pt-2 border-t border-gray-800 flex justify-between items-center">
              <div>
                <span className="text-gray-400 block text-[11px]">LTV Efetivo da CPR:</span>
                <span
                  className={`font-bold text-sm ${
                    isMarginCall ? 'text-red-400 animate-pulse' : 'text-emerald-400'
                  }`}
                >
                  {simulatedLtv}% {isMarginCall ? '⚠️ CHAMADA DE MARGEM' : '✓ Saudável'}
                </span>
              </div>

              {/* Ganho do Hedge se houver */}
              {hedgePayoffGain > 0 && (
                <div className="text-right">
                  <span className="text-gray-400 block text-[11px]">Proteção B3 Paga:</span>
                  <span className="font-bold text-sm text-blue-400">
                    +{formatCurrency(hedgePayoffGain)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {isMarginCall && (
            <div className="p-2.5 rounded-lg bg-red-900/30 border border-red-700/50 text-[11px] text-red-200">
              🚨 <strong>Aviso de Estresse:</strong> O valor das sacas em garantia caiu abaixo do limite seguro da CPR. Seria necessário depositar mais sacas ou exercer travas B3.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
