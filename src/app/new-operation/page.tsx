'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { operationSchema, OperationFormValues } from '@/lib/validations';
import { formatCurrency, parseAmount } from '@/lib/utils';
import { mockAccount, mockRWAAssets } from '@/lib/mockData';

export default function NewOperationPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [formData, setFormData] = useState<OperationFormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OperationFormValues>({
    resolver: zodResolver(operationSchema),
    defaultValues: {
      type: 'pix',
    },
  });

  const operationType = watch('type');

  // Submit do formulário - vai para tela de confirmação
  const onSubmit = (data: OperationFormValues) => {
    setFormData(data);
    setStep('confirm');
  };

  // Confirma operação
  const handleConfirm = async () => {
    setIsSubmitting(true);
    
    // Simula envio pra uma API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setStep('success');
  };

  // Volta pro form
  const handleBack = () => {
    setStep('form');
  };

  // Ir para transações
  const handleGoToTransactions = () => {
    router.push('/transactions');
  };

  // TELA DE SUCESSO
  if (step === 'success') {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Operação realizada com sucesso!</h2>
              <p className="text-gray-600 mb-8">
                Sua {formData?.type === 'pix' ? 'transferência PIX' : formData?.type === 'ted' ? 'TED' : 'investimento'} foi processada.
              </p>
              <div className="space-y-3">
                <Button onClick={handleGoToTransactions} variant="primary" className="w-full">
                  Ver transações
                </Button>
                <Button onClick={() => router.push('/dashboard')} variant="secondary" className="w-full">
                  Voltar ao dashboard
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // TELA DE CONFIRMAÇÃO
  if (step === 'confirm' && formData) {
    const amount = parseAmount(formData.amount);

    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Confirmar Operação</h1>
            <p className="text-gray-600 mt-1">Revise os dados antes de confirmar</p>
          </div>

          <Card>
            <div className="space-y-6">
              {/* Valor em destaque */}
              <div className="bg-agro-branco bg-opacity-10 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-600 mb-2">Valor da operação</p>
                <p className="text-4xl font-bold text-agro-azul-escuro">{formatCurrency(amount)}</p>
              </div>

              {/* Detalhes */}
              <div className="space-y-4">
                <DetailRow label="Tipo de operação" value={
                  formData.type === 'pix' ? 'PIX' : 
                  formData.type === 'ted' ? 'TED' : 
                  'Investimento RWA'
                } />
                <DetailRow label="Beneficiário/Destino" value={formData.beneficiary} />
                {formData.memo && <DetailRow label="Observações" value={formData.memo} />}
                {formData.type === 'investment_rwa' && formData.assetId && (
                  <DetailRow 
                    label="Ativo RWA" 
                    value={mockRWAAssets.find(a => a.assetId === formData.assetId)?.assetName || formData.assetId} 
                  />
                )}
              </div>

              {/* Saldo depois da operação */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Saldo atual:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(mockAccount.availableBalance)}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-gray-600">Saldo após operação:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(mockAccount.availableBalance - amount)}
                  </span>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
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
                  {isSubmitting ? 'Processando...' : 'Confirmar operação'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // TELA DE FORMULÁRIO
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Nova Operação</h1>
          <p className="text-gray-600 mt-1">Preencha os dados para realizar uma transferência ou investimento</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Saldo disponível */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-medium">Saldo disponível</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {formatCurrency(mockAccount.availableBalance)}
              </p>
            </div>

            {/* Tipo de operação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de operação *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label className={`
                  flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${operationType === 'pix' ? 'border-agro-azul bg-gray-100 bg-opacity-5' : 'border-gray-200 hover:border-gray-300'}
                `}>
                  <input
                    type="radio"
                    value="pix"
                    {...register('type')}
                    className="sr-only"
                  />
                  <span className="font-medium text-gray-900">PIX</span>
                </label>

                <label className={`
                  flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${operationType === 'ted' ? 'border-agro-azul bg-agro-gray-100 bg-opacity-5' : 'border-gray-200 hover:border-gray-300'}
                `}>
                  <input
                    type="radio"
                    value="ted"
                    {...register('type')}
                    className="sr-only"
                  />
                  <span className="font-medium text-gray-900">TED</span>
                </label>

                <label className={`
                  flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${operationType === 'investment_rwa' ? 'border-agro-azul bg-agro-gray-100 bg-opacity-5' : 'border-gray-200 hover:border-gray-300'}
                `}>
                  <input
                    type="radio"
                    value="investment_rwa"
                    {...register('type')}
                    className="sr-only"
                  />
                  <span className="font-medium text-gray-900">Investir</span>
                </label>
              </div>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            {/* Beneficiário */}
            <Input
              label={
                operationType === 'investment_rwa' 
                  ? 'Wallet Address / Conta' 
                  : 'CPF / Chave PIX / Conta'
              }
              placeholder={
                operationType === 'pix' 
                  ? '123.456.789-00' 
                  : operationType === 'ted'
                  ? 'Banco - Agência - Conta'
                  : '0x...'
              }
              {...register('beneficiary')}
              error={errors.beneficiary?.message}
            />

            {/* Valor */}
            <Input
              label="Valor (R$) *"
              placeholder="0,00"
              {...register('amount')}
              error={errors.amount?.message}
            />

            {/* Ativo RWA (só aparece se for investimento!!) */}
            {operationType === 'investment_rwa' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ativo RWA (opcional)
                </label>
                <select
                  {...register('assetId')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agro-azul focus:border-transparent"
                >
                  <option value="">Selecione um ativo</option>
                  {mockRWAAssets.map((asset) => (
                    <option key={asset.assetId} value={asset.assetId}>
                      {asset.assetName} ({asset.tokenSymbol})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações (opcional)
              </label>
              <textarea
                {...register('memo')}
                rows={3}
                placeholder="Adicione uma descrição ou memo..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-agro-azul focus:border-transparent resize-none"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="button"
                onClick={() => router.push('/dashboard')} 
                variant="secondary" 
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                className="flex-1"
              >
                Continuar
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
  <div className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-sm font-medium text-gray-900 text-right max-w-xs">{value}</span>
  </div>
);