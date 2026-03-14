'use client';

import { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { mockAccount, mockPortfolio, mockKYC, mockTransactions, simulateApiDelay } from '@/lib/mockData';
import { formatCurrency, formatPerformance, getPerformanceColor, getKYCStatusColor, translateStatus, formatRelativeDate } from '@/lib/utils';
import type { Account, Portfolio, KYC, Transaction } from '@/lib/types';
import Link from 'next/link';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<Account | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [kyc, setKyc] = useState<KYC | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await simulateApiDelay(800); // Simula chamada de API
      
      setAccount(mockAccount);
      setPortfolio(mockPortfolio);
      setKyc(mockKYC);
      setRecentTransactions(mockTransactions.slice(0, 5));
      
      setLoading(false);
    };

    loadData();
  }, []);

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
          <h1 className="text-3xl font-bold text-gray-900">
            Olá, {account?.ownerName.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 mt-1">Bem-vindo(a) ao seu dashboard de investimentos RWA</p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Saldo Disponível */}
          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Saldo Disponível</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(account?.availableBalance || 0)}
                </h3>
                <p className="text-xs text-gray-500 mt-2">Conta: {account?.accountId}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </Card>

          {/* Portfolio RWA */}
          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Portfolio RWA</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(portfolio?.totalValue || 0)}
                </h3>
                <p className="text-xs text-gray-500 mt-2">{portfolio?.assets.length} ativos</p>
              </div>
              <div className="w-12 h-12 bg-agro-azul-claro rounded-full flex items-center justify-center">
                <span className="text-2xl">🌾</span>
              </div>
            </div>
          </Card>

          {/* Status KYC */}
          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Status KYC</p>
                <div className="mt-3">
                  <Badge variant={kyc?.status === 'approved' ? 'success' : 'warning'}>
                    {translateStatus(kyc?.status || 'pending')}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Documentos: {kyc?.documents.cpf && kyc?.documents.proofOfAddress && kyc?.documents.selfie ? 'Completos' : 'Pendentes'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Ativos RWA */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Seus Ativos RWA</h2>
          </div>
          
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ativo</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Token</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Quantidade</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Preço</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Valor Total</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">24h</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio?.assets.map((asset) => (
                    <tr key={asset.assetId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{asset.assetName}</p>
                          <p className="text-xs text-gray-500">{asset.assetType}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="default">{asset.tokenSymbol}</Badge>
                      </td>
                      <td className="py-4 px-4 text-right text-gray-900">{asset.quantity.toLocaleString('pt-BR')}</td>
                      <td className="py-4 px-4 text-right text-gray-900">{formatCurrency(asset.pricePerToken)}</td>
                      <td className="py-4 px-4 text-right font-semibold text-gray-900">{formatCurrency(asset.totalValue)}</td>
                      <td className="py-4 px-4 text-right">
                        <span className={getPerformanceColor(asset.performance24h)}>
                          {formatPerformance(asset.performance24h)}
                        </span>
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
            <h2 className="text-2xl font-bold text-gray-900">Transações Recentes</h2>
            <Link 
              href="/transactions" 
              className="text-sm text-agro-azul-claro hover:text-agro-azul-escuro hover:cursor-pointer transition-colors font-medium"
            >
              Ver todas →
            </Link>
          </div>
          
          <Card>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'IN' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <span className="text-xl">
                        {transaction.type === 'IN' ? '↓' : '↑'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{formatRelativeDate(transaction.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'IN' ? 'text-green-600' : 'text-red-600'
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