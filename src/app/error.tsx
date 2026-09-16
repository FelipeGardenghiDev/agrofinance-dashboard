'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro para observabilidade / telemetria
    console.error('AgroFinance Error Boundary caught an exception:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center p-8 rounded-3xl bg-white dark:bg-gray-900 border border-red-200 dark:border-red-950/50 shadow-2xl space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center text-3xl shadow-inner">
          ⚠️
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Ocorreu uma instabilidade no AgroFinance
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Não se preocupe: seus dados e saldos sob custódia permanecem preservados de forma segura.
          </p>
          {error.message && (
            <div className="p-3 mt-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-[11px] text-gray-500 dark:text-gray-400 font-mono text-left break-words max-h-24 overflow-y-auto">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2.5 rounded-xl bg-agro-azul-escuro text-white text-xs font-semibold hover:bg-agro-azul-claro transition-all cursor-pointer shadow-sm active:scale-95"
          >
            🔄 Tentar Novamente
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
          >
            Ir para o Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
