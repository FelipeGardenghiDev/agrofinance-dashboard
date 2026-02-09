'use client';

import { Transaction } from '@/lib/types';
import { formatCurrency, formatDateTime, translateStatus, translateCategory, translateTransactionType, truncateHash } from '@/lib/utils';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

const TransactionDetailModal = ({ transaction, onClose }: TransactionDetailModalProps) => {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Detalhes da Transação</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status e Tipo */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <Badge variant={transaction.status === 'completed' ? 'success' : 'warning'}>
                {translateStatus(transaction.status)}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Tipo</p>
              <Badge variant={transaction.type === 'IN' ? 'success' : 'error'}>
                {translateTransactionType(transaction.type)}
              </Badge>
            </div>
          </div>

          {/* Valor */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Valor</p>
            <p className={`text-3xl font-bold ${
              transaction.type === 'IN' ? 'text-green-600' : 'text-red-600'
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
            <p className="text-sm font-medium text-gray-700 mb-2">Descrição</p>
            <p className="text-gray-900">{transaction.description}</p>
          </div>

          {/* Memo */}
          {transaction.memo && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Observações</p>
              <p className="text-gray-600 text-sm">{transaction.memo}</p>
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">Hash da Transação (Blockchain)</p>
              <p className="text-blue-700 font-mono text-sm break-all">{transaction.txHash}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
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
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className="text-gray-900 font-medium">{value}</p>
  </div>
);

export default TransactionDetailModal;