'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ETF {
  symbol: string;
  name: string;
  category: string;
  expense_ratio: number;
  aum: number;
  leverage_ratio?: number;
  inception_date?: string;
}

type SortField = 'symbol' | 'name' | 'category' | 'expense_ratio' | 'aum';
type SortDirection = 'asc' | 'desc';

export default function ETFsPage() {
  const [etfs, setEtfs] = useState<ETF[]>([]);
  const [filteredEtfs, setFilteredEtfs] = useState<ETF[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortField, setSortField] = useState<SortField>('aum');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const categories = [
    'Broad Market', 'Technology', 'Healthcare', 'Financial', 'Energy',
    'Leveraged', 'International', 'Bond ETFs', 'Real Estate', 'Commodities',
    'Large Cap', 'Mid Cap', 'Small Cap', 'Sector ETFs'
  ];

  useEffect(() => {
    const fetchEtfs = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/etfs');
        const data = await response.json();
        setEtfs(data);
        setFilteredEtfs(data);
      } catch (error) {
        console.error('Error fetching ETFs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEtfs();
  }, []);

  useEffect(() => {
    let filtered = etfs;

    if (searchTerm) {
      filtered = filtered.filter(etf =>
        etf.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        etf.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(etf => etf.category === selectedCategory);
    }

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredEtfs(filtered);
  }, [etfs, searchTerm, selectedCategory, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatAUM = (aum: number) => {
    if (aum >= 1e12) return `$${(aum / 1e12).toFixed(1)}T`;
    if (aum >= 1e9) return `$${(aum / 1e9).toFixed(1)}B`;
    if (aum >= 1e6) return `$${(aum / 1e6).toFixed(1)}M`;
    return `$${aum.toLocaleString()}`;
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
    >
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">ETFs</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Explore exchange-traded funds with comprehensive data and performance metrics
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by symbol or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-300">
          Showing {filteredEtfs.length} ETFs
        </p>
      </div>

      {/* ETFs Table */}
      {loading ? (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="animate-pulse p-6">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex space-x-4 mb-3">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <SortButton field="symbol">Symbol</SortButton>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <SortButton field="name">Name</SortButton>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <SortButton field="category">Category</SortButton>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <SortButton field="aum">AUM</SortButton>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <SortButton field="expense_ratio">Expense Ratio</SortButton>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {filteredEtfs.map((etf) => (
                  <tr key={etf.symbol} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        href={`/etfs/${etf.symbol}`}
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                      >
                        {etf.symbol}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {etf.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full">
                        {etf.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatAUM(etf.aum)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {etf.expense_ratio.toFixed(2)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && filteredEtfs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No ETFs found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
