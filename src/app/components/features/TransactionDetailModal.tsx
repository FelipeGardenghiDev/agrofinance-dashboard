import { useEffect, useState } from 'react';
import { Transaction } from '@/lib/types';
import { formatCurrency, formatDateTime, translateStatus, translateCategory, translateTransactionType } from '@/lib/utils';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

const TransactionDetailModal = ({ transaction, onClose }: TransactionDetailModalProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!transaction) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [transaction, onClose]);

  if (!transaction) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-opacity"
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 id="modal-title" className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Detalhes da Transação
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Fechar modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status e Tipo */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
              <Badge variant={transaction.status === 'completed' ? 'success' : 'warning'}>
                {translateStatus(transaction.status)}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tipo</p>
              <Badge variant={transaction.type === 'IN' ? 'success' : 'error'}>
                {translateTransactionType(transaction.type)}
              </Badge>
            </div>
          </div>

          {/* Valor */}
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Valor</p>
            <p className={`text-3xl font-bold ${
              transaction.type === 'IN' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {transaction.type === 'IN' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </p>
          </div>

          {/* Informações Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="ID da Transação" value={transaction.id} />
            <InfoItem label="Data e Hora" value={formatDateTime(transaction.date)} />
            <InfoItem label="Categoria" value={translateCategory(transaction.category)} />
            {transaction.fee && <InfoItem label="Taxa" value={formatCurrency(transaction.fee)} />}
          </div>

          {/* Descrição */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descrição</p>
            <p className="text-gray-900 dark:text-gray-100">{transaction.description}</p>
          </div>

          {/* Memo */}
          {transaction.memo && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Observações</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{transaction.memo}</p>
            </div>
          )}

          {/* Endereços */}
          {transaction.fromAddress && (
            <InfoItem label="Origem" value={transaction.fromAddress} />
          )}
          {transaction.toAddress && (
            <InfoItem label="Destino" value={transaction.toAddress} />
          )}

          {/* Hash da Transação (blockchain) */}
          {transaction.txHash && (
            <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                  Hash da Transação (Blockchain)
                </p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(transaction.txHash!, 'hash')}
                  className="text-xs font-semibold text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-white transition-colors px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  {copiedField === 'hash' ? '✓ Copiado!' : 'Copiar'}
                </button>
              </div>
              <p className="text-blue-950 dark:text-blue-200 font-mono text-xs break-all">{transaction.txHash}</p>
            </div>
          )}

          {/* Banner de Resgate Físico */}
          {transaction.category === 'rwa_redemption' && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-xs space-y-1.5">
              <p className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <span>🚜</span>
                <span>Certificado de Resgate Físico Emitido (CDA / WA)</span>
              </p>
              <p className="text-amber-800 dark:text-amber-300">
                Esta operação executou o burn dos tokens e emitiu o direito de retirada física da commodity no armazém credenciado. Apresente este comprovante e o código da transação para liberação da carga.
              </p>
            </div>
          )}

          {/* Banner de Venda RWA */}
          {transaction.category === 'rwa_sale' && (
            <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl p-4 text-xs space-y-1.5">
              <p className="font-bold text-green-900 dark:text-green-200 flex items-center gap-1.5">
                <span>💵</span>
                <span>Liquidação Financeira RWA Concluída</span>
              </p>
              <p className="text-green-800 dark:text-green-300">
                Os tokens foram liquidados a mercado e o valor em moeda corrente foi integralmente creditado no saldo disponível da sua conta.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-800 px-6 py-4">
          <Button onClick={onClose} variant="primary" className="w-full">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar pra exibir infos
const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
    <p className="text-gray-900 dark:text-gray-100 font-medium">{value}</p>
  </div>
);

export default TransactionDetailModal;