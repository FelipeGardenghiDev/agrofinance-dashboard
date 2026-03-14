'use client';

import { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import TransactionFilters, { FilterState } from '../components/features/TransactionFilters';
import TransactionDetailModal from '../components/features/TransactionDetailModal';
import { mockTransactions, simulateApiDelay, getFilteredTransactions } from '@/lib/mockData';
import { formatCurrency, formatRelativeDate, translateStatus, translateTransactionType, sortBy } from '@/lib/utils';
import type { Transaction, SortField, SortDirection } from '@/lib/types';

export default function TransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await simulateApiDelay(600);
      
      setTransactions(mockTransactions);
      setFilteredTransactions(mockTransactions);
      
      setLoading(false);
    };

    loadData();
  }, []);

  // Aplicar filtros
  const handleFilterChange = (filters: FilterState) => {
    const filtered = getFilteredTransactions(filters);
    setFilteredTransactions(filtered);
  };

  // Aplicar ordenação
  const handleSort = (field: SortField) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    
    const sorted = sortBy(filteredTransactions, field, newDirection);
    setFilteredTransactions(sorted);
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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transações</h1>
          <p className="text-gray-600 mt-1">Histórico completo de movimentações</p>
        </div>

        {/* Filtros */}
        <TransactionFilters onFilterChange={handleFilterChange} />

        {/* Resumo */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <p>
            Mostrando <span className="font-semibold text-gray-900">{filteredTransactions.length}</span> de{' '}
            <span className="font-semibold text-gray-900">{transactions.length}</span> transações
          </p>
        </div>

        {/* Lista de Transações */}
        {filteredTransactions.length === 0 ? (
          // Estado Vazio
          <Card>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📭</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma transação encontrada</h3>
              <p className="text-gray-600">Tente ajustar os filtros para ver mais resultados.</p>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      <button
                        onClick={() => handleSort('date')}
                        className="flex items-center space-x-1 hover:text-agro-azul-escuros transition-colors"
                      >
                        <span>Data</span>
                        {sortField === 'date' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Descrição</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipo</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      <button
                        onClick={() => handleSort('amount')}
                        className="flex items-center justify-end space-x-1 hover:text-agro-azul transition-colors ml-auto"
                      >
                        <span>Valor</span>
                        {sortField === 'amount' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr 
                      key={transaction.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-900">{formatRelativeDate(transaction.date)}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        {transaction.memo && (
                          <p className="text-xs text-gray-500 mt-1">{transaction.memo}</p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={transaction.type === 'IN' ? 'success' : 'error'}>
                          {translateTransactionType(transaction.type)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'IN' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'IN' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge variant={transaction.status === 'completed' ? 'success' : 'warning'}>
                          {translateStatus(transaction.status)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => setSelectedTransaction(transaction)}
                          className="text-gray-500 hover:text-gray-900 font-medium text-sm hover:cursor-pointer transition-colors"
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
      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </MainLayout>
  );
}