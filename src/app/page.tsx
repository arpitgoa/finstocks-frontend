'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import StockCard from '@/components/StockCard';
import SectorCard from '@/components/SectorCard';
import MarketHeatmap from '@/components/MarketHeatmap';
import SectorTable from '@/components/SectorTable';
import StockTable from '@/components/StockTable';
import MarketIndices from '@/components/MarketIndices';

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
          fetch('http://localhost:8000/api/screener', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ limit: 6 })
          }),
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
      <div className="text-center mb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl"></div>
        <div className="relative z-10 py-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
              Financial Market
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">Dashboard</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Real-time insights into stocks, ETFs, and market sectors with comprehensive analysis tools.
            Make informed investment decisions with our modern financial platform.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/stocks" className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105">
              Explore Stocks
            </Link>
            <Link href="/screener" className="px-8 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-white/20 dark:hover:bg-gray-800/70 transition-all">
              Stock Screener
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <Link href="/stocks">
          <div className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 card-hover">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg group-hover:shadow-green-500/25 transition-all">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Market Cap</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">$2.1T</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/stocks">
          <div className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 card-hover">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg group-hover:shadow-blue-500/25 transition-all">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Stocks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">55+</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/etfs">
          <div className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 card-hover">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg group-hover:shadow-purple-500/25 transition-all">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">ETFs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">36</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/sectors">
          <div className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 card-hover">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg group-hover:shadow-orange-500/25 transition-all">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sectors</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">11</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Market Indices */}
      <MarketIndices />

      {/* Market Heatmaps Section */}
      <div className="flex flex-col xl:flex-row gap-8 mb-16 justify-center">
        <MarketHeatmap />
        <SectorTable />
        <StockTable />
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
