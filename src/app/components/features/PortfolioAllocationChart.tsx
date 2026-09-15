'use client';

import { useState, useMemo } from 'react';
import type { RWAAsset } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import Card from '../ui/Card';

interface PortfolioAllocationChartProps {
  assets: RWAAsset[];
  totalValue: number;
}

const PALETTE = [
  '#085A8C', // Azul Agro
  '#8AA626', // Verde Musgo
  '#D97706', // Dourado Âmbar (Milho)
  '#059669', // Esmeralda
  '#467F8C', // Azul Claro
  '#6366F1', // Indigo
];

export default function PortfolioAllocationChart({
  assets,
  totalValue,
}: PortfolioAllocationChartProps) {
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);

  const chartData = useMemo(() => {
    if (!assets || assets.length === 0 || totalValue <= 0) return [];

    let accumulatedPercentage = 0;
    return assets.map((asset, index) => {
      const percentage = (asset.totalValue / totalValue) * 100;
      const data = {
        ...asset,
        color: PALETTE[index % PALETTE.length],
        percentage: Number(percentage.toFixed(1)),
        startPercentage: accumulatedPercentage,
      };
      accumulatedPercentage += percentage;
      return data;
    });
  }, [assets, totalValue]);

  // SVG Donut Config
  const radius = 70;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius; // ≈ 439.82

  const activeAsset = useMemo(() => {
    return chartData.find((a) => a.assetId === activeAssetId) || null;
  }, [chartData, activeAssetId]);

  return (
    <Card hover={false} className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Alocação de Ativos RWA</h3>
          <p className="text-xs text-gray-500">Distribuição patrimonial em commodities</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-agro-azul-escuro/10 text-agro-azul-escuro rounded-full">
          {assets.length} ativos
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-gray-400">
          Nenhum ativo sob custódia para exibir
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center my-auto py-2">
          {/* Gráfico Donut SVG */}
          <div className="relative flex items-center justify-center">
            <svg
              className="w-56 h-56 transform -rotate-90"
              viewBox="0 0 200 200"
              aria-label="Gráfico de alocação de portfólio"
            >
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke="#E5E7EB"
                strokeWidth={strokeWidth}
              />

              {/* Slices */}
              {chartData.map((item) => {
                const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((item.startPercentage / 100) * circumference);
                const isSelected = activeAssetId === item.assetId;

                return (
                  <circle
                    key={item.assetId}
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth={isSelected ? strokeWidth + 5 : strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-200 cursor-pointer hover:opacity-90"
                    style={{
                      transformOrigin: '50% 50%',
                    }}
                    onMouseEnter={() => setActiveAssetId(item.assetId)}
                    onMouseLeave={() => setActiveAssetId(null)}
                    onClick={() =>
                      setActiveAssetId(activeAssetId === item.assetId ? null : item.assetId)
                    }
                  />
                );
              })}
            </svg>

            {/* Informação Central */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
              {activeAsset ? (
                <div className="animate-fadeIn">
                  <span
                    className="inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-white mb-1"
                    style={{ backgroundColor: activeAsset.color }}
                  >
                    {activeAsset.tokenSymbol}
                  </span>
                  <p className="text-base font-extrabold text-gray-900 leading-tight">
                    {formatCurrency(activeAsset.totalValue)}
                  </p>
                  <p className="text-xs font-semibold text-gray-500 mt-0.5">
                    {activeAsset.percentage}% da carteira
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    Total Custódia
                  </p>
                  <p className="text-lg font-black text-gray-900 leading-tight mt-0.5">
                    {formatCurrency(totalValue)}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Passe o mouse na fatia</p>
                </div>
              )}
            </div>
          </div>

          {/* Legenda Lateral */}
          <div className="space-y-2.5">
            {chartData.map((item) => {
              const isSelected = activeAssetId === item.assetId;
              return (
                <div
                  key={item.assetId}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-gray-50 border-gray-300 shadow-xs'
                      : 'border-transparent hover:bg-gray-50/70'
                  }`}
                  onMouseEnter={() => setActiveAssetId(item.assetId)}
                  onMouseLeave={() => setActiveAssetId(null)}
                  onClick={() =>
                    setActiveAssetId(activeAssetId === item.assetId ? null : item.assetId)
                  }
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {item.tokenSymbol}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">{item.assetName}</p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="text-xs font-semibold text-gray-900">
                      {item.percentage}%
                    </span>
                    <p className="text-[10px] text-gray-500">{formatCurrency(item.totalValue)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
