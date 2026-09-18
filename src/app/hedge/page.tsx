'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAgroFinanceStore } from '@/lib/store';
import { 
  formatCurrency, 
  formatDate, 
  calculateHedgeSimulation, 
  calculateHedgePayoff, 
  copyToClipboard 
} from '@/lib/utils';
import type { HedgeType, HedgeContract } from '@/lib/types';

interface AvailableDerivative {
  id: string;
  name: string;
  symbol: string;
  type: HedgeType;
  maturity: string;
  spotPrice: number;
  unit: string;
}

const AVAILABLE_DERIVATIVES: AvailableDerivative[] = [
  {
    id: 'soja-mar-27',
    name: 'Soja Premium B3',
    symbol: 'SOJA24',
    type: 'commodity_put',
    maturity: 'Março/2027',
    spotPrice: 48.50,
    unit: 'saca',
  },
  {
    id: 'soja-org-mai-27',
    name: 'Soja Orgânica Exportação',
    symbol: 'SOJAO',
    type: 'commodity_put',
    maturity: 'Maio/2027',
    spotPrice: 52.75,
    unit: 'saca',
  },
  {
    id: 'milho-jul-26',
    name: 'Milho Híbrido B3',
    symbol: 'MLHO25',
    type: 'commodity_put',
    maturity: 'Julho/2026',
    spotPrice: 28.30,
    unit: 'saca',
  },
  {
    id: 'milho-set-26',
    name: 'Milho Premium Especial',
    symbol: 'MLHOP',
    type: 'commodity_put',
    maturity: 'Setembro/2026',
    spotPrice: 31.20,
    unit: 'saca',
  },
  {
    id: 'ndf-usd-nov-26',
    name: 'NDF Cambial Dólar Futuro PTAX',
    symbol: 'USD/BRL',
    type: 'ndf_usd',
    maturity: 'Novembro/2026',
    spotPrice: 5.42,
    unit: 'USD eq.',
  },
];

export default function HedgePage() {
  const account = useAgroFinanceStore((state) => state.account);
  const hedgeContracts = useAgroFinanceStore((state) => state.hedgeContracts || []);
  const requestHedge = useAgroFinanceStore((state) => state.requestHedge);
  const settleHedge = useAgroFinanceStore((state) => state.settleHedge);
  const addToast = useAgroFinanceStore((state) => state.addToast);

  // Estados do Simulador
  const [selectedDerivativeId, setSelectedDerivativeId] = useState(AVAILABLE_DERIVATIVES[0].id);
  const [quantityStr, setQuantityStr] = useState('1000');
  const [strikePriceStr, setStrikePriceStr] = useState(AVAILABLE_DERIVATIVES[0].spotPrice.toFixed(2));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);

  const selectedDerivative = useMemo(() => {
    return AVAILABLE_DERIVATIVES.find((d) => d.id === selectedDerivativeId) || AVAILABLE_DERIVATIVES[0];
  }, [selectedDerivativeId]);

  const quantity = useMemo(() => {
    const num = parseInt(quantityStr.replace(/\D/g, ''), 10);
    return isNaN(num) ? 0 : num;
  }, [quantityStr]);

  const strikePrice = useMemo(() => {
    const num = parseFloat(strikePriceStr.replace(',', '.'));
    return isNaN(num) ? 0 : num;
  }, [strikePriceStr]);

  // Simulação Financeira em Tempo Real
  const simulation = useMemo(() => {
    return calculateHedgeSimulation(
      selectedDerivative.type,
      selectedDerivative.name,
      selectedDerivative.symbol,
      selectedDerivative.maturity,
      quantity,
      strikePrice,
      selectedDerivative.spotPrice,
      account.availableBalance
    );
  }, [selectedDerivative, quantity, strikePrice, account.availableBalance]);

  // KPIs da Carteira de Hedge
  const activeContracts = useMemo(() => {
    return hedgeContracts.filter((c) => c.status === 'active');
  }, [hedgeContracts]);

  const totalProtectedSacas = useMemo(() => {
    return activeContracts.reduce((sum, c) => sum + c.quantitySacas, 0);
  }, [activeContracts]);

  const totalProtectedValue = useMemo(() => {
    return activeContracts.reduce((sum, c) => sum + c.totalProtectedValue, 0);
  }, [activeContracts]);

  const totalPremiumInvested = useMemo(() => {
    return activeContracts.reduce((sum, c) => sum + c.premiumCost, 0);
  }, [activeContracts]);

  const itmContractsCount = useMemo(() => {
    return activeContracts.filter((c) => c.strikePrice > c.currentSpotPrice).length;
  }, [activeContracts]);

  // Ao trocar ativo selecionado, atualiza strike padrão para o Spot
  const handleSelectDerivative = (id: string) => {
    setSelectedDerivativeId(id);
    const deriv = AVAILABLE_DERIVATIVES.find((d) => d.id === id);
    if (deriv) {
      setStrikePriceStr(deriv.spotPrice.toFixed(2));
    }
  };

  // Atalhos de Strike
  const setStrikePreset = (percentageDiff: number) => {
    const target = selectedDerivative.spotPrice * (1 + percentageDiff / 100);
    setStrikePriceStr(target.toFixed(2));
  };

  // Contratação de Hedge
  const handleContractHedge = async () => {
    if (!simulation || !simulation.isEligible) {
      addToast({
        type: 'error',
        title: 'Condição Inválida',
        message: 'Verifique a quantidade mínima (50 sacas) e se possui saldo para cobrir o prêmio.',
      });
      return;
    }

    setIsSubmitting(true);
    // Simula delay de registro em câmara de compensação B3
    await new Promise((resolve) => setTimeout(resolve, 600));

    const res = requestHedge({
      type: simulation.type,
      commodityName: simulation.commodityName,
      commoditySymbol: simulation.commoditySymbol,
      targetMaturity: simulation.targetMaturity,
      quantitySacas: simulation.quantitySacas,
      strikePrice: simulation.strikePrice,
      currentSpotPrice: simulation.currentSpotPrice,
      premiumRatePercent: simulation.premiumRatePercent,
    });

    setIsSubmitting(false);

    if (!res.success) {
      addToast({
        type: 'error',
        title: 'Falha na Contratação',
        message: res.error || 'Não foi possível registrar o contrato.',
      });
    }
  };

  // Liquidação / Exercício de Hedge
  const handleSettle = async (contract: HedgeContract) => {
    const payoff = calculateHedgePayoff(contract);
    const message = payoff.isITM
      ? `Confirmar o exercício da opção de venda #${contract.contractNumber}? Você receberá ${formatCurrency(payoff.totalPayoff)} em conta corrente pelo ganho de proteção.`
      : `Encerrar a posição #${contract.contractNumber}? A cotação spot de mercado está favorável e superior ao strike contratado.`;

    if (!confirm(message)) return;

    setSettlingId(contract.id);
    await new Promise((resolve) => setTimeout(resolve, 500));
    settleHedge(contract.id);
    setSettlingId(null);
  };

  const handleCopyHash = async (contractId: string, hash: string) => {
    const ok = await copyToClipboard(hash);
    if (ok) {
      setCopiedHashId(contractId);
      setTimeout(() => setCopiedHashId(null), 2000);
      addToast({
        type: 'info',
        title: 'Hash B3 Copiado',
        message: 'Código de registro copiado para a área de transferência.',
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 pb-12">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              <h1 className="text-2xl font-black text-agro-verde-escuro dark:text-white tracking-tight">
                Hedge Cambial & Derivativos Agro (B3 / CBOT)
              </h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                B3 Mercado Balcão
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Trave preços mínimos de venda (*Strike Price*) para sua safra, mitigando riscos de queda de cotações em Chicago e oscilações do Dólar PTAX.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/credit">
              <Button variant="secondary" size="sm">
                🌾 Ver Crédito & CPR
              </Button>
            </Link>
            <Link href="/new-operation">
              <Button variant="primary" size="sm">
                ⚡ Nova Operação
              </Button>
            </Link>
          </div>
        </div>

        {/* Banner Didático Pleno / Finanças Rurais */}
        <div className="bg-linear-to-r from-agro-azul-escuro to-agro-verde-escuro rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4 text-9xl">
            📈
          </div>
          <div className="max-w-3xl relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-green-300 mb-1">
              <span>🌾 Gestão de Risco Agropecuário</span>
              <span>•</span>
              <span>Proteção Patrimonial RWA</span>
            </div>
            <h2 className="text-lg font-black mb-1">
              Como funciona o Hedge com Opções de Venda (*Put*)?
            </h2>
            <p className="text-xs text-gray-200 leading-relaxed">
              O produtor rural adquire o **direito de vender sua safra por um preço mínimo garantido** pagando apenas um prêmio de proteção (débito em conta). Se a cotação no mercado físico cair, a B3 liquida a diferença financeira diretamente no seu saldo bancário (**In The Money**). Se a cotação subir, o produtor vende a mercado colhendo todo o lucro adicional!
            </p>
          </div>
        </div>

        {/* Cards de KPIs Executivos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-2xl font-bold">
              🌾
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Volume Assegurado
              </p>
              <p className="text-xl font-black text-gray-900 dark:text-white">
                {totalProtectedSacas.toLocaleString('pt-BR')} <span className="text-xs font-medium text-gray-500">sacas</span>
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Safra 2025/26 & 2026/27
              </p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 flex items-center justify-center text-2xl font-bold">
              💰
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Patrimônio Protegido
              </p>
              <p className="text-xl font-black text-gray-900 dark:text-white">
                {formatCurrency(totalProtectedValue)}
              </p>
              <p className="text-[11px] text-green-600 dark:text-green-400 font-medium">
                Piso financeiro assegurado
              </p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center text-2xl font-bold">
              📊
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Posições Ativas
              </p>
              <p className="text-xl font-black text-gray-900 dark:text-white">
                {activeContracts.length}{' '}
                <span className="text-xs font-normal text-gray-500">
                  ({itmContractsCount} ITM lucrando)
                </span>
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Registros B3 ativos
              </p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center text-2xl font-bold">
              📑
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Prêmios Investidos
              </p>
              <p className="text-xl font-black text-gray-900 dark:text-white">
                {formatCurrency(totalPremiumInvested)}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Saldo: {formatCurrency(account.availableBalance)}
              </p>
            </div>
          </Card>
        </div>

        {/* Seção Principal: Simulador Interativo + Painel Comparativo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna Esquerda: Formulário do Simulador (7 cols) */}
          <div className="lg:col-span-7">
            <Card className="p-6">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>⚡</span> Simulador de Trava de Preço B3
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Defina o ativo agrícola, o volume de sacas e o preço mínimo desejado.
                  </p>
                </div>
                <Badge variant="info">Derivativo Agro</Badge>
              </div>

              <div className="space-y-4">
                {/* 1. Seleção de Commodity / Derivativo */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                    1. Safra & Vencimento (B3)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {AVAILABLE_DERIVATIVES.map((deriv) => {
                      const isSelected = deriv.id === selectedDerivativeId;
                      return (
                        <button
                          key={deriv.id}
                          type="button"
                          onClick={() => handleSelectDerivative(deriv.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-agro-verde-musgo bg-green-50/50 dark:bg-green-950/30 ring-2 ring-agro-verde-musgo/40 shadow-xs'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/60'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-xs text-gray-900 dark:text-white">
                              {deriv.name}
                            </span>
                            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                              {deriv.symbol}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[11px] text-gray-500 dark:text-gray-400">
                            <span>Venc: {deriv.maturity}</span>
                            <span className="font-semibold text-agro-verde-musgo dark:text-green-400">
                              Spot: R$ {deriv.spotPrice.toFixed(2)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Quantidade de Sacas */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      2. Quantidade de Sacas ({selectedDerivative.unit})
                    </label>
                    <span className="text-xs text-gray-500">Mínimo: 50 sacas</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={quantityStr}
                      onChange={(e) => setQuantityStr(e.target.value)}
                      placeholder="Ex: 1000"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-agro-verde-musgo/50 focus:border-agro-verde-musgo outline-hidden transition-all"
                    />
                    <div className="absolute right-3 top-2.5 text-xs font-bold text-gray-400">
                      sacas
                    </div>
                  </div>
                  {/* Atalhos Rápidos de Volume */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[500, 1000, 2500, 5000].map((vol) => (
                      <button
                        key={vol}
                        type="button"
                        onClick={() => setQuantityStr(vol.toString())}
                        className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
                      >
                        {vol.toLocaleString('pt-BR')} sacas
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Preço de Exercício (Strike Price) */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      3. Preço Mínimo Garantido — *Strike* (R$ / saca)
                    </label>
                    <span className="text-xs text-agro-verde-musgo font-semibold">
                      Spot Atual: R$ {selectedDerivative.spotPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={strikePriceStr}
                      onChange={(e) => setStrikePriceStr(e.target.value)}
                      placeholder="Ex: 50.00"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-agro-verde-musgo/50 focus:border-agro-verde-musgo outline-hidden transition-all"
                    />
                    <div className="absolute right-3 top-2.5 text-xs font-bold text-gray-400">
                      R$/saca
                    </div>
                  </div>

                  {/* Botões Presets de Moneyness */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setStrikePreset(0)}
                      className="text-xs px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      🎯 No Dinheiro (ATM) — R$ {selectedDerivative.spotPrice.toFixed(2)}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStrikePreset(5)}
                      className="text-xs px-2.5 py-1 rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 font-medium hover:bg-green-100 transition-colors cursor-pointer"
                    >
                      🛡️ +5% Proteção Extra (ITM)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStrikePreset(-5)}
                      className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      🏷️ -5% Prêmio Econômico (OTM)
                    </button>
                  </div>
                </div>

                {/* Botão de Contratação */}
                <div className="pt-3">
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    disabled={!simulation || !simulation.isEligible || isSubmitting}
                    onClick={handleContractHedge}
                    className="w-full justify-center text-sm font-bold shadow-md cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin inline-block">⏳</span> Registrando Operação na B3...
                      </span>
                    ) : !simulation?.isEligible ? (
                      account.availableBalance < (simulation?.premiumCost || 0)
                        ? 'Saldo Insuficiente para Cobrir o Prêmio'
                        : 'Preencha o Volume Válido (Min. 50 sacas)'
                    ) : (
                      `Contratar Trava de Preço na B3 por ${formatCurrency(simulation.premiumCost)}`
                    )}
                  </Button>
                  <p className="text-[11px] text-center text-gray-500 dark:text-gray-400 mt-2">
                    🔒 O valor do prêmio é debitado imediatamente do seu saldo em conta corrente.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Coluna Direita: Resumo Financeiro & Análise de Payoff (5 cols) */}
          <div className="lg:col-span-5">
            <Card className="p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span>📊</span> Impacto Financeiro da Trava
                  </h3>
                  {simulation?.isITM ? (
                    <Badge variant="success">Dentro do Dinheiro (ITM)</Badge>
                  ) : (
                    <Badge variant="info">Fora do Dinheiro (OTM)</Badge>
                  )}
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">Ativo / Vencimento</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {selectedDerivative.name} ({selectedDerivative.maturity})
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">Volume Contratado</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {quantity.toLocaleString('pt-BR')} sacas
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">Preço Mínimo Garantido (Strike)</span>
                    <span className="font-black text-agro-verde-musgo dark:text-green-400 text-sm">
                      R$ {strikePrice.toFixed(2)} / saca
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">Valor Total Assegurado</span>
                    <span className="font-bold text-gray-900 dark:text-white text-sm">
                      {formatCurrency(simulation?.totalProtectedValue || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">
                      Custo do Prêmio ({simulation?.premiumRatePercent}% s/ valor)
                    </span>
                    <span className="font-bold text-red-600 dark:text-red-400 text-sm">
                      {formatCurrency(simulation?.premiumCost || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">Saldo Disponível Atual</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(account.availableBalance)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">Saldo Residual após Contratação</span>
                    <span className={`font-bold ${
                      account.availableBalance >= (simulation?.premiumCost || 0)
                        ? 'text-gray-900 dark:text-white'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatCurrency(account.availableBalance - (simulation?.premiumCost || 0))}
                    </span>
                  </div>
                </div>

                {/* Cenário de Stress Test */}
                <div className="mt-5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                  <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <span>⚡</span> Cenário de Queda Severa (-10% no Spot)
                  </p>
                  <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                    Se o preço cair para R$ {(selectedDerivative.spotPrice * 0.90).toFixed(2)}, esta opção garantirá um retorno bruto de{' '}
                    <strong className="font-bold underline">
                      {formatCurrency(simulation?.potentialProtectionGain || 0)}
                    </strong>, cobrindo com folga o custo do prêmio!
                  </p>
                </div>
              </div>

              {/* Selo Regulatório Simulado */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="text-green-500">✓</span> Registro Eletrônico B3
                </span>
                <span>Câmara B3 Agro (São Paulo)</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Tabela de Contratos & Posições Ativas */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>📑</span> Posições de Hedge em Aberto & Histórico
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Acompanhe o ganho intrínseco de cada contrato contra o preço spot atual de mercado.
              </p>
            </div>
            <div className="text-xs text-gray-500">
              Total de Contratos: <strong className="text-gray-900 dark:text-white font-bold">{hedgeContracts.length}</strong>
            </div>
          </div>

          {hedgeContracts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <span className="text-4xl block mb-2">🛡️</span>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                Nenhum contrato de hedge cadastrado.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Utilize o simulador acima para emitir a primeira trava de preço para a sua safra.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 uppercase font-bold text-[11px] tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3">Contrato / Registro</th>
                    <th className="px-4 py-3">Ativo / Vencimento</th>
                    <th className="px-4 py-3">Volume</th>
                    <th className="px-4 py-3">Strike vs Spot</th>
                    <th className="px-4 py-3">Prêmio Pago</th>
                    <th className="px-4 py-3">Situação B3</th>
                    <th className="px-4 py-3">Ganho Estimado</th>
                    <th className="px-4 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {hedgeContracts.map((contract) => {
                    const payoff = calculateHedgePayoff(contract);
                    const isActive = contract.status === 'active';

                    return (
                      <tr
                        key={contract.id}
                        className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
                      >
                        {/* Contrato & Hash */}
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-gray-900 dark:text-white">
                            {contract.contractNumber}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleCopyHash(contract.id, contract.b3RegistryHash)}
                            title="Clique para copiar o hash de registro"
                            className="font-mono text-[10px] text-gray-400 hover:text-agro-verde-musgo dark:hover:text-green-400 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>{copiedHashId === contract.id ? '✓ Copiado!' : contract.b3RegistryHash}</span>
                            <span>📋</span>
                          </button>
                        </td>

                        {/* Ativo */}
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {contract.commodityName}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            Venc: {contract.targetMaturity} ({formatDate(contract.expiryDate)})
                          </p>
                        </td>

                        {/* Volume */}
                        <td className="px-4 py-3.5 font-bold text-gray-900 dark:text-white">
                          {contract.quantitySacas.toLocaleString('pt-BR')} sacas
                        </td>

                        {/* Strike vs Spot */}
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-agro-verde-musgo dark:text-green-400">
                            R$ {contract.strikePrice.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Spot: R$ {contract.currentSpotPrice.toFixed(2)}
                          </p>
                        </td>

                        {/* Prêmio */}
                        <td className="px-4 py-3.5 font-semibold text-gray-600 dark:text-gray-300">
                          {formatCurrency(contract.premiumCost)}
                        </td>

                        {/* Badge ITM / OTM / Exercido */}
                        <td className="px-4 py-3.5">
                          {!isActive ? (
                            <Badge variant="info">Liquidado / Exercido</Badge>
                          ) : payoff.isITM ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                              ITM (+R$ {payoff.payoffPerSaca.toFixed(2)}/sc)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                              OTM (Mercado acima)
                            </span>
                          )}
                        </td>

                        {/* Ganho Estimado */}
                        <td className="px-4 py-3.5">
                          <span className={`font-black ${
                            payoff.totalPayoff > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
                          }`}>
                            {formatCurrency(payoff.totalPayoff)}
                          </span>
                        </td>

                        {/* Ação */}
                        <td className="px-4 py-3.5 text-right">
                          {isActive ? (
                            <Button
                              type="button"
                              variant={payoff.isITM ? 'primary' : 'secondary'}
                              size="sm"
                              disabled={settlingId === contract.id}
                              onClick={() => handleSettle(contract)}
                              className="cursor-pointer text-xs"
                            >
                              {settlingId === contract.id ? (
                                'Processando...'
                              ) : payoff.isITM ? (
                                'Exercer Lucro'
                              ) : (
                                'Encerrar'
                              )}
                            </Button>
                          ) : (
                            <span className="text-[11px] text-gray-400 italic">Concluído</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
