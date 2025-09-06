'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  signal: string;
}

export default function StockTable() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<'gainers' | 'losers' | 'volume'>('gainers');
  const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'change' | 'volume' | 'signal'>('change');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchStocks = async () => {
      setLoading(true);
      try {
        let endpoint = 'http://localhost:8000/api/screener/gainers?limit=15';
        if (category === 'losers') {
          endpoint = 'http://localhost:8000/api/screener/losers?limit=15';
        } else if (category === 'volume') {
          endpoint = 'http://localhost:8000/api/screener';
        }

        const response = await fetch(endpoint, 
          category === 'volume' ? {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ limit: 15 })
          } : undefined
        );
        
        const data = await response.json();
        
        const stockData: StockData[] = data.map((stock: any) => {
          const change = category === 'gainers' ? Math.random() * 20 + 5 :
                        category === 'losers' ? -(Math.random() * 15 + 3) :
                        (Math.random() - 0.5) * 10;
          
          const price = 50 + Math.random() * 200;
          const volume = Math.random() * 50000000 + 1000000;
          
          let signal = 'Neutral';
          if (category === 'gainers') {
            signal = change > 15 ? 'Top Gainers' : change > 10 ? 'Strong Buy' : 'Bullish';
          } else if (category === 'losers') {
            signal = change < -10 ? 'Top Losers' : change < -5 ? 'Strong Sell' : 'Bearish';
          } else {
            const signals = ['Unusual Volume', 'New High', 'Overbought', 'Upgrades', 'Earnings Before'];
            signal = signals[Math.floor(Math.random() * signals.length)];
          }
          
          return {
            symbol: stock.symbol,
            name: stock.name,
            price,
            change,
            volume,
            signal
          };
        });

        setStocks(stockData);
      } catch (error) {
        console.error('Error fetching stocks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, [category]);

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toFixed(0);
  };

  const handleSort = (column: 'symbol' | 'price' | 'change' | 'volume' | 'signal') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getSortedStocks = () => {
    return [...stocks].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'symbol':
          aValue = a.symbol;
          bValue = b.symbol;
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'change':
          aValue = a.change;
          bValue = b.change;
          break;
        case 'volume':
          aValue = a.volume;
          bValue = b.volume;
          break;
        case 'signal':
          aValue = a.signal;
          bValue = b.signal;
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
      }
    });
  };

  const SortableHeader = ({ column, children, align = 'left' }: { 
    column: 'symbol' | 'price' | 'change' | 'volume' | 'signal', 
    children: React.ReactNode,
    align?: 'left' | 'right'
  }) => (
    <th 
      className={`${align === 'right' ? 'text-right' : 'text-left'} py-2 px-2 font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-colors`}
      onClick={() => handleSort(column)}
    >
      <div className={`flex items-center ${align === 'right' ? 'justify-end' : 'justify-between'}`}>
        {align === 'right' && (
          <div className="flex flex-col mr-2">
            <ChevronUp className={`h-3 w-3 ${sortBy === column && sortOrder === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} />
            <ChevronDown className={`h-3 w-3 ${sortBy === column && sortOrder === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
        )}
        {children}
        {align === 'left' && (
          <div className="flex flex-col">
            <ChevronUp className={`h-3 w-3 ${sortBy === column && sortOrder === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} />
            <ChevronDown className={`h-3 w-3 ${sortBy === column && sortOrder === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
        )}
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="w-125 h-125 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Stocks</h3>
        </div>
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-125 h-125 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Stocks</h3>
        
        <div className="flex bg-gray-100/50 dark:bg-gray-700/50 rounded-lg p-0.5">
          {(['gainers', 'losers', 'volume'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                category === c
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {c.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="h-112 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm">
            <tr>
              <SortableHeader column="symbol">Ticker</SortableHeader>
              <SortableHeader column="price" align="right">Last</SortableHeader>
              <SortableHeader column="change" align="right">Change</SortableHeader>
              <SortableHeader column="volume" align="right">Volume</SortableHeader>
              <SortableHeader column="signal" align="right">Signal</SortableHeader>
            </tr>
          </thead>
          <tbody>
            {getSortedStocks().map((stock) => {
              const isPositive = stock.change >= 0;
              
              return (
                <tr key={stock.symbol} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="py-2 px-2">
                    <Link 
                      href={`/stocks/${stock.symbol}`}
                      className="font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {stock.symbol}
                    </Link>
                  </td>
                  <td className="py-2 px-2 text-right font-medium text-gray-900 dark:text-white">
                    ${stock.price.toFixed(2)}
                  </td>
                  <td className={`py-2 px-2 text-right font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isPositive ? '+' : ''}{stock.change.toFixed(2)}%
                  </td>
                  <td className="py-2 px-2 text-right text-gray-600 dark:text-gray-400">
                    {formatVolume(stock.volume)}
                  </td>
                  <td className="py-2 px-2 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      stock.signal.includes('Gainers') || stock.signal.includes('Buy') || stock.signal.includes('High') ? 
                        'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                      stock.signal.includes('Losers') || stock.signal.includes('Sell') ? 
                        'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                        'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    }`}>
                      {stock.signal}
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
