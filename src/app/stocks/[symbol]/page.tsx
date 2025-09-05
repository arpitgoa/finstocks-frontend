'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface StockData {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  market_cap: number | null;
  latest_price?: {
    close_price: number;
    date: string;
    volume: number;
  };
  fundamentals?: {
    pe_ratio: number;
    pb_ratio: number;
    eps: number;
    dividend_yield: number;
    roe: number;
  };
}

interface ETFHolding {
  etf_symbol: string;
  weight_percentage: number;
  etfs: {
    name: string;
    category: string;
  };
}

export default function StockPage() {
  const params = useParams();
  const symbol = (params.symbol as string).toUpperCase();
  
  const [stock, setStock] = useState<StockData | null>(null);
  const [etfHoldings, setEtfHoldings] = useState<ETFHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stockRes, etfRes] = await Promise.all([
          fetch(`http://localhost:8000/api/stocks/${symbol}`),
          fetch(`http://localhost:8000/api/stocks/${symbol}/etfs`)
        ]);
        
        if (!stockRes.ok) {
          throw new Error('Stock not found');
        }
        
        const stockData = await stockRes.json();
        const etfData = await etfRes.json();
        
        setStock(stockData);
        setEtfHoldings(etfData);
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

  if (error || !stock) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href="/stocks" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Stocks
        </Link>
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">{error || 'Stock not found'}</p>
        </div>
      </div>
    );
  }

  const formatMarketCap = (marketCap: number | null) => {
    if (!marketCap) return 'N/A';
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(1)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(1)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(1)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/stocks" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Stocks
      </Link>

      {/* Stock Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{stock.symbol}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">{stock.name}</p>
          </div>
          {stock.latest_price && (
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stock.latest_price.close_price.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(stock.latest_price.date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
        <div className="flex gap-4 text-sm">
          <Link href={`/sectors/${encodeURIComponent(stock.sector)}`} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
            {stock.sector}
          </Link>
          <Link href={`/stocks?search=${encodeURIComponent(stock.industry)}`} className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            {stock.industry}
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Market Cap</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {formatMarketCap(stock.market_cap)}
          </p>
        </div>

        {stock.latest_price && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Volume</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {stock.latest_price.volume.toLocaleString()}
            </p>
          </div>
        )}

        {stock.fundamentals?.pe_ratio && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">P/E Ratio</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {stock.fundamentals.pe_ratio.toFixed(2)}
            </p>
          </div>
        )}

        {stock.fundamentals?.dividend_yield && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dividend Yield</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {stock.fundamentals.dividend_yield.toFixed(2)}%
            </p>
          </div>
        )}
      </div>

      {/* Fundamentals */}
      {stock.fundamentals && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Fundamentals</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">P/B Ratio</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {stock.fundamentals.pb_ratio?.toFixed(2) || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">EPS</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                ${stock.fundamentals.eps?.toFixed(2) || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ROE</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {stock.fundamentals.roe?.toFixed(2) || 'N/A'}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ETF Holdings */}
      {etfHoldings.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            ETF Holdings ({etfHoldings.length})
          </h2>
          <div className="space-y-3">
            {etfHoldings.map((holding) => (
              <div key={holding.etf_symbol} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <Link href={`/etfs/${holding.etf_symbol}`} className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                    {holding.etf_symbol}
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{holding.etfs.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {holding.weight_percentage.toFixed(2)}%
                  </p>
                  <Link href={`/etfs/category/${encodeURIComponent(holding.etfs.category)}`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    {holding.etfs.category}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
