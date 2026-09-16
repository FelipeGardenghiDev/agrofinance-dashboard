'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { createOperationSchema, OperationFormValues } from '@/lib/validations';
import { formatCurrency, parseAmount } from '@/lib/utils';
import { useAgroFinanceStore } from '@/lib/store';
import { mockWarehouses } from '@/lib/mockData';
import type { Transaction } from '@/lib/types';

// Sugestões rápidas para facilitar testes de recrutadores
const QUICK_BENEFICIARIES = {
  pix: [
    { label: 'Cooperativa Agro SP', value: '04.253.987/0001-44' },
    { label: 'Fertilizantes Safra Forte', value: 'e4a7c29b-81d3-4e32-9c17-f58c7e9120ab' },
    { label: 'Consultoria Agronômica', value: '16998765432' },
  ],
  ted: [
    { label: 'Banco do Brasil - Ag 1234', value: 'Banco 001 - Ag 1234 - C/C 98765-4' },
    { label: 'Itaú Agro - Ag 0850', value: 'Banco 341 - Ag 0850 - C/C 12345-6' },
  ],
  investment_rwa: [
    { label: 'Pool de Liquidez Agro RWA', value: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
  ],
};

const QUICK_AMOUNTS = [500, 1500, 5000, 25000];
const QUICK_PERCENTAGES = [25, 50, 75, 100];

export default function NewOperationPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [formData, setFormData] = useState<OperationFormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [executedTx, setExecutedTx] = useState<Transaction | null>(null);

  const account = useAgroFinanceStore((state) => state.account);
  const portfolio = useAgroFinanceStore((state) => state.portfolio);
  const executeOperation = useAgroFinanceStore((state) => state.executeOperation);

  const schema = useMemo(() => {
    return createOperationSchema(account.availableBalance, portfolio.assets);
  }, [account.availableBalance, portfolio.assets]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<OperationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'pix',
      beneficiary: '',
      amount: '',
      memo: '',
      assetId: portfolio.assets[0]?.assetId || '',
      warehouse: mockWarehouses[0].name,
    },
  });

  // Preenche ativo e tipo automaticamente se vier de link externo ou dashboard (?type=...&asset=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const typeParam = params.get('type') as OperationFormValues['type'] | null;
    const assetParam = params.get('asset');

    if (typeParam && ['pix', 'ted', 'investment_rwa', 'sell_rwa', 'redeem_rwa'].includes(typeParam)) {
      setValue('type', typeParam);
      if (typeParam === 'sell_rwa') {
        setValue('beneficiary', `${account.ownerName} (Saldo em Conta)`);
      } else if (typeParam === 'redeem_rwa') {
        setValue('warehouse', mockWarehouses[0].name);
        setValue('beneficiary', mockWarehouses[0].name);
      }
    } else if (assetParam) {
      setValue('type', 'investment_rwa');
      setValue('beneficiary', QUICK_BENEFICIARIES.investment_rwa[0].value);
    }

    if (assetParam && portfolio.assets.some((a) => a.assetId === assetParam)) {
      setValue('assetId', assetParam);
    }
  }, [portfolio.assets, account.ownerName, setValue]);

  const operationType = useWatch({ control, name: 'type' });
  const currentAmountStr = useWatch({ control, name: 'amount' });
  const selectedAssetId = useWatch({ control, name: 'assetId' });
  const selectedWarehouse = useWatch({ control, name: 'warehouse' });

  const selectedAsset = useMemo(() => {
    return (
      portfolio.assets.find((a) => a.assetId === selectedAssetId) ||
      portfolio.assets[0] ||
      null
    );
  }, [portfolio.assets, selectedAssetId]);

  const parsedCurrentAmount = useMemo(() => {
    return parseAmount(currentAmountStr || '0');
  }, [currentAmountStr]);

  // Cálculo de tokens projetados dependendo da operação
  const tokenCalculations = useMemo(() => {
    if (!selectedAsset) return { tokens: 0, estimatedBrl: 0 };

    if (operationType === 'investment_rwa') {
      const tokens = Math.floor(parsedCurrentAmount / selectedAsset.pricePerToken);
      return { tokens, estimatedBrl: parsedCurrentAmount };
    }

    if (operationType === 'sell_rwa' || operationType === 'redeem_rwa') {
      const tokens = Math.min(
        selectedAsset.quantity,
        Math.floor(parsedCurrentAmount / selectedAsset.pricePerToken)
      );
      const estimatedBrl = Number((tokens * selectedAsset.pricePerToken).toFixed(2));
      return { tokens, estimatedBrl };
    }

    return { tokens: 0, estimatedBrl: 0 };
  }, [operationType, selectedAsset, parsedCurrentAmount]);

  // Ajusta automaticamente beneficiário ao trocar tipo
  const handleTypeChange = (newType: OperationFormValues['type']) => {
    setValue('type', newType);
    setValue('amount', '');

    if (newType === 'sell_rwa') {
      setValue('beneficiary', `${account.ownerName} (Saldo em Conta)`);
      if (!selectedAssetId && portfolio.assets[0]) {
        setValue('assetId', portfolio.assets[0].assetId);
      }
    } else if (newType === 'redeem_rwa') {
      const wh = selectedWarehouse || mockWarehouses[0].name;
      setValue('warehouse', wh);
      setValue('beneficiary', wh);
      if (!selectedAssetId && portfolio.assets[0]) {
        setValue('assetId', portfolio.assets[0].assetId);
      }
    } else if (newType === 'investment_rwa') {
      setValue('beneficiary', QUICK_BENEFICIARIES.investment_rwa[0].value);
      if (!selectedAssetId && portfolio.assets[0]) {
        setValue('assetId', portfolio.assets[0].assetId);
      }
    } else {
      setValue('beneficiary', '');
    }
  };

  // Submit do formulário - vai para tela de confirmação
  const onSubmit = (data: OperationFormValues) => {
    // Garante que beneficiário esteja preenchido para operações RWA
    const finalData = { ...data };
    if (data.type === 'sell_rwa' && !data.beneficiary) {
      finalData.beneficiary = `${account.ownerName} (Saldo em Conta)`;
    } else if (data.type === 'redeem_rwa' && !data.beneficiary) {
      finalData.beneficiary = data.warehouse || mockWarehouses[0].name;
    } else if (data.type === 'investment_rwa' && !data.beneficiary) {
      finalData.beneficiary = QUICK_BENEFICIARIES.investment_rwa[0].value;
    }

    setFormData(finalData);
    setExecutionError(null);
    setStep('confirm');
  };

  // Confirma operação
  const handleConfirm = async () => {
    if (!formData) return;
    setIsSubmitting(true);
    setExecutionError(null);

    // Simula latência de rede/blockchain
    await new Promise((resolve) => setTimeout(resolve, 800));

    const result = executeOperation(formData);

    setIsSubmitting(false);

    if (result.success && result.transaction) {
      setExecutedTx(result.transaction);
      setStep('success');
    } else {
      setExecutionError(result.error || 'Erro ao processar a operação.');
    }
  };

  // Volta pro form
  const handleBack = () => {
    setStep('form');
  };

  // Preenchimento rápido de valor monetário
  const handleQuickAmount = (val: number) => {
    const formatted = val.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    setValue('amount', formatted, { shouldValidate: true });
  };

  // Preenchimento rápido por percentual da posição (Venda e Resgate RWA)
  const handleQuickPercentage = (pct: number) => {
    if (!selectedAsset) return;
    const tokens = Math.floor((selectedAsset.quantity * pct) / 100);
    const totalVal = tokens * selectedAsset.pricePerToken;
    const formatted = totalVal.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    setValue('amount', formatted, { shouldValidate: true });
  };

  // Preenchimento rápido de beneficiário
  const handleQuickBeneficiary = (value: string) => {
    setValue('beneficiary', value, { shouldValidate: true });
  };

  // ==================== TELA DE SUCESSO ====================
  if (step === 'success' && executedTx) {
    const isSale = executedTx.category === 'rwa_sale';
    const isRedeem = executedTx.category === 'rwa_redemption';

    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="text-center py-10 px-4">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-950/60 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <span className="text-4xl">{isRedeem ? '🚜' : isSale ? '💵' : '✅'}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {isSale
                  ? 'Venda de Tokens RWA Concluída!'
                  : isRedeem
                  ? 'Certificado de Resgate Físico Emitido!'
                  : 'Operação Realizada com Sucesso!'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {isSale ? (
                  <>
                    Sua venda no valor de{' '}
                    <strong className="text-green-600 dark:text-green-400">
                      +{formatCurrency(executedTx.amount)}
                    </strong>{' '}
                    foi liquidada e creditada no seu saldo.
                  </>
                ) : isRedeem ? (
                  <>
                    Seu resgate físico de commodities no valor patrimonial de{' '}
                    <strong className="text-gray-900 dark:text-gray-100">
                      {formatCurrency(executedTx.amount)}
                    </strong>{' '}
                    foi emitido on-chain via CDA/WA.
                  </>
                ) : (
                  <>
                    Sua movimentação de{' '}
                    <strong className="text-gray-900 dark:text-gray-100">
                      {formatCurrency(executedTx.amount)}
                    </strong>{' '}
                    foi confirmada e liquidada em tempo real.
                  </>
                )}
              </p>

              {/* Resumo do comprovante */}
              <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-left mb-8 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">ID da Transação:</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-gray-100">{executedTx.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Tipo de Operação:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100 uppercase">
                    {executedTx.category === 'rwa_sale'
                      ? 'Venda / Liquidação RWA'
                      : executedTx.category === 'rwa_redemption'
                      ? 'Resgate Físico de Grãos'
                      : executedTx.category}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {isRedeem ? 'Armazém de Retirada:' : 'Destino / Conta:'}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{executedTx.toAddress}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>
                  <span className="text-green-600 dark:text-green-400 font-bold">Concluído</span>
                </div>

                {isRedeem && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-900 dark:text-amber-200">
                    🚜 <strong>Instruções de Carregamento:</strong> Apresente o código da transação ou este comprovante na portaria do armazém credenciado para agendar a pesagem e liberação da carga.
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Saldo Disponível em Conta:</span>
                  <span className="font-bold text-agro-azul-escuro dark:text-blue-400">
                    {formatCurrency(account.availableBalance)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => router.push('/transactions')}
                  variant="primary"
                  className="flex-1"
                >
                  Ver no Extrato de Transações →
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="secondary"
                  className="flex-1"
                >
                  Voltar ao Dashboard
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // ==================== TELA DE CONFIRMAÇÃO ====================
  if (step === 'confirm' && formData) {
    const amount = parseAmount(formData.amount);
    const isSale = formData.type === 'sell_rwa';
    const isRedeem = formData.type === 'redeem_rwa';
    const newBalance = isSale
      ? account.availableBalance + amount
      : isRedeem
      ? account.availableBalance
      : account.availableBalance - amount;

    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Confirmar Operação</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Revise os dados antes de finalizar a liquidação</p>
          </div>

          <Card>
            <div className="space-y-6">
              {executionError && (
                <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm">
                  {executionError}
                </div>
              )}

              {/* Valor em destaque */}
              <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {isSale
                    ? 'Valor a ser creditado em conta'
                    : isRedeem
                    ? 'Valor patrimonial do resgate'
                    : 'Valor da operação'}
                </p>
                <p
                  className={`text-4xl font-extrabold ${
                    isSale
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-agro-azul-escuro dark:text-blue-400'
                  }`}
                >
                  {isSale ? '+' : ''}
                  {formatCurrency(amount)}
                </p>
              </div>

              {/* Detalhes */}
              <div className="space-y-3">
                <DetailRow
                  label="Tipo de operação"
                  value={
                    formData.type === 'pix'
                      ? 'PIX Instantâneo'
                      : formData.type === 'ted'
                      ? 'TED Bancária'
                      : formData.type === 'investment_rwa'
                      ? 'Aporte em Tokens RWA'
                      : formData.type === 'sell_rwa'
                      ? 'Venda / Liquidação de Tokens RWA'
                      : 'Resgate Físico de Commodities (Armazém)'
                  }
                />

                {selectedAsset && (formData.type === 'investment_rwa' || isSale || isRedeem) && (
                  <>
                    <DetailRow label="Ativo RWA" value={selectedAsset.assetName} />
                    <DetailRow
                      label="Cotação do Token"
                      value={formatCurrency(selectedAsset.pricePerToken)}
                    />
                    <DetailRow
                      label={
                        isSale
                          ? 'Tokens a serem debitados'
                          : isRedeem
                          ? 'Sacas/Tokens a retirar'
                          : 'Tokens a serem creditados'
                      }
                      value={`${isSale || isRedeem ? '-' : '+'}${tokenCalculations.tokens.toLocaleString('pt-BR')} ${selectedAsset.tokenSymbol}`}
                    />
                  </>
                )}

                {isRedeem && formData.warehouse && (
                  <DetailRow label="Armazém Credenciado" value={formData.warehouse} />
                )}

                {!isRedeem && (
                  <DetailRow
                    label={isSale ? 'Conta de Destino' : 'Beneficiário / Destino'}
                    value={formData.beneficiary || `${account.ownerName} (Saldo em Conta)`}
                  />
                )}

                {formData.memo && <DetailRow label="Observações" value={formData.memo} />}
              </div>

              {/* Impacto no Saldo */}
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-900 dark:text-blue-300">Saldo atual:</span>
                  <span className="font-semibold text-blue-900 dark:text-blue-300">
                    {formatCurrency(account.availableBalance)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-blue-200 dark:border-blue-900 pt-2">
                  <span className="text-blue-900 dark:text-blue-300 font-medium">
                    {isSale
                      ? 'Novo saldo após a venda:'
                      : isRedeem
                      ? 'Saldo financeiro mantido:'
                      : 'Saldo após a operação:'}
                  </span>
                  <span
                    className={`font-bold text-lg ${
                      isSale
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-blue-950 dark:text-blue-200'
                    }`}
                  >
                    {formatCurrency(newBalance)}
                  </span>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleBack}
                  variant="secondary"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleConfirm}
                  variant="primary"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Processando...'
                    : isSale
                    ? 'Confirmar Venda e Creditar'
                    : isRedeem
                    ? 'Emitir Certificado de Resgate'
                    : 'Confirmar e Transferir'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // ==================== TELA DE FORMULÁRIO ====================
  const availableQuickBeneficiaries =
    QUICK_BENEFICIARIES[operationType as keyof typeof QUICK_BENEFICIARIES] || [];

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Nova Operação</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Transfira via PIX/TED, aporte, venda ou resgate fisicamente seus tokens Real World Assets
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Spotlight contextual */}
            {operationType === 'sell_rwa' && selectedAsset ? (
              <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-green-700 dark:text-green-300 tracking-wider">
                    Venda RWA — Custódia Disponível
                  </p>
                  <p className="text-2xl font-black text-green-950 dark:text-green-100 mt-0.5">
                    {selectedAsset.quantity.toLocaleString('pt-BR')} tokens {selectedAsset.tokenSymbol}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">
                    Cotação a {formatCurrency(selectedAsset.pricePerToken)} • Valor total: {formatCurrency(selectedAsset.totalValue)}
                  </p>
                </div>
                <span className="text-3xl">💵</span>
              </div>
            ) : operationType === 'redeem_rwa' && selectedAsset ? (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-300 tracking-wider">
                    Resgate Físico de Commodities
                  </p>
                  <p className="text-2xl font-black text-amber-950 dark:text-amber-100 mt-0.5">
                    {selectedAsset.quantity.toLocaleString('pt-BR')} sacas em custódia
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                    Retirada física de grãos com emissão de Certificado CDA/WA
                  </p>
                </div>
                <span className="text-3xl">🚜</span>
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-blue-700 dark:text-blue-300 tracking-wider">
                    Saldo Disponível em Conta
                  </p>
                  <p className="text-2xl font-black text-blue-950 dark:text-blue-100 mt-0.5">
                    {formatCurrency(account.availableBalance)}
                  </p>
                </div>
                <span className="text-2xl">💰</span>
              </div>
            )}

            {/* Seletor de Tipo de operação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de operação *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {[
                  { id: 'pix', label: 'PIX', icon: '⚡', desc: 'Instantâneo' },
                  { id: 'ted', label: 'TED', icon: '🏦', desc: 'Bancário' },
                  { id: 'investment_rwa', label: 'Aporte RWA', icon: '🌾', desc: 'Comprar' },
                  { id: 'sell_rwa', label: 'Venda RWA', icon: '💵', desc: 'Liquidar' },
                  { id: 'redeem_rwa', label: 'Resgate Físico', icon: '🚜', desc: 'Retirar Grãos' },
                ].map((opt) => {
                  const isActive = operationType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleTypeChange(opt.id as OperationFormValues['type'])}
                      className={`
                        flex flex-col items-center justify-center p-2.5 border-2 rounded-xl cursor-pointer transition-all text-center
                        ${
                          isActive
                            ? 'border-agro-azul-escuro bg-blue-50 dark:bg-blue-950/40 text-agro-azul-escuro dark:text-blue-300 font-bold shadow-xs'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                        }
                      `}
                    >
                      <span className="text-lg mb-0.5">{opt.icon}</span>
                      <span className="text-xs font-bold leading-tight">{opt.label}</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
              {errors.type && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type.message}</p>}
            </div>

            {/* Ativo RWA (quando for Aporte, Venda ou Resgate) */}
            {(operationType === 'investment_rwa' ||
              operationType === 'sell_rwa' ||
              operationType === 'redeem_rwa') && (
              <div className="bg-agro-branco dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Selecione o Ativo de Agronegócio (RWA) *
                  </label>
                  {operationType === 'sell_rwa' && (
                    <span className="text-xs text-green-700 dark:text-green-400 font-medium">
                      Liquidação imediata a mercado
                    </span>
                  )}
                  {operationType === 'redeem_rwa' && (
                    <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                      Retirada de sacas físicas
                    </span>
                  )}
                </div>

                <select
                  {...register('assetId')}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-agro-azul-escuro bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  {portfolio.assets.map((asset) => (
                    <option key={asset.assetId} value={asset.assetId}>
                      {asset.assetName} ({asset.tokenSymbol}) — {formatCurrency(asset.pricePerToken)}/token • {asset.quantity} em carteira
                    </option>
                  ))}
                </select>

                {selectedAsset && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <div>
                      <span>Tokens em custódia: </span>
                      <strong className="text-gray-900 dark:text-gray-100">
                        {selectedAsset.quantity.toLocaleString('pt-BR')} {selectedAsset.tokenSymbol}
                      </strong>
                      <span className="text-gray-500 ml-1">({formatCurrency(selectedAsset.totalValue)})</span>
                    </div>
                    <div>
                      <span>24h: </span>
                      <strong
                        className={
                          selectedAsset.performance24h >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }
                      >
                        {selectedAsset.performance24h >= 0 ? '+' : ''}
                        {selectedAsset.performance24h}%
                      </strong>
                    </div>
                  </div>
                )}
                {errors.assetId && <p className="text-xs text-red-600 dark:text-red-400">{errors.assetId.message}</p>}
              </div>
            )}

            {/* Armazém Credenciado (Exclusivo para Resgate Físico) */}
            {operationType === 'redeem_rwa' && (
              <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-2">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Armazém Geral Credenciado para Carregamento *
                </label>
                <select
                  {...register('warehouse')}
                  className="w-full px-4 py-2.5 border border-amber-300 dark:border-amber-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  {mockWarehouses.map((wh) => (
                    <option key={wh.id} value={wh.name}>
                      {wh.name} — {wh.city}/{wh.state} (Capacidade: {wh.capacity})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  🌾 Ao confirmar, o Certificado CDA/WA emitido será vinculado ao armazém selecionado para agendamento do caminhão/frete.
                </p>
                {errors.warehouse && <p className="text-xs text-red-600 dark:text-red-400">{errors.warehouse.message}</p>}
              </div>
            )}

            {/* Beneficiário / Chave (Oculto em Resgate Físico e Venda, pois é automático) */}
            {operationType !== 'sell_rwa' && operationType !== 'redeem_rwa' && (
              <div>
                <Input
                  label={
                    operationType === 'investment_rwa'
                      ? 'Conta de Custódia / Smart Contract *'
                      : operationType === 'pix'
                      ? 'Chave PIX (CPF, CNPJ, Telefone, E-mail ou Aleatória) *'
                      : 'Dados Bancários do Destinatário *'
                  }
                  placeholder={
                    operationType === 'pix'
                      ? 'Ex: 123.456.789-00 ou chave aleatória'
                      : operationType === 'ted'
                      ? 'Ex: Banco 001 - Ag 1234 - C/C 12345-6'
                      : 'Ex: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
                  }
                  {...register('beneficiary')}
                  error={errors.beneficiary?.message}
                />

                {/* Sugestões rápidas de destinatários para demonstração */}
                {availableQuickBeneficiaries.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Sugestões rápidas para teste:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {availableQuickBeneficiaries.map((b) => (
                        <button
                          key={b.label}
                          type="button"
                          onClick={() => handleQuickBeneficiary(b.value)}
                          className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md transition-all cursor-pointer hover:shadow-xs active:scale-95 border border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                        >
                          + {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Valor da Operação */}
            <div>
              <Input
                label={
                  operationType === 'sell_rwa'
                    ? 'Valor a Vender (R$) *'
                    : operationType === 'redeem_rwa'
                    ? 'Valor Patrimonial a Resgatar (R$) *'
                    : 'Valor da Operação (R$) *'
                }
                placeholder="Ex: 5.000,00"
                {...register('amount')}
                error={errors.amount?.message}
              />

              {/* Atalhos Rápidos por Percentual (Venda e Resgate) */}
              {(operationType === 'sell_rwa' || operationType === 'redeem_rwa') && selectedAsset && (
                <div className="mt-2 flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Atalhos da posição:</span>
                  {QUICK_PERCENTAGES.map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleQuickPercentage(pct)}
                      className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium rounded-md transition-all cursor-pointer hover:shadow-xs active:scale-95 border border-gray-200 dark:border-gray-700"
                    >
                      {pct === 100 ? '100% (Tudo)' : `${pct}%`}
                    </button>
                  ))}
                </div>
              )}

              {/* Atalhos de valor rápido para PIX, TED e Aporte */}
              {(operationType === 'pix' || operationType === 'ted' || operationType === 'investment_rwa') && (
                <div className="mt-2 flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Valores rápidos:</span>
                  {QUICK_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickAmount(val)}
                      className="text-xs px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 font-medium rounded-md transition-all cursor-pointer hover:shadow-xs active:scale-95 border border-blue-100 dark:border-blue-900 hover:border-blue-200 dark:hover:border-blue-800"
                    >
                      + {formatCurrency(val)}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(account.availableBalance)}
                    className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium rounded-md transition-all cursor-pointer hover:shadow-xs active:scale-95 border border-gray-200 dark:border-gray-700"
                  >
                    Saldo Máximo
                  </button>
                </div>
              )}

              {/* Previews dinâmicos de tokens */}
              {operationType === 'investment_rwa' && selectedAsset && parsedCurrentAmount > 0 && (
                <p className="mt-2 text-xs font-semibold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/40 p-2.5 rounded-lg border border-green-200 dark:border-green-800">
                  🌾 Previsão de compra: ~{tokenCalculations.tokens.toLocaleString('pt-BR')}{' '}
                  {selectedAsset.tokenSymbol} a {formatCurrency(selectedAsset.pricePerToken)} cada.
                </p>
              )}

              {operationType === 'sell_rwa' && selectedAsset && parsedCurrentAmount > 0 && (
                <p className="mt-2 text-xs font-semibold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/40 p-2.5 rounded-lg border border-green-200 dark:border-green-800">
                  💵 Liquidação: ~{tokenCalculations.tokens.toLocaleString('pt-BR')}{' '}
                  {selectedAsset.tokenSymbol} a {formatCurrency(selectedAsset.pricePerToken)}. Você receberá{' '}
                  <strong>{formatCurrency(tokenCalculations.estimatedBrl)}</strong> creditados em seu saldo.
                </p>
              )}

              {operationType === 'redeem_rwa' && selectedAsset && parsedCurrentAmount > 0 && (
                <p className="mt-2 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800">
                  🚜 Retirada física: ~{tokenCalculations.tokens.toLocaleString('pt-BR')}{' '}
                  sacas de {selectedAsset.assetName}. Queima de tokens com emissão de Certificado CDA/WA no armazém.
                </p>
              )}
            </div>

            {/* Observações / Memo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição ou Memo (opcional)
              </label>
              <textarea
                {...register('memo')}
                rows={2}
                placeholder={
                  operationType === 'redeem_rwa'
                    ? 'Ex: Placa do caminhão ABC-1234, Transportadora Safra Sul...'
                    : 'Ex: Pagamento de insumos agrícolas safra 2026...'
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-agro-azul-escuro resize-none text-sm placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                onClick={() => router.push('/dashboard')}
                variant="secondary"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" className="flex-1">
                {operationType === 'sell_rwa'
                  ? 'Revisar Venda →'
                  : operationType === 'redeem_rwa'
                  ? 'Revisar Resgate Físico →'
                  : 'Revisar Operação →'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}

// Componente auxiliar para linhas de detalhes
const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-start py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
    <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-right max-w-xs">{value}</span>
  </div>
);