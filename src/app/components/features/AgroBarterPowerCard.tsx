'use client';

import { useMemo } from 'react';
import { useAgroFinanceStore } from '@/lib/store';
import { formatCurrency, formatNumber } from '@/lib/utils';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface InsumoBarter {
  id: string;
  name: string;
  category: 'Fertilizante' | 'Combustível' | 'Defensivo';
  unit: string;
  marketPriceBrl: number;
  payingCommodity: 'Soja' | 'Milho';
  commodityPricePerSaca: number;
  benchmarkSacas: number; // Média histórica de sacas necessárias
}

export default function AgroBarterPowerCard() {
  const portfolio = useAgroFinanceStore((state) => state.portfolio);
  const marketQuotes = useAgroFinanceStore((state) => state.marketQuotes || []);

  const sojaPrice = useMemo(() => {
    const q = marketQuotes.find((m) => m.symbol === 'SOJA-PR');
    return q?.price || 138.5;
  }, [marketQuotes]);

  const milhoPrice = useMemo(() => {
    const q = marketQuotes.find((m) => m.symbol === 'MILHO-B3');
    return q?.price || 63.8;
  }, [marketQuotes]);

  const totalSojaSacas = useMemo(() => {
    const soja = portfolio?.assets.find((a) => a.tokenSymbol.includes('SOJA'));
    return soja?.quantity || 0;
  }, [portfolio]);

  const insumos: InsumoBarter[] = [
    {
      id: 'npk-04-14-08',
      name: 'Adubo NPK (04-14-08)',
      category: 'Fertilizante',
      unit: '1 Tonelada',
      marketPriceBrl: 3200,
      payingCommodity: 'Soja',
      commodityPricePerSaca: sojaPrice,
      benchmarkSacas: 26.5,
    },
    {
      id: 'diesel-s10',
      name: 'Diesel S10 Granel',
      category: 'Combustível',
      unit: '1.000 Litros',
      marketPriceBrl: 5950,
      payingCommodity: 'Milho',
      commodityPricePerSaca: milhoPrice,
      benchmarkSacas: 105.0,
    },
    {
      id: 'fungicida-soja',
      name: 'Fungicida Sistêmico Premium',
      category: 'Defensivo',
      unit: 'Pacote 100 Hectares',
      marketPriceBrl: 21500,
      payingCommodity: 'Soja',
      commodityPricePerSaca: sojaPrice,
      benchmarkSacas: 175.0,
    },
  ];

  return (
    <Card className="p-5 border border-gray-200 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>🌾</span>
              <span>Poder de Compra Agro & Barter (Relação de Troca)</span>
            </h3>
            <Badge variant="success">Paridade em Tempo Real</Badge>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Quantas sacas da sua produção pagam insumos agrícolas essenciais hoje
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[11px] text-gray-400 block">Capacidade da sua Custódia (Soja)</span>
          <span className="text-xs font-bold text-agro-verde-musgo dark:text-emerald-400">
            {totalSojaSacas > 0
              ? `${Math.floor(totalSojaSacas / 23.1)} toneladas de adubo NPK equivalentes`
              : 'Sem custódia de soja'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {insumos.map((insumo) => {
          const sacasNecessarias = Number((insumo.marketPriceBrl / insumo.commodityPricePerSaca).toFixed(1));
          const diferencaBenchmark = Number((((sacasNecessarias - insumo.benchmarkSacas) / insumo.benchmarkSacas) * 100).toFixed(1));
          const isFavoravel = diferencaBenchmark <= 0; // Menos sacas necessárias que a média histórica = Favorável ao produtor

          return (
            <div
              key={insumo.id}
              className="bg-gray-50/70 dark:bg-gray-800/40 rounded-xl p-4 border border-gray-200/60 dark:border-gray-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                  <span className="font-semibold uppercase tracking-wider">{insumo.category}</span>
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      isFavoravel
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {isFavoravel ? '✓ Barter Favorável' : '⚠️ Atenção Custo'}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-gray-900 dark:text-white">{insumo.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Base: {insumo.unit} ({formatCurrency(insumo.marketPriceBrl)})
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-gray-900 dark:text-white">
                    {sacasNecessarias}
                  </span>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    sacas de {insumo.payingCommodity}
                  </span>
                </div>

                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-between">
                  <span>Média histórica: {insumo.benchmarkSacas} sc</span>
                  <span className={isFavoravel ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                    {isFavoravel ? '' : '+'}{diferencaBenchmark}%
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
