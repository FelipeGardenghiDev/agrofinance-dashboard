'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAgroFinanceStore } from '@/lib/store';
import { formatRelativeDate } from '@/lib/utils';
import type { NotificationType } from '@/lib/types';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD' | 'RWA'>('ALL');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const notifications = useAgroFinanceStore((state) => state.notifications || []);
  const markNotificationAsRead = useAgroFinanceStore((state) => state.markNotificationAsRead);
  const markAllNotificationsAsRead = useAgroFinanceStore((state) => state.markAllNotificationsAsRead);
  const deleteNotification = useAgroFinanceStore((state) => state.deleteNotification);
  const clearAllNotifications = useAgroFinanceStore((state) => state.clearAllNotifications);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Fechamento ao clicar fora ou apertar Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Filtragem de notificações
  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'UNREAD') {
      return notifications.filter((n) => !n.read);
    }
    if (activeFilter === 'RWA') {
      return notifications.filter((n) => n.type === 'rwa_price' || n.type === 'redemption');
    }
    return notifications;
  }, [notifications, activeFilter]);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'rwa_price':
        return {
          icon: '📈',
          bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        };
      case 'redemption':
        return {
          icon: '🚜',
          bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
        };
      case 'kyc':
        return {
          icon: '🛡️',
          bg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
        };
      case 'operation':
        return {
          icon: '⚡',
          bg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
        };
      case 'system':
      default:
        return {
          icon: '🔔',
          bg: 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30',
        };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão Gatilho do Sino */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg border border-white/20 text-gray-200 hover:text-white hover:bg-white/10 hover:border-white/40 active:scale-95 transition-all cursor-pointer shadow-xs"
        title="Central de Notificações & Alertas"
        aria-label="Notificações e Alertas"
        aria-expanded={isOpen}
      >
        <svg
          className="w-4 h-4 text-gray-200 hover:text-white transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Badge de Não Lidas */}
        {unreadCount > 0 && (
          <span
            data-testid="unread-badge"
            className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-sm animate-pulse"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de Notificações */}
      {isOpen && (
        <div
          data-testid="notifications-dropdown"
          className="absolute right-0 mt-2 w-84 sm:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden animate-fadeIn text-left"
        >
          {/* Cabeçalho */}
          <div className="px-4 py-3.5 bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🔔</span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Alertas & Notificações
              </h3>
              {unreadCount > 0 && (
                <span className="bg-agro-azul-escuro/10 dark:bg-blue-500/20 text-agro-azul-escuro dark:text-blue-300 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsAsRead}
                  className="text-[11px] font-medium text-agro-azul-escuro dark:text-blue-400 hover:underline cursor-pointer px-1.5 py-0.5 rounded"
                  title="Marcar todas como lidas"
                >
                  Ler todas
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllNotifications}
                  className="text-[11px] font-medium text-gray-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer px-1.5 py-0.5 rounded transition-colors"
                  title="Limpar todas as notificações"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Abas de Filtro */}
          <div className="px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800/80 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                activeFilter === 'ALL'
                  ? 'bg-agro-azul-escuro text-white dark:bg-blue-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('UNREAD')}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                activeFilter === 'UNREAD'
                  ? 'bg-agro-azul-escuro text-white dark:bg-blue-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Não lidas ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('RWA')}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                activeFilter === 'RWA'
                  ? 'bg-agro-azul-escuro text-white dark:bg-blue-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              🌾 RWA & Grãos
            </button>
          </div>

          {/* Lista de Notificações com Scroll */}
          <div className="max-h-80 sm:max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60">
            {filteredNotifications.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <span className="text-3xl block mb-2">✨</span>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  Nenhuma notificação encontrada
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {activeFilter === 'UNREAD'
                    ? 'Você leu todas as notificações recentes.'
                    : 'Todas as suas operações e alertas estão em dia.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const style = getNotificationIcon(notif.type);
                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 transition-colors relative group ${
                      !notif.read
                        ? 'bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50/80 dark:hover:bg-blue-950/30'
                        : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Ícone com badge estilizada */}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 border ${style.bg}`}
                      >
                        <span>{style.icon}</span>
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate flex items-center gap-1.5">
                            {!notif.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 inline-block" />
                            )}
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0 whitespace-nowrap">
                            {formatRelativeDate(notif.timestamp)}
                          </span>
                        </div>

                        <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed break-words">
                          {notif.message}
                        </p>

                        {/* Ações da Notificação */}
                        <div className="mt-2 flex items-center justify-between">
                          {notif.actionUrl ? (
                            <Link
                              href={notif.actionUrl}
                              onClick={() => {
                                markNotificationAsRead(notif.id);
                                setIsOpen(false);
                              }}
                              className="text-[11px] font-semibold text-agro-verde-musgo hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1 group/link cursor-pointer"
                            >
                              <span>{notif.actionLabel || 'Visualizar'}</span>
                              <span className="group-hover/link:translate-x-0.5 transition-transform">
                                →
                              </span>
                            </Link>
                          ) : (
                            <div />
                          )}

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            {!notif.read && (
                              <button
                                type="button"
                                onClick={() => markNotificationAsRead(notif.id)}
                                title="Marcar como lida"
                                className="text-[10px] text-gray-400 hover:text-agro-azul-escuro dark:hover:text-blue-400 px-1 py-0.5 rounded cursor-pointer transition-colors"
                              >
                                ✓ Marcar lida
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => deleteNotification(notif.id)}
                              title="Remover notificação"
                              className="text-gray-400 hover:text-red-500 p-1 rounded cursor-pointer transition-colors"
                              aria-label="Excluir notificação"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Rodapé Informativo */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 text-center">
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              Sistema de Alertas e Liquidações RWA AgroFinance
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
