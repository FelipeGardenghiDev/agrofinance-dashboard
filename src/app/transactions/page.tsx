'use client';

import { useEffect, useState, useMemo } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import TransactionFilters, { FilterState } from '../components/features/TransactionFilters';
import TransactionDetailModal from '../components/features/TransactionDetailModal';
import { useAgroFinanceStore } from '@/lib/store';
import { 
  formatCurrency, 
  formatRelativeDate, 
  translateStatus, 
  translateTransactionType, 
  sortBy, 
  generateTransactionsCSV, 
  downloadCSV 
} from '@/lib/utils';
import type { Transaction, SortField, SortDirection } from '@/lib/types';

export default function TransactionsPage() {
  const [loading, setLoading] = useState(true);
  const account = useAgroFinanceStore((state) => state.account);
  const transactions = useAgroFinanceStore((state) => state.transactions);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    type: 'ALL',
    status: 'ALL',
    searchTerm: '',
  });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Deriva dados filtrados e ordenados de forma eficiente
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (filters.type && filters.type !== 'ALL') {
      result = result.filter((t) => t.type === filters.type);
    }
    if (filters.status && filters.status !== 'ALL') {
      result = result.filter((t) => t.status === filters.status);
    }
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(term) ||
          t.memo?.toLowerCase().includes(term) ||
          t.toAddress?.toLowerCase().includes(term)
      );
    }

    return sortBy(result, sortField, sortDirection);
  }, [transactions, filters, sortField, sortDirection]);

  // Aplicar filtros
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  // Aplicar ordenação
  const handleSort = (field: SortField) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  // Exportar dados filtrados para CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;
    const csvData = generateTransactionsCSV(filteredTransactions);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(csvData, `agrofinance-extrato-${dateStr}.csv`);
    setExportFeedback(`Extrato CSV exportado com sucesso (${filteredTransactions.length} registros)!`);
    setTimeout(() => setExportFeedback(null), 3500);
  };

  // Disparar impressão / salvar em PDF
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

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
      <div className="space-y-6">
        {/* Cabeçalho impresso exclusivo para modo de impressão */}
        <div className="print-only border-b-2 border-gray-900 pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">AgroFinance RWA Bank</h1>
              <p className="text-xs text-gray-600">Extrato Consolidado de Movimentações Financeiras</p>
              <p className="text-xs text-gray-700 mt-2">
                <strong>Titular:</strong> {account?.ownerName} &nbsp;|&nbsp; <strong>Conta:</strong> {account?.accountId}
              </p>
            </div>
            <div className="text-right text-xs text-gray-600">
              <p>Emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
              <p className="text-sm font-bold text-gray-900 mt-1">
                Saldo Disponível: {formatCurrency(account?.availableBalance || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Header com Ações de Exportação */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Transações</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Histórico completo de movimentações e liquidações</p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={filteredTransactions.length === 0}
              className="flex items-center gap-1.5"
            >
              <span>📥</span>
              <span>Exportar CSV</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">({filteredTransactions.length})</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-1.5"
            >
              <span>🖨️</span>
              <span>Imprimir / PDF</span>
            </Button>
          </div>
        </div>

        {/* Feedback de Exportação */}
        {exportFeedback && (
          <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 text-sm px-4 py-2.5 rounded-lg flex items-center justify-between no-print animate-fadeIn">
            <span className="flex items-center gap-2">
              <span>✅</span>
              <span>{exportFeedback}</span>
            </span>
            <button
              onClick={() => setExportFeedback(null)}
              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-200 font-bold cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Filtros */}
        <div className="no-print">
          <TransactionFilters onFilterChange={handleFilterChange} />
        </div>

        {/* Resumo */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <p>
            Mostrando <span className="font-semibold text-gray-900 dark:text-gray-100">{filteredTransactions.length}</span> de{' '}
            <span className="font-semibold text-gray-900 dark:text-gray-100">{transactions.length}</span> transações
          </p>
        </div>

        {/* Lista de Transações */}
        {filteredTransactions.length === 0 ? (
          // Estado Vazio
          <Card>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📭</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Nenhuma transação encontrada</h3>
              <p className="text-gray-600 dark:text-gray-400">Tente ajustar os filtros para ver mais resultados.</p>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <button
                        onClick={() => handleSort('date')}
                        className="flex items-center space-x-1 hover:text-agro-azul-escuro dark:hover:text-blue-400 transition-colors"
                      >
                        <span>Data</span>
                        {sortField === 'date' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Descrição</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Tipo</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <button
                        onClick={() => handleSort('amount')}
                        className="flex items-center justify-end space-x-1 hover:text-agro-azul-escuro dark:hover:text-blue-400 transition-colors ml-auto"
                      >
                        <span>Valor</span>
                        {sortField === 'amount' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 no-print">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr 
                      key={transaction.id} 
                      className="border-b border-gray-100 dark:border-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-900 dark:text-gray-100">{formatRelativeDate(transaction.date)}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{transaction.description}</p>
                        {transaction.memo && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{transaction.memo}</p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={transaction.type === 'IN' ? 'success' : 'error'}>
                          {translateTransactionType(transaction.type)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'IN' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.type === 'IN' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge variant={transaction.status === 'completed' ? 'success' : 'warning'}>
                          {translateStatus(transaction.status)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-center no-print">
                        <button
                          onClick={() => setSelectedTransaction(transaction)}
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium text-sm hover:cursor-pointer transition-colors"
                        >
                          Ver detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Modal de Detalhes */}
      <div className="no-print">
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      </div>
    </MainLayout>
  );
}