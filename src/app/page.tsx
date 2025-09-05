'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import StockCard from '@/components/StockCard';
import SectorCard from '@/components/SectorCard';

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
}

export default function Home() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stocksRes, sectorsRes] = await Promise.all([
          fetch('http://localhost:8000/api/screener/gainers?limit=6'),
          fetch('http://localhost:8000/api/sectors/top-performers?limit=4')
        ]);
        
        const stocksData = await stocksRes.json();
        const sectorsData = await sectorsRes.json();
        
        setStocks(stocksData);
        setSectors(sectorsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Financial Market Dashboard
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Real-time insights into stocks, ETFs, and market sectors with comprehensive analysis tools
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Link href="/stocks">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Market Cap</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">$2.1T</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/stocks">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Stocks</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">55+</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/etfs">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">ETFs</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">36</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/sectors">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <TrendingDown className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sectors</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">11</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Top Performing Sectors */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Top Performing Sectors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))
          ) : (
            sectors.map((sector) => (
              <SectorCard key={sector.name} sector={sector} />
            ))
          )}
        </div>
      </div>

      {/* Featured Stocks */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Featured Stocks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))
          ) : (
            stocks.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
