'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAgroFinanceStore } from '@/lib/store';
import { formatCurrency, formatDate, calculateCPRSimulation, copyToClipboard } from '@/lib/utils';
import type { CPRContract } from '@/lib/types';

export default function CreditPage() {
  const account = useAgroFinanceStore((state) => state.account);
  const portfolio = useAgroFinanceStore((state) => state.portfolio);
  const cprContracts = useAgroFinanceStore((state) => state.cprContracts || []);
  const requestCPR = useAgroFinanceStore((state) => state.requestCPR);
  const settleCPR = useAgroFinanceStore((state) => state.settleCPR);
  const addToast = useAgroFinanceStore((state) => state.addToast);

  // Formulário do Simulador
  const [requestedAmountStr, setRequestedAmountStr] = useState('25000');
  const [selectedAssetId, setSelectedAssetId] = useState(portfolio.assets[0]?.assetId || '');
  const [termMonths, setTermMonths] = useState<6 | 12 | 24>(12);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settlingId, setSettlingId] = useState<string | null>(null);

  // Ativo selecionado para colateral
  const selectedAsset = useMemo(() => {
    return (
      portfolio.assets.find((a) => a.assetId === selectedAssetId) ||
      portfolio.assets[0]
    );
  }, [portfolio.assets, selectedAssetId]);

  const requestedAmount = useMemo(() => {
    const num = parseFloat(requestedAmountStr.replace(/\D/g, '')) || 0;
    return num;
  }, [requestedAmountStr]);

  // Simulação matemática
  const simulation = useMemo(() => {
    if (!selectedAsset) return null;
    return calculateCPRSimulation(requestedAmount, termMonths, selectedAsset, 11.5, 0.70);
  }, [requestedAmount, termMonths, selectedAsset]);

  // Limite total de crédito baseado no portfólio (LTV 70%)
  const maxCreditLimit = useMemo(() => {
    return Number((portfolio.totalValue * 0.70).toFixed(2));
  }, [portfolio.totalValue]);

  // Sacas atualmente travadas em CPR
  const totalLockedTokens = useMemo(() => {
    return portfolio.assets.reduce((sum, a) => sum + (a.lockedQuantity || 0), 0);
  }, [portfolio.assets]);

  // Contratação de CPR
  const handleContractCPR = async () => {
    if (!simulation || !simulation.isEligible) {
      addToast({
        type: 'error',
        title: 'Garantia Insuficiente',
        message: 'Você não possui sacas livres suficientes desta commodity para cobrir este valor.',
      });
      return;
    }

    setIsSubmitting(true);
    // Simula delay de registro em cartório / B3
    await new Promise((resolve) => setTimeout(resolve, 600));

    const res = requestCPR({
      amount: requestedAmount,
      termMonths,
      assetId: selectedAsset.assetId,
    });

    setIsSubmitting(false);

    if (!res.success) {
      addToast({
        type: 'error',
        title: 'Erro na Contratação',
        message: res.error || 'Não foi possível aprovar a CPR.',
      });
    }
  };

  // Quitação de CPR
  const handleSettle = async (contract: CPRContract) => {
    if (contract.totalRepayment > account.availableBalance) {
      addToast({
        type: 'error',
        title: 'Saldo Insuficiente',
        message: `Você precisa de ${formatCurrency(contract.totalRepayment)} em conta para quitar esta CPR.`,
      });
      return;
    }

    if (!confirm(`Deseja quitar a CPR #${contract.contractNumber} por ${formatCurrency(contract.totalRepayment)} e liberar as ${contract.collateralQuantity} sacas em garantia?`)) {
      return;
    }

    setSettlingId(contract.id);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const res = settleCPR(contract.id);
    setSettlingId(null);

    if (!res.success) {
      addToast({
        type: 'error',
        title: 'Falha na Quitação',
        message: res.error,
      });
    }
  };

  // Copiar Hash
  const handleCopyHash = async (hash: string) => {
    const ok = await copyToClipboard(hash);
    if (ok) {
      addToast({
        type: 'info',
        title: 'Hash Copiado!',
        message: 'Identificador de registro da CPR copiado para a área de transferência.',
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 animate-fadeIn">
        {/* Cabeçalho da Página */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">📜</span>
              <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                Crédito Rural & CPR Digital
              </h1>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-agro-verde-musgo/15 text-agro-verde-musgo dark:text-emerald-400 px-2 py-0.5 rounded-full">
                Colateral RWA
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 max-w-2xl">
              Cédula de Produto Rural tokenizada: obtenha liquidez financeira imediata oferecendo sua custódia
              de grãos como garantia, com juros agrícolas reduzidos (Plano Safra / B3) sem precisar vender sua colheita.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/new-operation">
              <Button variant="outline" size="sm">
                + Comprar Grãos (Aporte)
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="primary" size="sm">
                Ver Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Métricas de Crédito */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-l-4 border-l-agro-azul-escuro dark:border-l-blue-500">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Limite Pré-Aprovado (LTV 70%)</p>
            <p className="text-2xl font-black text-agro-azul-escuro dark:text-blue-400 mt-1">
              {formatCurrency(maxCreditLimit)}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Calculado sobre {formatCurrency(portfolio.totalValue)} em grãos
            </p>
          </Card>

          <Card className="p-5 border-l-4 border-l-agro-verde-musgo dark:border-l-emerald-500">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Taxa Agro Subsidiada</p>
            <p className="text-2xl font-black text-agro-verde-musgo dark:text-emerald-400 mt-1">
              11,5% <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">a.a.</span>
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              ~0,91% ao mês (Tabela Price)
            </p>
          </Card>

          <Card className="p-5 border-l-4 border-l-amber-500">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Sacas em Garantia (Penhor)</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {totalLockedTokens.toLocaleString('pt-BR')} <span className="text-xs font-semibold text-gray-500">sacas</span>
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Retidas nos contratos ativos
            </p>
          </Card>

          <Card className="p-5 border-l-4 border-l-purple-500">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Saldo Disponível em Conta</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {formatCurrency(account.availableBalance)}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Pronto para transferências ou quitação
            </p>
          </Card>
        </div>

        {/* Simulador de Crédito & Emissão de CPR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Formulário de Configuração */}
          <div className="lg:col-span-7">
            <Card className="p-6 space-y-6">
              <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>🌾</span> Simulador Interativo de Financiamento
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Escolha o montante desejado, o prazo e a commodity a ser vinculada como garantia contratual.
                </p>
              </div>

              {/* Valor Solicitado */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  Valor Desejado (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                    R$
                  </span>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    max={maxCreditLimit}
                    value={requestedAmountStr}
                    onChange={(e) => setRequestedAmountStr(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-agro-azul-escuro dark:focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                {/* Atalhos Rápidos */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[10000, 25000, 50000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRequestedAmountStr(val.toString())}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all cursor-pointer"
                    >
                      {formatCurrency(val)}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setRequestedAmountStr(Math.floor(maxCreditLimit).toString())}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-agro-azul-escuro/30 bg-agro-azul-escuro/10 dark:bg-blue-500/20 text-agro-azul-escuro dark:text-blue-300 hover:bg-agro-azul-escuro/20 transition-all cursor-pointer"
                  >
                    Limite Máx ({formatCurrency(maxCreditLimit)})
                  </button>
                </div>
              </div>

              {/* Seleção do Ativo Colateral */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  Commodity para Garantia (Colateral RWA)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {portfolio.assets.map((asset) => {
                    const isSelected = asset.assetId === selectedAssetId;
                    const availableSacas = Math.max(0, asset.quantity - (asset.lockedQuantity || 0));
                    return (
                      <button
                        key={asset.assetId}
                        type="button"
                        onClick={() => setSelectedAssetId(asset.assetId)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-agro-azul-escuro dark:border-blue-500 bg-agro-azul-escuro/5 dark:bg-blue-500/10 shadow-sm ring-1 ring-agro-azul-escuro dark:ring-blue-500'
                            : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {asset.tokenSymbol}
                          </span>
                          <span className="text-xs font-bold text-agro-verde-musgo dark:text-emerald-400">
                            {formatCurrency(asset.pricePerToken)}/sc
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {asset.assetName}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-gray-100 dark:border-gray-800">
                          <span className="text-gray-500">Livre:</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">
                            {availableSacas.toLocaleString('pt-BR')} sacas
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prazo de Pagamento (Safra) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  Prazo de Pagamento (Ciclo de Safra)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { months: 6, label: '6 Meses', sub: 'Meia Safra' },
                    { months: 12, label: '12 Meses', sub: 'Safra Cheia' },
                    { months: 24, label: '24 Meses', sub: 'Safra Bienal' },
                  ].map((p) => (
                    <button
                      key={p.months}
                      type="button"
                      onClick={() => setTermMonths(p.months as 6 | 12 | 24)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        termMonths === p.months
                          ? 'border-agro-azul-escuro dark:border-blue-500 bg-agro-azul-escuro text-white dark:bg-blue-600 shadow-sm'
                          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
                      }`}
                    >
                      <p className="text-xs font-bold">{p.label}</p>
                      <p className={`text-[10px] mt-0.5 ${termMonths === p.months ? 'text-blue-100' : 'text-gray-400'}`}>
                        {p.sub}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Resumo da Simulação e Ação */}
          <div className="lg:col-span-5">
            <Card className="p-6 bg-gradient-to-b from-white to-gray-50/70 dark:from-gray-900 dark:to-gray-900/90 border border-gray-200 dark:border-gray-800 space-y-5">
              <div className="border-b border-gray-200 dark:border-gray-800 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Resumo Contratual da CPR
                </h3>
                {simulation?.isEligible ? (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Garantia Aprovada ✓
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-500/20">
                    Colateral Insuficiente ⚠️
                  </span>
                )}
              </div>

              {simulation && (
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 dark:text-gray-400">Valor do Crédito:</span>
                    <span className="font-extrabold text-base text-gray-900 dark:text-white">
                      {formatCurrency(simulation.requestedAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">Parcela Mensal Estimada:</span>
                    <span className="font-extrabold text-base text-agro-verde-musgo dark:text-emerald-400">
                      {formatCurrency(simulation.monthlyPayment)} / mês
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">Sacas Exigidas em Garantia:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {simulation.requiredTokens.toLocaleString('pt-BR')} sacas ({selectedAsset.tokenSymbol})
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">Sacas Disponíveis na Carteira:</span>
                    <span className={`font-bold ${simulation.isEligible ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {simulation.availableTokens.toLocaleString('pt-BR')} sacas
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">LTV Efetivo da Operação:</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {simulation.effectiveLtv}% (Limite Máx: 70%)
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">Montante Total com Juros:</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                      {formatCurrency(simulation.totalRepayment)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <span>ℹ️</span> Penhor Tokenizado em Smart Contract
                    </p>
                    <p className="leading-relaxed text-blue-700 dark:text-blue-300/80">
                      As sacas dadas em garantia continuam valorizando na sua carteira, porém ficam temporariamente
                      bloqueadas para venda ou resgate até a liquidação da CPR.
                    </p>
                  </div>
                </div>
              )}

              <Button
                variant="primary"
                onClick={handleContractCPR}
                disabled={!simulation?.isEligible || isSubmitting || requestedAmount <= 0}
                className="w-full py-3 text-sm font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin inline-block">🔄</span>
                    Registrando CPR na B3...
                  </span>
                ) : (
                  `Contratar CPR e Receber ${formatCurrency(requestedAmount)}`
                )}
              </Button>
            </Card>
          </div>
        </div>

        {/* Tabela de Contratos de CPR Ativos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>📑</span> Contratos de CPR & Histórico de Financiamento
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {cprContracts.length} contrato{cprContracts.length !== 1 ? 's' : ''} registrado{cprContracts.length !== 1 ? 's' : ''}
            </span>
          </div>

          <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 uppercase tracking-wider text-[10px] font-bold border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Contrato / Registro B3</th>
                    <th className="py-3 px-4">Emissão / Vencimento</th>
                    <th className="py-3 px-4">Valor Financiado</th>
                    <th className="py-3 px-4">Garantia (Colateral)</th>
                    <th className="py-3 px-4">Total a Liquidar</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                  {cprContracts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        Nenhum contrato de CPR registrado no momento.
                      </td>
                    </tr>
                  ) : (
                    cprContracts.map((contract) => {
                      const isSettling = settlingId === contract.id;
                      const asset = portfolio.assets.find((a) => a.assetId === contract.collateralAssetId);
                      return (
                        <tr
                          key={contract.id}
                          className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-gray-900 dark:text-white">
                              {contract.contractNumber}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleCopyHash(contract.cprHash)}
                              title="Copiar Hash de Registro"
                              className="text-[10px] font-mono text-gray-400 hover:text-agro-azul-escuro dark:hover:text-blue-400 cursor-pointer flex items-center gap-1 mt-0.5"
                            >
                              <span>{contract.cprHash}</span>
                              <span>📋</span>
                            </button>
                          </td>

                          <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                            <p>{formatDate(contract.createdAt)}</p>
                            <p className="text-[10px] text-gray-400">Venc: {formatDate(contract.dueDate)}</p>
                          </td>

                          <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                            {formatCurrency(contract.amount)}
                          </td>

                          <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300">
                            <p className="font-semibold text-amber-600 dark:text-amber-400">
                              🔒 {contract.collateralQuantity.toLocaleString('pt-BR')} sacas
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {asset?.tokenSymbol || 'RWA'} ({formatCurrency(contract.collateralValue)})
                            </p>
                          </td>

                          <td className="py-3.5 px-4 font-extrabold text-gray-900 dark:text-white">
                            {formatCurrency(contract.totalRepayment)}
                            <span className="block text-[10px] font-normal text-gray-400">
                              {contract.termMonths}x de {formatCurrency(contract.monthlyPayment)}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {contract.status === 'active' ? (
                              <Badge variant="success">Ativa (Vigente)</Badge>
                            ) : (
                              <Badge variant="default">Liquidada</Badge>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {contract.status === 'active' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSettle(contract)}
                                disabled={isSettling}
                                className="text-xs font-semibold hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                              >
                                {isSettling ? 'Quitando...' : 'Quitar CPR'}
                              </Button>
                            ) : (
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                                Liberado ✓
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
