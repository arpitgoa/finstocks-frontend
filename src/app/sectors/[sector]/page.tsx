'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import StockCard from '@/components/StockCard';

interface Stock {
  symbol: string;
  name: string;
  sector: string;
  market_cap: number | null;
}

interface Sector {
  name: string;
  performance_1d: number;
  performance_1w: number;
  performance_1m: number;
  performance_ytd: number;
}

export default function SectorPage() {
  const params = useParams();
  const sectorName = decodeURIComponent(params.sector as string);
  
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [sector, setSector] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stocksRes, sectorsRes] = await Promise.all([
          fetch(`http://localhost:8000/api/sectors/${encodeURIComponent(sectorName)}/stocks`),
          fetch('http://localhost:8000/api/sectors')
        ]);
        
        const stocksData = await stocksRes.json();
        const sectorsData = await sectorsRes.json();
        
        setStocks(stocksData);
        setSector(sectorsData.find((s: Sector) => s.name === sectorName) || null);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sectorName]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-64"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-8 w-96"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/sectors" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Sectors
      </Link>

      {/* Sector Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{sectorName}</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Performance metrics and stocks in the {sectorName} sector
        </p>
      </div>

      {/* Performance Cards */}
      {sector && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">1 Day</p>
                <p className={`text-2xl font-semibold ${sector.performance_1d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {sector.performance_1d >= 0 ? '+' : ''}{sector.performance_1d.toFixed(2)}%
                </p>
              </div>
              {sector.performance_1d >= 0 ? 
                <TrendingUp className="h-8 w-8 text-green-600" /> : 
                <TrendingDown className="h-8 w-8 text-red-600" />
              }
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">1 Week</p>
                <p className={`text-2xl font-semibold ${sector.performance_1w >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {sector.performance_1w >= 0 ? '+' : ''}{sector.performance_1w.toFixed(2)}%
                </p>
              </div>
              {sector.performance_1w >= 0 ? 
                <TrendingUp className="h-8 w-8 text-green-600" /> : 
                <TrendingDown className="h-8 w-8 text-red-600" />
              }
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">1 Month</p>
                <p className={`text-2xl font-semibold ${sector.performance_1m >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {sector.performance_1m >= 0 ? '+' : ''}{sector.performance_1m.toFixed(2)}%
                </p>
              </div>
              {sector.performance_1m >= 0 ? 
                <TrendingUp className="h-8 w-8 text-green-600" /> : 
                <TrendingDown className="h-8 w-8 text-red-600" />
              }
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">YTD</p>
                <p className={`text-2xl font-semibold ${sector.performance_ytd >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {sector.performance_ytd >= 0 ? '+' : ''}{sector.performance_ytd.toFixed(2)}%
                </p>
              </div>
              {sector.performance_ytd >= 0 ? 
                <TrendingUp className="h-8 w-8 text-green-600" /> : 
                <TrendingDown className="h-8 w-8 text-red-600" />
              }
            </div>
          </div>
        </div>
      )}

      {/* Stocks in Sector */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Stocks in {sectorName} ({stocks.length})
        </h2>
        
        {stocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stocks.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No stocks found in this sector</p>
          </div>
        )}
      </div>
    </div>
  );
}
