'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface ETFData {
  symbol: string;
  name: string;
  category: string;
  expense_ratio: number;
  aum: number;
  latest_price?: {
    close_price: number;
    date: string;
    volume: number;
  };
}

interface Holding {
  stock_symbol: string;
  weight_percentage: number;
  stocks: {
    name: string;
    sector: string;
    market_cap: number | null;
  };
}

export default function ETFPage() {
  const params = useParams();
  const symbol = (params.symbol as string).toUpperCase();
  
  const [etf, setEtf] = useState<ETFData | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [etfRes, holdingsRes] = await Promise.all([
          fetch(`http://localhost:8000/api/etfs/${symbol}`),
          fetch(`http://localhost:8000/api/etfs/${symbol}/holdings?limit=20`)
        ]);
        
        if (!etfRes.ok) {
          throw new Error('ETF not found');
        }
        
        const etfData = await etfRes.json();
        const holdingsData = await holdingsRes.json();
        
        setEtf(etfData);
        setHoldings(holdingsData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-64"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-8 w-96"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !etf) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href="/etfs" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to ETFs
        </Link>
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">{error || 'ETF not found'}</p>
        </div>
      </div>
    );
  }

  const formatAUM = (aum: number) => {
    if (aum >= 1e12) return `$${(aum / 1e12).toFixed(1)}T`;
    if (aum >= 1e9) return `$${(aum / 1e9).toFixed(1)}B`;
    if (aum >= 1e6) return `$${(aum / 1e6).toFixed(1)}M`;
    return `$${aum.toLocaleString()}`;
  };

  const formatMarketCap = (marketCap: number | null | undefined) => {
    if (!marketCap) return 'N/A';
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(1)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(1)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(1)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/etfs" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to ETFs
      </Link>

      {/* ETF Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{etf.symbol}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">{etf.name}</p>
          </div>
          {etf.latest_price && (
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${etf.latest_price.close_price.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(etf.latest_price.date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
          {etf.category}
        </span>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assets Under Management</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {formatAUM(etf.aum)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expense Ratio</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {etf.expense_ratio.toFixed(2)}%
          </p>
        </div>

        {etf.latest_price && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Volume</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {etf.latest_price.volume.toLocaleString()}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Holdings</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {holdings.length}+
              </p>
            </div>
          </>
        )}
      </div>

      {/* Top Holdings */}
      {holdings.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Top Holdings ({holdings.length} shown)
          </h2>
          <div className="space-y-4">
            {holdings.map((holding, index) => (
              <div key={holding.stock_symbol} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <Link href={`/stocks/${holding.stock_symbol}`} className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                      {holding.stock_symbol}
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{holding.stocks.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      <Link href={`/sectors/${encodeURIComponent(holding.stocks.sector)}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                        {holding.stocks.sector}
                      </Link> • {formatMarketCap(holding.stocks.market_cap)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {holding.weight_percentage.toFixed(2)}%
                  </p>
                  <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(holding.weight_percentage * 4, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Link 
              href={`/etfs/${symbol}/holdings`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Holdings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
