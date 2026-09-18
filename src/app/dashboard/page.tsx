'use client';

import { useEffect, useState, useMemo } from 'react';
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
  const cprContracts = useAgroFinanceStore((state) => state.cprContracts || []);
  const hedgeContracts = useAgroFinanceStore((state) => state.hedgeContracts || []);

  const activeCPRs = useMemo(() => {
    return cprContracts.filter((c) => c.status === 'active');
  }, [cprContracts]);

  const totalCPRAmount = useMemo(() => {
    return activeCPRs.reduce((sum, c) => sum + c.amount, 0);
  }, [activeCPRs]);

  const totalCPRLockedSacas = useMemo(() => {
    return activeCPRs.reduce((sum, c) => sum + c.collateralQuantity, 0);
  }, [activeCPRs]);

  const activeHedgeContracts = useMemo(() => {
    return hedgeContracts.filter((c) => c.status === 'active');
  }, [hedgeContracts]);

  const totalProtectedSacas = useMemo(() => {
    return activeHedgeContracts.reduce((sum, c) => sum + c.quantitySacas, 0);
  }, [activeHedgeContracts]);

  const totalProtectedHedgeValue = useMemo(() => {
    return activeHedgeContracts.reduce((sum, c) => sum + c.totalProtectedValue, 0);
  }, [activeHedgeContracts]);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Saldo Disponível */}
          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Saldo Disponível</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {formatCurrency(account?.availableBalance || 0)}
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">Conta: {account?.accountId}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
            </div>
          </Card>

          {/* Portfolio RWA */}
          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Custódia RWA</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {formatCurrency(portfolio?.totalValue || 0)}
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">{portfolio?.assets.length} commodities ativas</p>
              </div>
              <div className="w-10 h-10 bg-agro-azul-claro/20 dark:bg-agro-azul-claro/30 rounded-xl flex items-center justify-center">
                <span className="text-xl">🌾</span>
              </div>
            </div>
          </Card>

          {/* Crédito & CPR */}
          <Link href="/credit" className="block group">
            <Card hover className="h-full border-l-4 border-l-agro-azul-escuro dark:border-l-blue-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1">
                    Crédito Rural CPR
                    <span className="text-[10px] text-agro-azul-escuro dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">→</span>
                  </p>
                  <h3 className="text-2xl font-bold text-agro-azul-escuro dark:text-blue-400 mt-1">
                    {totalCPRAmount > 0 ? formatCurrency(totalCPRAmount) : 'Disponível'}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">
                    {totalCPRLockedSacas > 0 ? `${totalCPRLockedSacas} sacas em garantia` : 'Simular empréstimo'}
                  </p>
                </div>
                <div className="w-10 h-10 bg-agro-azul-escuro/10 dark:bg-blue-500/20 rounded-xl flex items-center justify-center text-agro-azul-escuro dark:text-blue-300">
                  <span className="text-xl">📜</span>
                </div>
              </div>
            </Card>
          </Link>

          {/* Status KYC */}
          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Compliance & KYC</p>
                <div className="mt-2">
                  <Badge variant={kyc?.status === 'approved' ? 'success' : 'warning'}>
                    {translateStatus(kyc?.status || 'pending')}
                  </Badge>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
                  {kyc?.documents.cpf && kyc?.documents.proofOfAddress && kyc?.documents.selfie ? 'Produtor Verificado' : 'Docs Pendentes'}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Banner de Risco & Hedge B3 */}
        <div className="bg-linear-to-r from-agro-azul-escuro via-agro-verde-escuro to-agro-azul-escuro rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl shrink-0">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Proteção de Preço de Safra (Hedge B3 / CBOT)
                </h2>
                <span className="text-[10px] uppercase font-black tracking-wider bg-amber-400 text-gray-900 px-1.5 py-0.5 rounded">
                  NOVO
                </span>
              </div>
              <p className="text-xs text-gray-200 mt-0.5">
                {activeHedgeContracts.length > 0
                  ? `${totalProtectedSacas.toLocaleString('pt-BR')} sacas protegidas em ${activeHedgeContracts.length} contratos B3 (${formatCurrency(totalProtectedHedgeValue)} assegurados).`
                  : 'Proteja sua receita agrícola contra a oscilação das cotações em Chicago e do Dólar PTAX.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/hedge"
              className="text-xs font-bold px-4 py-2.5 rounded-xl bg-white text-agro-verde-escuro hover:bg-gray-100 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>Gerenciar Travas B3</span>
              <span>→</span>
            </Link>
          </div>
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Custódia de Commodities RWA</h2>
            <Link
              href="/new-operation"
              className="text-sm font-semibold text-agro-verde-musgo hover:underline cursor-pointer"
            >
              Comprar mais sacas →
            </Link>
          </div>
          
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60">
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
                      <td className="py-4 px-4 text-right text-gray-900 dark:text-gray-100">
                        <div>
                          <p className="font-medium">{asset.quantity.toLocaleString('pt-BR')}</p>
                          {Boolean(asset.lockedQuantity && asset.lockedQuantity > 0) && (
                            <span className="inline-block text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-500/20">
                              🔒 {asset.lockedQuantity} em CPR
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right text-gray-900 dark:text-gray-100">{formatCurrency(asset.pricePerToken)}</td>
                      <td className="py-4 px-4 text-right font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(asset.totalValue)}</td>
                      <td className="py-4 px-4 text-right">
                        <span className={getPerformanceColor(asset.performance24h)}>
                          {formatPerformance(asset.performance24h)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/new-operation?type=investment_rwa&asset=${asset.assetId}`}
                            title="Aportar mais tokens"
                            className="inline-flex items-center text-xs font-semibold px-2 py-1 bg-agro-azul-escuro text-white rounded-md hover:bg-agro-azul active:scale-95 transition-all cursor-pointer shadow-xs"
                          >
                            + Aportar
                          </Link>
                          <Link
                            href={`/new-operation?type=sell_rwa&asset=${asset.assetId}`}
                            title="Vender tokens e creditar em saldo"
                            className="inline-flex items-center text-xs font-semibold px-2 py-1 bg-green-700 hover:bg-green-800 text-white rounded-md active:scale-95 transition-all cursor-pointer shadow-xs"
                          >
                            Vender
                          </Link>
                          <Link
                            href={`/new-operation?type=redeem_rwa&asset=${asset.assetId}`}
                            title="Resgatar sacas físicas em armazém credenciado"
                            className="inline-flex items-center text-xs font-semibold px-2 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-md active:scale-95 transition-all cursor-pointer shadow-xs"
                          >
                            Resgatar
                          </Link>
                        </div>
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