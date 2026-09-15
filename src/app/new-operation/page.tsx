'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { createOperationSchema, OperationFormValues } from '@/lib/validations';
import { formatCurrency, parseAmount } from '@/lib/utils';
import { useAgroFinanceStore } from '@/lib/store';
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
    return createOperationSchema(account.availableBalance);
  }, [account.availableBalance]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OperationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'pix',
      beneficiary: '',
      amount: '',
      memo: '',
      assetId: '',
    },
  });

  // Preenche ativo automaticamente se vier de link externo ou dashboard (?asset=ID)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const assetParam = params.get('asset');
    if (assetParam && portfolio.assets.some((a) => a.assetId === assetParam)) {
      setValue('type', 'investment_rwa');
      setValue('assetId', assetParam);
      setValue('beneficiary', QUICK_BENEFICIARIES.investment_rwa[0].value);
    }
  }, [portfolio.assets, setValue]);

  const operationType = watch('type');
  const currentAmountStr = watch('amount');
  const selectedAssetId = watch('assetId');

  const selectedAsset = useMemo(() => {
    return portfolio.assets.find((a) => a.assetId === selectedAssetId);
  }, [portfolio.assets, selectedAssetId]);

  const parsedCurrentAmount = useMemo(() => {
    return parseAmount(currentAmountStr || '0');
  }, [currentAmountStr]);

  const projectedTokens = useMemo(() => {
    if (operationType === 'investment_rwa' && selectedAsset && parsedCurrentAmount > 0) {
      return Math.floor(parsedCurrentAmount / selectedAsset.pricePerToken);
    }
    return 0;
  }, [operationType, selectedAsset, parsedCurrentAmount]);

  // Submit do formulário - vai para tela de confirmação
  const onSubmit = (data: OperationFormValues) => {
    setFormData(data);
    setExecutionError(null);
    setStep('confirm');
  };

  // Confirma operação
  const handleConfirm = async () => {
    if (!formData) return;
    setIsSubmitting(true);
    setExecutionError(null);

    // Simula latência de rede/transação
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

  // Preenchimento rápido de valor
  const handleQuickAmount = (val: number) => {
    const formatted = val.toLocaleString('pt-BR', {
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
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="text-center py-10 px-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Operação Realizada com Sucesso!
              </h2>
              <p className="text-gray-600 mb-6">
                Sua movimentação de{' '}
                <strong className="text-gray-900">{formatCurrency(executedTx.amount)}</strong> foi
                confirmada e liquidada em tempo real.
              </p>

              {/* Resumo do comprovante */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-left mb-8 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ID da Transação:</span>
                  <span className="font-mono font-bold text-gray-900">{executedTx.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tipo:</span>
                  <span className="font-semibold text-gray-900 uppercase">
                    {executedTx.category}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Destino / Beneficiário:</span>
                  <span className="font-medium text-gray-900">{executedTx.toAddress}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span className="text-green-600 font-bold">Concluído</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-sm">
                  <span className="text-gray-600">Novo Saldo Disponível:</span>
                  <span className="font-bold text-agro-azul-escuro">
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
    const newBalance = account.availableBalance - amount;

    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Confirmar Operação</h1>
            <p className="text-gray-600 mt-1">Revise os dados antes de finalizar a liquidação</p>
          </div>

          <Card>
            <div className="space-y-6">
              {executionError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {executionError}
                </div>
              )}

              {/* Valor em destaque */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                <p className="text-sm text-gray-600 mb-1">Valor da operação</p>
                <p className="text-4xl font-extrabold text-agro-azul-escuro">
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
                      : 'Investimento em Token RWA'
                  }
                />
                <DetailRow label="Beneficiário / Destino" value={formData.beneficiary} />
                {formData.memo && <DetailRow label="Observações" value={formData.memo} />}

                {formData.type === 'investment_rwa' && selectedAsset && (
                  <>
                    <DetailRow label="Ativo Selecionado" value={selectedAsset.assetName} />
                    <DetailRow
                      label="Cotação do Token"
                      value={formatCurrency(selectedAsset.pricePerToken)}
                    />
                    <DetailRow
                      label="Tokens a serem creditados"
                      value={`+${projectedTokens.toLocaleString('pt-BR')} ${selectedAsset.tokenSymbol}`}
                    />
                  </>
                )}
              </div>

              {/* Impacto no Saldo */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-900">Saldo atual:</span>
                  <span className="font-semibold text-blue-900">
                    {formatCurrency(account.availableBalance)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-blue-200 pt-2">
                  <span className="text-blue-900 font-medium">Saldo após a operação:</span>
                  <span className="font-bold text-lg text-blue-950">
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
                  {isSubmitting ? 'Processando transação...' : 'Confirmar e Transferir'}
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
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Nova Operação</h1>
          <p className="text-gray-600 mt-1">
            Transfira via PIX/TED ou invista diretamente em Real World Assets (RWA)
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Saldo disponível em destaque */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-blue-700 tracking-wider">
                  Saldo Disponível em Conta
                </p>
                <p className="text-2xl font-black text-blue-950 mt-0.5">
                  {formatCurrency(account.availableBalance)}
                </p>
              </div>
              <span className="text-2xl">💰</span>
            </div>

            {/* Tipo de operação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de operação *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label
                  className={`
                  flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all text-center
                  ${
                    operationType === 'pix'
                      ? 'border-agro-azul-escuro bg-blue-50 text-agro-azul-escuro font-bold shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }
                `}
                >
                  <input type="radio" value="pix" {...register('type')} className="sr-only" />
                  <span className="text-lg mb-0.5">⚡</span>
                  <span className="text-sm">PIX</span>
                </label>

                <label
                  className={`
                  flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all text-center
                  ${
                    operationType === 'ted'
                      ? 'border-agro-azul-escuro bg-blue-50 text-agro-azul-escuro font-bold shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }
                `}
                >
                  <input type="radio" value="ted" {...register('type')} className="sr-only" />
                  <span className="text-lg mb-0.5">🏦</span>
                  <span className="text-sm">TED</span>
                </label>

                <label
                  className={`
                  flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all text-center
                  ${
                    operationType === 'investment_rwa'
                      ? 'border-agro-azul-escuro bg-blue-50 text-agro-azul-escuro font-bold shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }
                `}
                >
                  <input
                    type="radio"
                    value="investment_rwa"
                    {...register('type')}
                    className="sr-only"
                  />
                  <span className="text-lg mb-0.5">🌾</span>
                  <span className="text-sm">Investir RWA</span>
                </label>
              </div>
              {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
            </div>

            {/* Ativo RWA (quando for investimento) */}
            {operationType === 'investment_rwa' && (
              <div className="bg-agro-branco border border-gray-200 rounded-xl p-4 space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Selecione o Ativo de Agronegócio (RWA) *
                </label>
                <select
                  {...register('assetId')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agro-azul-escuro bg-white"
                >
                  <option value="">Selecione um ativo disponível na safra...</option>
                  {portfolio.assets.map((asset) => (
                    <option key={asset.assetId} value={asset.assetId}>
                      {asset.assetName} ({asset.tokenSymbol}) — {formatCurrency(asset.pricePerToken)}/token
                    </option>
                  ))}
                </select>

                {selectedAsset && (
                  <div className="text-xs text-gray-600 bg-white p-3 rounded-lg border border-gray-100 flex justify-between">
                    <span>
                      Tokens em custódia:{' '}
                      <strong className="text-gray-900">
                        {selectedAsset.quantity.toLocaleString('pt-BR')} {selectedAsset.tokenSymbol}
                      </strong>
                    </span>
                    <span>
                      Variação 24h:{' '}
                      <strong
                        className={
                          selectedAsset.performance24h >= 0 ? 'text-green-600' : 'text-red-600'
                        }
                      >
                        {selectedAsset.performance24h >= 0 ? '+' : ''}
                        {selectedAsset.performance24h}%
                      </strong>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Beneficiário / Chave */}
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
                  <p className="text-xs text-gray-500 mb-1.5">Sugestões rápidas para teste:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {availableQuickBeneficiaries.map((b) => (
                      <button
                        key={b.label}
                        type="button"
                        onClick={() => handleQuickBeneficiary(b.value)}
                        className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-all cursor-pointer hover:shadow-xs active:scale-95 border border-transparent hover:border-gray-300"
                      >
                        + {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Valor */}
            <div>
              <Input
                label="Valor da Operação (R$) *"
                placeholder="Ex: 5.000,00"
                {...register('amount')}
                error={errors.amount?.message}
              />

              {/* Atalhos de valor rápido */}
              <div className="mt-2 flex flex-wrap gap-2 items-center">
                <span className="text-xs text-gray-500">Valores rápidos:</span>
                {QUICK_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAmount(val)}
                    className="text-xs px-2.5 py-1 bg-blue-50 text-blue-800 hover:bg-blue-100 font-medium rounded-md transition-all cursor-pointer hover:shadow-xs active:scale-95 border border-blue-100 hover:border-blue-200"
                  >
                    + {formatCurrency(val)}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleQuickAmount(account.availableBalance)}
                  className="text-xs px-2.5 py-1 bg-gray-100 text-gray-800 hover:bg-gray-200 font-medium rounded-md transition-all cursor-pointer hover:shadow-xs active:scale-95 border border-gray-200"
                >
                  Saldo Máximo
                </button>
              </div>

              {/* Preview de tokens adquiridos se for investimento */}
              {operationType === 'investment_rwa' && selectedAsset && parsedCurrentAmount > 0 && (
                <p className="mt-2 text-xs font-semibold text-green-700 bg-green-50 p-2 rounded-lg border border-green-200">
                  🌾 Previsão de compra: ~{projectedTokens.toLocaleString('pt-BR')}{' '}
                  {selectedAsset.tokenSymbol} a {formatCurrency(selectedAsset.pricePerToken)} cada.
                </p>
              )}
            </div>

            {/* Observações / Memo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição ou Memo (opcional)
              </label>
              <textarea
                {...register('memo')}
                rows={2}
                placeholder="Ex: Pagamento de insumos agrícolas safra 2026..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agro-azul-escuro resize-none text-sm"
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
                Revisar Operação →
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
  <div className="flex justify-between items-start py-2.5 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-sm font-semibold text-gray-900 text-right max-w-xs">{value}</span>
  </div>
);