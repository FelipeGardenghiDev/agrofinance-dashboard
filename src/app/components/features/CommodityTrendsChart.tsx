'use client';

import { useState, useMemo } from 'react';
import Card from '../ui/Card';
import { formatCurrency } from '@/lib/utils';

interface HistoricalPoint {
  month: string;
  value: number;
}

interface CommoditySeries {
  id: string;
  label: string;
  tokenSymbol: string;
  unit: string;
  color: string;
  data: HistoricalPoint[];
}

const HISTORICAL_SERIES: Record<string, CommoditySeries> = {
  ALL: {
    id: 'ALL',
    label: 'Patrimônio RWA Total',
    tokenSymbol: 'TOTAL',
    unit: 'BRL',
    color: '#085A8C',
    data: [
      { month: 'Out/25', value: 184100 },
      { month: 'Nov/25', value: 189400 },
      { month: 'Dez/25', value: 194850 },
      { month: 'Jan/26', value: 198200 },
      { month: 'Fev/26', value: 202150 },
      { month: 'Mar/26', value: 206225 },
    ],
  },
  SOJA24: {
    id: 'SOJA24',
    label: 'Soja Premium (Safra 25/26)',
    tokenSymbol: 'SOJA24',
    unit: 'R$/token',
    color: '#085A8C',
    data: [
      { month: 'Out/25', value: 43.10 },
      { month: 'Nov/25', value: 44.50 },
      { month: 'Dez/25', value: 46.20 },
      { month: 'Jan/26', value: 45.80 },
      { month: 'Fev/26', value: 47.40 },
      { month: 'Mar/26', value: 48.50 },
    ],
  },
  SOJAO: {
    id: 'SOJAO',
    label: 'Soja Orgânica Exportação',
    tokenSymbol: 'SOJAO',
    unit: 'R$/token',
    color: '#8AA626',
    data: [
      { month: 'Out/25', value: 47.50 },
      { month: 'Nov/25', value: 48.90 },
      { month: 'Dez/25', value: 50.40 },
      { month: 'Jan/26', value: 51.10 },
      { month: 'Fev/26', value: 51.80 },
      { month: 'Mar/26', value: 52.75 },
    ],
  },
  MLHO25: {
    id: 'MLHO25',
    label: 'Milho Híbrido Safra 25',
    tokenSymbol: 'MLHO25',
    unit: 'R$/token',
    color: '#D97706',
    data: [
      { month: 'Out/25', value: 25.80 },
      { month: 'Nov/25', value: 26.40 },
      { month: 'Dez/25', value: 27.10 },
      { month: 'Jan/26', value: 26.90 },
      { month: 'Fev/26', value: 27.80 },
      { month: 'Mar/26', value: 28.30 },
    ],
  },
  MLHOP: {
    id: 'MLHOP',
    label: 'Milho Grão Especial',
    tokenSymbol: 'MLHOP',
    unit: 'R$/token',
    color: '#059669',
    data: [
      { month: 'Out/25', value: 28.50 },
      { month: 'Nov/25', value: 29.20 },
      { month: 'Dez/25', value: 30.00 },
      { month: 'Jan/26', value: 30.50 },
      { month: 'Fev/26', value: 30.90 },
      { month: 'Mar/26', value: 31.20 },
    ],
  },
};

export default function CommodityTrendsChart() {
  const [selectedId, setSelectedId] = useState<string>('ALL');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const currentSeries = HISTORICAL_SERIES[selectedId] || HISTORICAL_SERIES.ALL;
  const points = currentSeries.data;

  // Estatísticas da série selecionada
  const stats = useMemo(() => {
    const values = points.map((p) => p.value);
    const first = values[0] || 0;
    const last = values[values.length - 1] || 0;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const change = first > 0 ? ((last - first) / first) * 100 : 0;
    return { first, last, min, max, change };
  }, [points]);

  // Coordenadas SVG
  const width = 560;
  const height = 220;
  const paddingX = 45;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartCoordinates = useMemo(() => {
    const chartW = width - paddingX * 2;
    const chartH = height - paddingTop - paddingBottom;
    const minVal = stats.min * 0.96;
    const maxVal = stats.max * 1.04;
    const valRange = maxVal - minVal || 1;

    return points.map((p, idx) => {
      const x = paddingX + (idx / (points.length - 1)) * chartW;
      const y = paddingTop + chartH - ((p.value - minVal) / valRange) * chartH;
      return { ...p, x, y };
    });
  }, [points, stats, width, height, paddingX, paddingTop, paddingBottom]);

  // Caminho da linha (Polyline/Smooth)
  const linePath = useMemo(() => {
    if (chartCoordinates.length === 0) return '';
    return chartCoordinates.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
    }, '');
  }, [chartCoordinates]);

  // Caminho da área fechada para gradiente
  const areaPath = useMemo(() => {
    if (chartCoordinates.length === 0) return '';
    const bottomY = height - paddingBottom;
    const first = chartCoordinates[0];
    const last = chartCoordinates[chartCoordinates.length - 1];
    return `${linePath} L ${last.x},${bottomY} L ${first.x},${bottomY} Z`;
  }, [linePath, chartCoordinates, height, paddingBottom]);

  const activePoint =
    hoveredPointIndex !== null && chartCoordinates[hoveredPointIndex]
      ? chartCoordinates[hoveredPointIndex]
      : chartCoordinates[chartCoordinates.length - 1];

  return (
    <Card hover={false} className="h-full flex flex-col justify-between">
      {/* Top Header & Seletor de Ativos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Evolução & Cotações Históricas</h3>
          <p className="text-xs text-gray-500">
            Desempenho nos últimos 6 meses com liquidação tokenizada
          </p>
        </div>

        {/* Tabs de Ativos */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {Object.values(HISTORICAL_SERIES).map((s) => {
            const isActive = selectedId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSelectedId(s.id);
                  setHoveredPointIndex(null);
                }}
                className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-agro-azul-escuro text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s.tokenSymbol}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mini KPIs da série */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/80 p-3 rounded-lg border border-gray-100 mb-4">
        <div>
          <p className="text-[11px] text-gray-500 font-medium">Cotação / Valor Atual</p>
          <p className="text-sm sm:text-base font-extrabold text-gray-900 mt-0.5">
            {formatCurrency(stats.last)}
          </p>
        </div>

        <div>
          <p className="text-[11px] text-gray-500 font-medium">Variação no Semestre</p>
          <p
            className={`text-sm sm:text-base font-extrabold mt-0.5 ${
              stats.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {stats.change >= 0 ? '+' : ''}
            {stats.change.toFixed(2)}%
          </p>
        </div>

        <div>
          <p className="text-[11px] text-gray-500 font-medium">Mínima (6M)</p>
          <p className="text-sm sm:text-base font-semibold text-gray-700 mt-0.5">
            {formatCurrency(stats.min)}
          </p>
        </div>

        <div>
          <p className="text-[11px] text-gray-500 font-medium">Máxima (6M)</p>
          <p className="text-sm sm:text-base font-semibold text-gray-700 mt-0.5">
            {formatCurrency(stats.max)}
          </p>
        </div>
      </div>

      {/* Gráfico SVG de Área / Linha */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 select-none"
          aria-label={`Gráfico de evolução para ${currentSeries.label}`}
        >
          <defs>
            <linearGradient id={`gradient-${currentSeries.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={currentSeries.color} stopOpacity="0.32" />
              <stop offset="100%" stopColor={currentSeries.color} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines horizontais */}
          {[0.2, 0.5, 0.8].map((ratio) => {
            const y = paddingTop + (height - paddingTop - paddingBottom) * ratio;
            return (
              <line
                key={ratio}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#E5E7EB"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Área preenchida com gradiente */}
          <path d={areaPath} fill={`url(#gradient-${currentSeries.id})`} />

          {/* Linha da cotação */}
          <path
            d={linePath}
            fill="none"
            stroke={currentSeries.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Linha vertical tracejada do ponto ativo */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={paddingTop}
              x2={activePoint.x}
              y2={height - paddingBottom}
              stroke={currentSeries.color}
              strokeDasharray="3 3"
              strokeWidth="1.5"
              opacity="0.6"
            />
          )}

          {/* Pontos de dados clicáveis / com hover */}
          {chartCoordinates.map((pt, idx) => {
            const isHovered = hoveredPointIndex === idx;
            return (
              <g key={pt.month} className="cursor-pointer">
                {/* Hitbox maior para facilitar interação no mouse */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="14"
                  fill="transparent"
                  onMouseEnter={() => setHoveredPointIndex(idx)}
                />
                {/* Ponto visível */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill="#FFFFFF"
                  stroke={currentSeries.color}
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-150"
                  pointerEvents="none"
                />
                {/* Rótulo do Eixo X (Mês) */}
                <text
                  x={pt.x}
                  y={height - 12}
                  textAnchor="middle"
                  className={`text-[11px] font-medium transition-colors ${
                    isHovered ? 'fill-gray-900 font-bold' : 'fill-gray-400'
                  }`}
                >
                  {pt.month}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip Flutuante Interativo */}
        {activePoint && (
          <div
            className="absolute top-2 bg-gray-900/95 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg pointer-events-none transition-all transform -translate-x-1/2 flex items-center gap-2 border border-gray-700"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
            }}
          >
            <span className="font-semibold text-gray-300">{activePoint.month}:</span>
            <span className="font-extrabold text-white">{formatCurrency(activePoint.value)}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
