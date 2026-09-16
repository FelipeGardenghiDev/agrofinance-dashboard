'use client';

import { useAgroFinanceStore } from '@/lib/store';
import type { ToastType } from '@/lib/types';

export default function ToastContainer() {
  const toasts = useAgroFinanceStore((state) => state.toasts || []);
  const removeToast = useAgroFinanceStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  const getToastStyle = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          border: 'border-emerald-500/30 dark:border-emerald-500/40',
          bg: 'bg-white dark:bg-gray-900',
          iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
          icon: '✓',
        };
      case 'error':
        return {
          border: 'border-red-500/30 dark:border-red-500/40',
          bg: 'bg-white dark:bg-gray-900',
          iconBg: 'bg-red-500/15 text-red-600 dark:text-red-400',
          icon: '✕',
        };
      case 'warning':
        return {
          border: 'border-amber-500/30 dark:border-amber-500/40',
          bg: 'bg-white dark:bg-gray-900',
          iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
          icon: '⚠️',
        };
      case 'info':
      default:
        return {
          border: 'border-blue-500/30 dark:border-blue-500/40',
          bg: 'bg-white dark:bg-gray-900',
          iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
          icon: 'ℹ️',
        };
    }
  };

  return (
    <div
      data-testid="toast-container"
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const style = getToastStyle(toast.type);
        return (
          <div
            key={toast.id}
            data-testid={`toast-${toast.type}`}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-xl border ${style.border} ${style.bg} transition-all duration-300 animate-fadeIn`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${style.iconBg}`}
            >
              <span>{style.icon}</span>
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <h5 className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                {toast.title}
              </h5>
              {toast.message && (
                <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed break-words">
                  {toast.message}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md transition-colors cursor-pointer shrink-0"
              aria-label="Fechar notificação"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
