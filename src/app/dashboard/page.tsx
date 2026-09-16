'use client';

import { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { useAgroFinanceStore } from '@/lib/store';
import { formatCurrency, formatPerformance, getPerformanceColor, translateStatus, formatRelativeDate } from '@/lib/utils';
import Link from 'next/link';
import PortfolioAllocationChart from '../components/features/PortfolioAllocationChart';
import CommodityTrendsChart from '../components/features/CommodityTrendsChart';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const account = useAgroFinanceStore((state) => state.account);
  const portfolio = useAgroFinanceStore((state) => state.portfolio);
  const kyc = useAgroFinanceStore((state) => state.kyc);
  const transactions = useAgroFinanceStore((state) => state.transactions);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const recentTransactions = transactions.slice(0, 5);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Olá, {account?.ownerName.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Bem-vindo(a) ao seu dashboard de investimentos RWA</p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Saldo Disponível */}
          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Saldo Disponível</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {formatCurrency(account?.availableBalance || 0)}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Conta: {account?.accountId}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </Card>

          {/* Portfolio RWA */}
          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Portfolio RWA</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {formatCurrency(portfolio?.totalValue || 0)}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{portfolio?.assets.length} ativos</p>
              </div>
              <div className="w-12 h-12 bg-agro-azul-claro/20 dark:bg-agro-azul-claro/30 rounded-full flex items-center justify-center">
                <span className="text-2xl">🌾</span>
              </div>
            </div>
          </Card>

          {/* Status KYC */}
          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Status KYC</p>
                <div className="mt-3">
                  <Badge variant={kyc?.status === 'approved' ? 'success' : 'warning'}>
                    {translateStatus(kyc?.status || 'pending')}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Documentos: {kyc?.documents.cpf && kyc?.documents.proofOfAddress && kyc?.documents.selfie ? 'Completos' : 'Pendentes'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Inteligência de Mercado & Performance RWA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5">
            <PortfolioAllocationChart
              assets={portfolio?.assets || []}
              totalValue={portfolio?.totalValue || 0}
            />
          </div>
          <div className="lg:col-span-7">
            <CommodityTrendsChart />
          </div>
        </div>

        {/* Ativos RWA */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Seus Ativos RWA</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Custódia digital de commodities agrícolas</p>
            </div>
            <Link
              href="/new-operation"
              className="text-xs font-semibold px-3 py-1.5 bg-agro-azul-escuro text-white rounded-lg hover:bg-agro-azul transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>+</span> Novo Aporte
            </Link>
          </div>
          
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Ativo</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Token</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Quantidade</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Preço</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Valor Total</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">24h</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio?.assets.map((asset) => (
                    <tr key={asset.assetId} className="border-b border-gray-100 dark:border-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{asset.assetName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{asset.assetType}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="default">{asset.tokenSymbol}</Badge>
                      </td>
                      <td className="py-4 px-4 text-right text-gray-900 dark:text-gray-100">{asset.quantity.toLocaleString('pt-BR')}</td>
                      <td className="py-4 px-4 text-right text-gray-900 dark:text-gray-100">{formatCurrency(asset.pricePerToken)}</td>
                      <td className="py-4 px-4 text-right font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(asset.totalValue)}</td>
                      <td className="py-4 px-4 text-right">
                        <span className={getPerformanceColor(asset.performance24h)}>
                          {formatPerformance(asset.performance24h)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Link
                          href={`/new-operation?asset=${asset.assetId}`}
                          className="inline-flex items-center text-xs font-semibold px-2.5 py-1 bg-agro-azul-escuro text-white rounded hover:bg-agro-azul transition-colors cursor-pointer"
                        >
                          Aportar +
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Transações Recentes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transações Recentes</h2>
            <Link 
              href="/transactions" 
              className="text-sm text-agro-azul-claro hover:text-agro-azul dark:text-blue-400 dark:hover:text-blue-300 hover:cursor-pointer transition-colors font-medium"
            >
              Ver todas →
            </Link>
          </div>
          
          <Card>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800/80 last:border-0"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'IN' ? 'bg-green-100 dark:bg-green-950/60' : 'bg-red-100 dark:bg-red-950/60'
                    }`}>
                      <span className="text-xl">
                        {transaction.type === 'IN' ? '↓' : '↑'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{transaction.description}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatRelativeDate(transaction.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'IN' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'IN' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <Badge variant={transaction.status === 'completed' ? 'success' : 'warning'}>
                      {translateStatus(transaction.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}