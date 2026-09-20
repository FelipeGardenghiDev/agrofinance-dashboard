'use client';

import { useEffect } from 'react';
import { useAgroFinanceStore } from '@/lib/store';

export default function OfflineFieldModeBanner() {
  const isOfflineFieldMode = useAgroFinanceStore((state) => state.isOfflineFieldMode);
  const setOfflineFieldMode = useAgroFinanceStore((state) => state.setOfflineFieldMode);
  const toggleSimulateOfflineMode = useAgroFinanceStore((state) => state.toggleSimulateOfflineMode);
  const addToast = useAgroFinanceStore((state) => state.addToast);

  // Escuta eventos reais do navegador de queda e retorno de sinal (ex: no campo)
  useEffect(() => {
    const handleOnline = () => {
      setOfflineFieldMode(false);
      addToast({
        type: 'success',
        title: 'Conexão Restabelecida!',
        message: 'Modo Campo finalizado. Sincronização com o servidor concluída.',
        duration: 3500,
      });
    };

    const handleOffline = () => {
      setOfflineFieldMode(true);
    };

    if (typeof window !== 'undefined' && !navigator.onLine) {
      setOfflineFieldMode(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOfflineFieldMode, addToast]);

  if (!isOfflineFieldMode) return null;

  return (
    <div
      role="status"
      data-testid="offline-field-mode-banner"
      aria-live="polite"
      className="bg-linear-to-r from-amber-600 via-amber-700 to-amber-800 text-white text-xs py-2 px-4 shadow-md sticky top-16 z-40 border-b border-amber-500/30"
    >
      <div className="w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-200 animate-ping inline-block" />
          <span className="font-black tracking-wider uppercase bg-amber-900/60 px-2 py-0.5 rounded text-[10px] border border-amber-400/40">
            🌾 Modo Campo Ativo (Offline)
          </span>
          <p className="font-medium text-amber-50 text-[11px] sm:text-xs">
            Sem conexão com a internet. Os saldos, custódia RWA e contratos continuam disponíveis via cache local.
          </p>
        </div>

        <button
          type="button"
          onClick={toggleSimulateOfflineMode}
          title="Simular retorno da conexão com a internet"
          className="text-[11px] font-bold px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white active:scale-95 transition-all border border-white/30 cursor-pointer shrink-0"
        >
          🔄 Simular Reconexão
        </button>
      </div>
    </div>
  );
}
