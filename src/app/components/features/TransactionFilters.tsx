'use client';

import { useState } from 'react';
import Input from '../ui/Input';

interface TransactionFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  type: string;
  status: string;
  searchTerm: string;
}

const TransactionFilters = ({ onFilterChange }: TransactionFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    type: 'ALL',
    status: 'ALL',
    searchTerm: '',
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Filtros</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Filtro por Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tipo
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-agro-azul focus:border-transparent"
          >
            <option value="ALL">Todos</option>
            <option value="IN">Entrada</option>
            <option value="OUT">Saída</option>
          </select>
        </div>

        {/* Filtro por Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-agro-azul focus:border-transparent"
          >
            <option value="ALL">Todos</option>
            <option value="completed">Concluída</option>
            <option value="pending">Pendente</option>
            <option value="failed">Falhou</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>

        {/* Busca */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Buscar
          </label>
          <Input
            type="text"
            placeholder="Descrição ou memo..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;