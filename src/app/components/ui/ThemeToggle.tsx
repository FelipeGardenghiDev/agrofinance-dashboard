'use client';

import { useState, useRef, useEffect } from 'react';
import { useAgroFinanceStore } from '@/lib/store';
import type { ThemeMode } from '@/lib/types';

export default function ThemeToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useAgroFinanceStore((state) => state.theme);
  const setTheme = useAgroFinanceStore((state) => state.setTheme);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const options: { mode: ThemeMode; label: string; icon: string }[] = [
    { mode: 'light', label: 'Claro', icon: '☀️' },
    { mode: 'dark', label: 'Escuro', icon: '🌙' },
    { mode: 'system', label: 'Sistema', icon: '💻' },
  ];

  const currentOption = options.find((o) => o.mode === theme) || options[2];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/20 text-gray-200 hover:text-white hover:bg-white/10 hover:border-white/40 active:scale-95 transition-all text-xs font-medium cursor-pointer shadow-xs"
        title={`Tema: ${currentOption.label}`}
        aria-label="Alternar tema"
        aria-expanded={isOpen}
      >
        <span>{currentOption.icon}</span>
        <span className="hidden sm:inline">{currentOption.label}</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 py-1.5 z-50 animate-fadeIn">
          {options.map((opt) => {
            const isSelected = theme === opt.mode;
            return (
              <button
                key={opt.mode}
                type="button"
                onClick={() => {
                  setTheme(opt.mode);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-agro-azul-escuro/10 dark:bg-agro-azul-escuro/40 text-agro-azul-escuro dark:text-blue-300 font-bold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </div>
                {isSelected && <span className="text-agro-azul-escuro dark:text-blue-400 font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
