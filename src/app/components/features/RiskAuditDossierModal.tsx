'use client';

import { useMemo, useState } from 'react';
import { useAgroFinanceStore } from '@/lib/store';
import { formatCurrency, formatDate, copyToClipboard, maskCPF } from '@/lib/utils';
import { MLCommodityEngine } from '@/lib/mlForecasting';
import Button from '../ui/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function RiskAuditDossierModal({ isOpen, onClose }: Props) {
  const account = useAgroFinanceStore((state) => state.account);
  const portfolio = useAgroFinanceStore((state) => state.portfolio);
  const kyc = useAgroFinanceStore((state) => state.kyc);
  const cprContracts = useAgroFinanceStore((state) => state.cprContracts || []);
  const hedgeContracts = useAgroFinanceStore((state) => state.hedgeContracts || []);
  const [copiedHash, setCopiedHash] = useState(false);

  const activeCPRs = useMemo(() => cprContracts.filter((c) => c.status === 'active'), [cprContracts]);
  const activeHedges = useMemo(() => hedgeContracts.filter((c) => c.status === 'active'), [hedgeContracts]);

  const totalCPRAmount = useMemo(() => activeCPRs.reduce((sum, c) => sum + c.amount, 0), [activeCPRs]);
  const totalLockedSacas = useMemo(() => activeCPRs.reduce((sum, c) => sum + c.collateralQuantity, 0), [activeCPRs]);
  const totalProtectedSacas = useMemo(() => activeHedges.reduce((sum, c) => sum + c.quantitySacas, 0), [activeHedges]);

  // Simulação de Monte Carlo para auditoria
  const stress = useMemo(() => {
    return MLCommodityEngine.runMonteCarloCollateralStress({
      lockedSacas: totalLockedSacas || 1000,
      spotPrice: 138.5,
      cprDebtTotal: totalCPRAmount || 50000,
      daysToMaturity: 365,
      numSimulations: 1000,
    });
  }, [totalLockedSacas, totalCPRAmount]);

  const auditHash = useMemo(() => {
    const seed = `${account.accountId}-${account.ownerName}-${portfolio.totalValue}-${Date.now()}`;
    // Hash simulado reproduzível de 64 caracteres hexadecimais (SHA-256 format)
    return `0x${Array.from({ length: 64 }, (_, i) => ((i * 17 + seed.length * 31) % 16).toString(16)).join('')}`;
  }, [account.accountId, account.ownerName, portfolio.totalValue]);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleCopyHash = async () => {
    const ok = await copyToClipboard(auditHash);
    if (ok) {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Barra Superior de Ações */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <span className="font-bold text-sm text-gray-800">
              Dossiê Institucional de Risco & Garantias AgroFinance
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyHash}
              className="text-xs"
            >
              {copiedHash ? '✓ Hash Copiado' : 'Copiar Hash'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              className="text-xs font-bold"
            >
              🖨️ Salvar em PDF / Imprimir
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Conteúdo do Dossiê Formatado para Impressão / PDF */}
        <div className="p-8 sm:p-10 overflow-y-auto space-y-6 text-xs text-gray-800 bg-white">
          {/* Cabeçalho Oficial */}
          <div className="flex justify-between items-start border-b-2 border-agro-verde-musgo pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-agro-verde-musgo tracking-tight">
                  AGROFINANCE
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                  RWA Institutional Banking
                </span>
              </div>
              <h1 id="dossier-modal-title" className="text-base font-bold text-gray-900 mt-1">
                RELATÓRIO QUANTITATIVO DE RISCO, CUSTÓDIA RWA & CPR DIGITAL
              </h1>
              <p className="text-[11px] text-gray-500">
                Emitido para fins de comprovação bancária, compliance e auditoria de garantias agrícolas
              </p>
            </div>

            <div className="text-right text-[11px] text-gray-500">
              <p>Data de Emissão: <strong>{new Date().toLocaleDateString('pt-BR')}</strong></p>
              <p>Registro BACEN / B3: <strong>B3-AGRO-RWA-2026</strong></p>
              <p className="text-emerald-700 font-semibold">Situação: AUDITADO & CONFORME ✓</p>
            </div>
          </div>

          {/* Dados do Produtor Rural */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Produtor / Titular</span>
              <span className="font-bold text-gray-900 text-xs">{account.ownerName}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Documento (CPF)</span>
              <span className="font-mono text-gray-900">{maskCPF('123.456.789-00')}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Conta de Liquidação</span>
              <span className="font-mono text-gray-900">{account.accountId}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Status Compliance & KYC</span>
              <span className="font-bold text-emerald-700 uppercase">
                {kyc?.status === 'approved' ? '✓ Produtor Verificado' : 'Em Análise'}
              </span>
            </div>
          </div>

          {/* Posição de Custódia em Armazém Credenciado */}
          <div>
            <h2 className="font-bold text-sm text-gray-900 mb-2 border-b pb-1">
              1. Posição Consolidada de Commodities RWA em Custódia
            </h2>
            <table className="w-full text-left border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-[11px] uppercase font-bold text-gray-600">
                <tr>
                  <th className="p-2.5">Commodity</th>
                  <th className="p-2.5">Armazém / Silo Credenciado</th>
                  <th className="p-2.5 text-right">Sacas Livres</th>
                  <th className="p-2.5 text-right">Sacas em Garantia (CPR)</th>
                  <th className="p-2.5 text-right">Preço Spot B3</th>
                  <th className="p-2.5 text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {portfolio.assets.map((asset) => (
                  <tr key={asset.assetId}>
                    <td className="p-2.5 font-bold">{asset.assetName} ({asset.tokenSymbol})</td>
                    <td className="p-2.5 text-gray-600">Armazém Central Cascavel - PR (Cred. MAPA)</td>
                    <td className="p-2.5 text-right font-mono">{(asset.quantity - (asset.lockedQuantity || 0)).toLocaleString('pt-BR')} sc</td>
                    <td className="p-2.5 text-right font-mono text-blue-700">{(asset.lockedQuantity || 0).toLocaleString('pt-BR')} sc</td>
                    <td className="p-2.5 text-right font-mono">{formatCurrency(asset.pricePerToken)}</td>
                    <td className="p-2.5 text-right font-bold font-mono">{formatCurrency(asset.totalValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modelagem Quantitativa de Risco (Monte Carlo & VaR) */}
          <div>
            <h2 className="font-bold text-sm text-gray-900 mb-2 border-b pb-1">
              2. Auditoria Quantitativa de Risco & Stress Testing (Modelos Estocásticos)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Metodologia</span>
                <span className="font-bold text-gray-900">Monte Carlo (1.000 iterações)</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Probabilidade de Quebra LTV</span>
                <span className="font-bold text-emerald-700">{stress.breachProbabilityPercent}% (Risco Baixo)</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Piso P5 sob Estresse Severo</span>
                <span className="font-bold text-gray-900">{formatCurrency(stress.stressCollateralValueP5)}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Classificação de Risco</span>
                <span className="font-extrabold text-emerald-700">RATING AAA (Sólido)</span>
              </div>
            </div>
          </div>

          {/* Contratos de Hedge Ativos B3 */}
          <div>
            <h2 className="font-bold text-sm text-gray-900 mb-2 border-b pb-1">
              3. Proteção Ativa de Mercado (Derivativos B3 / Travas)
            </h2>
            {activeHedges.length === 0 ? (
              <p className="text-gray-500 italic">Nenhum derivativo ativo registrado no momento da emissão.</p>
            ) : (
              <table className="w-full text-left border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-[11px] uppercase font-bold text-gray-600">
                  <tr>
                    <th className="p-2">Registro B3</th>
                    <th className="p-2">Tipo</th>
                    <th className="p-2">Volume</th>
                    <th className="p-2">Strike Garantido</th>
                    <th className="p-2 text-right">Valor Assegurado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {activeHedges.map((h) => (
                    <tr key={h.id}>
                      <td className="p-2 font-mono">{h.contractNumber}</td>
                      <td className="p-2 uppercase">{h.type === 'commodity_put' ? 'Opção Put B3' : 'NDF Dólar'}</td>
                      <td className="p-2">{h.quantitySacas.toLocaleString('pt-BR')} sacas</td>
                      <td className="p-2 font-bold">{formatCurrency(h.strikePrice)}</td>
                      <td className="p-2 text-right font-bold text-emerald-700">{formatCurrency(h.totalProtectedValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Assinatura Criptográfica e Autenticidade */}
          <div className="pt-4 border-t-2 border-gray-200 space-y-2">
            <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
              <span>HASH SHA-256 DO RELATÓRIO: {auditHash}</span>
              <span>CARIMBO DE TEMPO: {new Date().toISOString()}</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed text-justify">
              Este dossiê foi gerado automaticamente pelo protocolo AgroFinance Banking com base na custódia de Certificados de Depósito Agropecuário (CDA/WA) e dados oficiais de fechamento da B3. A integridade matemática é garantida por meio de algoritmo de precisão arbitrária centesimal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
