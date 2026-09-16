'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAgroFinanceStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import ThemeToggle from '@/app/components/ui/ThemeToggle';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resetFeedback, setResetFeedback] = useState(false);
  const pathname = usePathname();

  const account = useAgroFinanceStore((state) => state.account);
  const resetToDefaultData = useAgroFinanceStore((state) => state.resetToDefaultData);

  const handleReset = () => {
    if (confirm('Deseja restaurar os dados originais da demonstração?')) {
      resetToDefaultData();
      setResetFeedback(true);
      setTimeout(() => setResetFeedback(false), 2000);
    }
  };

  return (
    <header className="bg-agro-azul-escuro border-b border-agro-azul-claro/20 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="bg-white/10 group-hover:bg-white/20 transition-colors w-10 h-10 rounded-xl flex items-center justify-center border border-white/20">
              <span className="text-xl">🌾</span>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                AgroFinance
                <span className="text-[10px] uppercase font-bold tracking-widest bg-agro-verde-musgo/80 text-white px-1.5 py-0.5 rounded">
                  RWA
                </span>
              </h1>
              <p className="text-[11px] text-gray-300">Crédito & Agronegócio Digital</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink href="/dashboard" active={pathname === '/dashboard'}>
              Dashboard
            </NavLink>
            <NavLink href="/transactions" active={pathname === '/transactions'}>
              Transações
            </NavLink>
            <NavLink href="/new-operation" active={pathname === '/new-operation'}>
              Nova Operação
            </NavLink>
          </nav>

          {/* User Menu & Reset Demo Action */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Botão de reset para recrutadores */}
            <button
              onClick={handleReset}
              title="Restaurar dados iniciais da demo"
              className="text-xs px-2.5 py-1.5 rounded-lg border border-white/20 text-gray-200 hover:text-white hover:bg-white/10 hover:border-white/40 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className={resetFeedback ? 'animate-spin inline-block' : 'inline-block'}>🔄</span>
              <span>{resetFeedback ? 'Dados Resetados!' : 'Restaurar Demo'}</span>
            </button>

            <div className="text-right">
              <p className="text-sm font-bold text-white">{account.ownerName.split(' ')[0]}</p>
              <p className="text-xs text-green-300 font-medium">
                {formatCurrency(account.availableBalance)}
              </p>
            </div>
            <div className="w-10 h-10 bg-agro-verde-musgo border border-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {account.ownerName
                .split(' ')
                .slice(0, 2)
                .map((n) => n[0])
                .join('')}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10"
            aria-label="Abrir menu de navegação"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-agro-azul-escuro px-4 py-4 space-y-3">
          <nav className="space-y-1">
            <MobileNavLink
              href="/dashboard"
              active={pathname === '/dashboard'}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </MobileNavLink>
            <MobileNavLink
              href="/transactions"
              active={pathname === '/transactions'}
              onClick={() => setMobileMenuOpen(false)}
            >
              Transações
            </MobileNavLink>
            <MobileNavLink
              href="/new-operation"
              active={pathname === '/new-operation'}
              onClick={() => setMobileMenuOpen(false)}
            >
              Nova Operação
            </MobileNavLink>
          </nav>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{account.ownerName}</p>
              <p className="text-xs text-green-300">{formatCurrency(account.availableBalance)}</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => {
                  handleReset();
                  setMobileMenuOpen(false);
                }}
                className="text-xs px-3 py-1.5 rounded-lg border border-white/30 text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>🔄</span>
                <span>Restaurar Demo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

// Desktop Nav Link Component
const NavLink = ({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) => {
  return (
    <Link
      href={href}
      className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
        active
          ? 'bg-white/15 text-white shadow-inner font-bold'
          : 'text-gray-300 hover:text-white hover:bg-white/10'
      }`}
    >
      {children}
    </Link>
  );
};

// Mobile Nav Link Component
const MobileNavLink = ({
  href,
  active,
  onClick,
  children,
}: {
  href: string;
  active: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-white/20 text-white font-bold' : 'text-gray-200 hover:bg-white/10'
      }`}
    >
      {children}
    </Link>
  );
};

export default Header;