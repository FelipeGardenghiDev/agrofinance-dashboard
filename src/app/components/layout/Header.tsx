'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-agro-azul-escuro border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="bg-agro-branco w-10 h-10 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🌾</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">FeeAgroBank</h1>
              <p className="text-xs text-gray-100">RWA Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/transactions">Transações</NavLink>
            <NavLink href="/new-operation">Nova Operação</NavLink>
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-100">João Silva</p>
              <p className="text-xs text-gray-200">Conta Premium</p>
            </div>
            <div className="w-10 h-10 bg-agro-verde-musgo rounded-full flex items-center justify-center text-white font-semibold">
              JS
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="white"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="px-4 py-4 space-y-2">
            <MobileNavLink href="/dashboard">Dashboard</MobileNavLink>
            <MobileNavLink href="/transactions">Transações</MobileNavLink>
            <MobileNavLink href="/new-operation">Nova Operação</MobileNavLink>
          </nav>
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-agro-verde-musgo rounded-full flex items-center justify-center text-white font-semibold">
                JS
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">João Silva</p>
                <p className="text-xs text-gray-500">Conta Premium</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

// Desktop Nav Link Component
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-lg text-sm font-bold text-gray-700 hover:bg-agro-azul-claro text-white transition-colors"
    >
      {children}
    </Link>
  );
};

// Mobile Nav Link Component
const MobileNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <Link
      href={href}
      className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors"
    >
      {children}
    </Link>
  );
};

export default Header;