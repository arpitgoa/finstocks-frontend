'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Sector {
  name: string;
  performance_1d: number;
  performance_1w: number;
  performance_1m: number;
  performance_ytd: number;
}

export default function SectorTable() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'1d' | '1w' | '1m' | 'ytd'>('1d');
  const [sortBy, setSortBy] = useState<'name' | 'change' | 'signal'>('change');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchSectors = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/api/sectors');
        const data = await response.json();
        setSectors(data);
      } catch (error) {
        console.error('Error fetching sectors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSectors();
  }, []);

  const getPerformanceValue = (sector: Sector) => {
    switch (period) {
      case '1d': return sector.performance_1d;
      case '1w': return sector.performance_1w;
      case '1m': return sector.performance_1m;
      case 'ytd': return sector.performance_ytd;
      default: return sector.performance_1d;
    }
  };

  const getSignal = (performance: number) => {
    if (performance > 3) return 'Strong Bull';
    if (performance > 1) return 'Bullish';
    if (performance > -1) return 'Neutral';
    if (performance > -3) return 'Bearish';
    return 'Strong Bear';
  };

  const handleSort = (column: 'name' | 'change' | 'signal') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getSortedSectors = () => {
    return [...sectors].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'change':
          aValue = getPerformanceValue(a);
          bValue = getPerformanceValue(b);
          break;
        case 'signal':
          aValue = getSignal(getPerformanceValue(a));
          bValue = getSignal(getPerformanceValue(b));
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
      }
    }).slice(0, 12);
  };

  const SortableHeader = ({ column, children }: { column: 'name' | 'change' | 'signal', children: React.ReactNode }) => (
    <th 
      className="text-left py-2 px-2 font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-colors"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center justify-between">
        {children}
        <div className="flex flex-col">
          <ChevronUp className={`h-3 w-3 ${sortBy === column && sortOrder === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} />
          <ChevronDown className={`h-3 w-3 ${sortBy === column && sortOrder === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} />
        </div>
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="w-125 h-125 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Sectors</h3>
        </div>
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-125 h-125 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Sectors</h3>
        
        <div className="flex bg-gray-100/50 dark:bg-gray-700/50 rounded-lg p-0.5">
          {(['1d', '1w', '1m', 'ytd'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                period === p
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="h-112 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm">
            <tr>
              <SortableHeader column="name">Sector</SortableHeader>
              <SortableHeader column="change">Change</SortableHeader>
              <SortableHeader column="signal">Signal</SortableHeader>
            </tr>
          </thead>
          <tbody>
            {getSortedSectors().map((sector) => {
                const performance = getPerformanceValue(sector);
                const signal = getSignal(performance);
                const isPositive = performance >= 0;
                
                return (
                  <tr key={sector.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-2 px-2">
                      <Link 
                        href={`/sectors/${encodeURIComponent(sector.name)}`}
                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate block"
                      >
                        {sector.name}
                      </Link>
                    </td>
                    <td className={`py-2 px-2 text-right font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {isPositive ? '+' : ''}{performance.toFixed(2)}%
                    </td>
                    <td className="py-2 px-2 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        signal.includes('Bull') ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                        signal.includes('Bear') ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}>
                        {signal}
                      </span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
