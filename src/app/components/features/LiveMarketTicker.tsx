'use client';

import { useEffect, useState } from 'react';
import { useAgroFinanceStore } from '@/lib/store';
import { formatNumber } from '@/lib/utils';

export default function LiveMarketTicker() {
  const marketQuotes = useAgroFinanceStore((state) => state.marketQuotes || []);
  const isLiveMarketActive = useAgroFinanceStore((state) => state.isLiveMarketActive);
  const toggleLiveMarket = useAgroFinanceStore((state) => state.toggleLiveMarket);
  const applyMarketTick = useAgroFinanceStore((state) => state.applyMarketTick);
  const addToast = useAgroFinanceStore((state) => state.addToast);

  const [flashing, setFlashing] = useState(false);

  // Intervalo de mercado ao vivo (a cada 7 segundos)
  useEffect(() => {
    if (!isLiveMarketActive) return;

    const interval = setInterval(() => {
      applyMarketTick();
      setFlashing(true);
      setTimeout(() => setFlashing(false), 1200);
    }, 7000);

    return () => clearInterval(interval);
  }, [isLiveMarketActive, applyMarketTick]);

  const handleManualTick = () => {
    applyMarketTick();
    setFlashing(true);
    setTimeout(() => setFlashing(false), 1200);
    addToast({
      type: 'info',
      title: 'Tick de Mercado Disparado!',
      message: 'Cotações B3/CBOT e custódia RWA atualizadas com a oscilação a mercado.',
      duration: 3000,
    });
  };

  return (
    <div
      role="region"
      aria-label="Cotações de mercado ao vivo B3 e CBOT"
      className="bg-slate-900 border-b border-slate-800 text-slate-200 text-xs py-2 px-3 sm:px-6 select-none shadow-inner"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        {/* Lado Esquerdo: Badge AO VIVO + Itens de Cotação */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-0.5">
          {/* Badge Ao Vivo */}
          <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700">
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveMarketActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
              {isLiveMarketActive ? 'AO VIVO' : 'PAUSADO'}
            </span>
            <span className="text-[10px] text-slate-500 hidden md:inline">| B3 & CBOT</span>
          </div>

          {/* Lista de Cotações com Ticks */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0" aria-live="polite">
            {marketQuotes.map((quote) => {
              const isPositive = quote.change24h >= 0;
              const tickClass = flashing
                ? quote.lastDirection === 'up'
                  ? 'flash-up ring-1 ring-emerald-500/50'
                  : quote.lastDirection === 'down'
                  ? 'flash-down ring-1 ring-rose-500/50'
                  : ''
                : '';

              return (
                <div
                  key={quote.symbol}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/40 border border-slate-800 transition-all duration-300 ${tickClass}`}
                >
                  <span className="font-bold text-slate-100 text-[11px] tracking-tight">
                    {quote.symbol}
                  </span>

                  <span className="font-mono font-bold text-slate-200 text-xs">
                    {quote.symbol === 'USD/BRL'
                      ? `R$ ${quote.price.toFixed(4)}`
                      : quote.unit === '¢/bu'
                      ? `${quote.price.toFixed(2)}¢`
                      : `R$ ${quote.price.toFixed(2)}`}
                  </span>

                  <span
                    className={`text-[10px] font-bold flex items-center gap-0.5 ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    <span>{isPositive ? '▲' : '▼'}</span>
                    <span>
                      {isPositive ? '+' : ''}
                      {formatNumber(quote.change24h, 2)}%
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lado Direito: Controles Interativos (Pausar / Tick Manual) */}
        <div className="flex items-center justify-end gap-2 shrink-0 text-[11px]">
          {/* Botão de Forçar Tick */}
          <button
            type="button"
            onClick={handleManualTick}
            title="Simular flutuação imediata das cotações e recalcular patrimônio RWA"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 active:scale-95 transition-all cursor-pointer font-medium"
          >
            <span>⚡</span>
            <span className="hidden sm:inline">Simular Tick</span>
          </button>

          {/* Alternador Pausar/Retomar */}
          <button
            type="button"
            onClick={toggleLiveMarket}
            title={isLiveMarketActive ? 'Pausar cotações em tempo real' : 'Retomar cotações em tempo real'}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
              isLiveMarketActive
                ? 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                : 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50'
            }`}
          >
            <span>{isLiveMarketActive ? '⏸️' : '▶️'}</span>
            <span className="hidden sm:inline">
              {isLiveMarketActive ? 'Pausar' : 'Retomar'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
