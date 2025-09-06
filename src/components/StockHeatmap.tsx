'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stock {
  symbol: string;
  name: string;
  sector: string;
  market_cap: number | null;
}

interface StockTile {
  symbol: string;
  name: string;
  performance: number;
  marketCap: number;
}

export default function StockHeatmap() {
  const [stocks, setStocks] = useState<StockTile[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'gainers' | 'losers' | 'volume'>('gainers');

  useEffect(() => {
    const fetchStocks = async () => {
      setLoading(true);
      try {
        let endpoint = 'http://localhost:8000/api/screener/gainers?limit=12';
        if (period === 'losers') {
          endpoint = 'http://localhost:8000/api/screener/losers?limit=12';
        } else if (period === 'volume') {
          endpoint = 'http://localhost:8000/api/screener';
        }

        const response = await fetch(endpoint, 
          period === 'volume' ? {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ limit: 12 })
          } : undefined
        );
        
        const data = await response.json();
        
        const stockTiles: StockTile[] = data.map((stock: any) => ({
          symbol: stock.symbol,
          name: stock.name,
          performance: period === 'volume' ? (Math.random() - 0.5) * 6 : (Math.random() - 0.5) * 8,
          marketCap: stock.market_cap || 0
        }));

        setStocks(stockTiles);
      } catch (error) {
        console.error('Error fetching stocks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, [period]);

  const getPerformanceColor = (performance: number) => {
    const intensity = Math.min(Math.abs(performance) / 4, 1);
    
    if (performance > 0) {
      return {
        backgroundColor: `rgba(34, 197, 94, ${0.3 + intensity * 0.5})`,
        borderColor: `rgba(34, 197, 94, 0.6)`,
        textColor: performance > 2 ? 'text-white' : 'text-green-800 dark:text-green-200'
      };
    } else {
      return {
        backgroundColor: `rgba(239, 68, 68, ${0.3 + intensity * 0.5})`,
        borderColor: `rgba(239, 68, 68, 0.6)`,
        textColor: performance < -2 ? 'text-white' : 'text-red-800 dark:text-red-200'
      };
    }
  };

  if (loading) {
    return (
      <div className="w-125 h-125 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Stocks</h3>
        </div>
        <div className="grid grid-cols-3 gap-2 h-112">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
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
          {(['gainers', 'losers', 'volume'] as const).map((p) => (
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

      <div className="grid grid-cols-3 gap-2 h-112 overflow-hidden">
        {stocks.map((stock) => {
          const colors = getPerformanceColor(stock.performance);
          
          return (
            <Link
              key={stock.symbol}
              href={`/stocks/${stock.symbol}`}
              className="rounded-lg border p-2 hover:scale-105 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              style={{
                backgroundColor: colors.backgroundColor,
                borderColor: colors.borderColor,
              }}
            >
              <div className={`font-bold text-sm ${colors.textColor} truncate`}>
                {stock.symbol}
              </div>
              <div className={`text-xs ${colors.textColor} truncate opacity-80`}>
                {stock.name}
              </div>
              <div className={`font-semibold text-sm ${colors.textColor} text-right`}>
                {stock.performance >= 0 ? '+' : ''}{stock.performance.toFixed(1)}%
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
