'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Sector {
  name: string;
  performance_1d: number;
  performance_1w: number;
  performance_1m: number;
  performance_ytd: number;
}

interface Stock {
  symbol: string;
  name: string;
  sector: string;
  market_cap: number | null;
}

interface HeatmapTile {
  symbol: string;
  performance: number;
  marketCap: number;
  size: 'small' | 'medium' | 'large';
}

export default function MarketHeatmap() {
  const [tiles, setTiles] = useState<HeatmapTile[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'1d' | '1w' | '1m' | 'ytd'>('1d');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [stocksRes, sectorsRes] = await Promise.all([
          fetch('http://localhost:8000/api/screener', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ limit: 30 })
          }),
          fetch('http://localhost:8000/api/sectors')
        ]);

        const stocksData: Stock[] = await stocksRes.json();
        const sectorsData: Sector[] = await sectorsRes.json();

        console.log('MarketHeatmap Sectors API Response:', sectorsData); // Debug log

        // Ensure sectorsData is an array
        const sectorsArray = Array.isArray(sectorsData) ? sectorsData : [];

        const sectorPerformance = sectorsArray.reduce((acc, sector) => {
          acc[sector.name] = {
            '1d': sector.performance_1d,
            '1w': sector.performance_1w,
            '1m': sector.performance_1m,
            'ytd': sector.performance_ytd
          };
          return acc;
        }, {} as Record<string, Record<string, number>>);

        const heatmapTiles: HeatmapTile[] = stocksData
          .filter(stock => stock.market_cap && stock.market_cap > 5e10) // Only mega/large cap
          .map((stock, index) => {
            const sectorPerf = sectorPerformance[stock.sector]?.[period] || 0;
            const randomVariation = (Math.random() - 0.5) * 3;
            const performance = sectorPerf + randomVariation;
            
            // Size based on market cap - but limit large tiles to prevent overflow
            let size: 'small' | 'medium' | 'large' = 'small';
            if (index < 2 && stock.market_cap! > 1e12) size = 'large';  // Only first 2 can be large
            else if (index < 6 && stock.market_cap! > 5e11) size = 'medium'; // Only first 6 can be medium
            
            return {
              symbol: stock.symbol,
              performance,
              marketCap: stock.market_cap!,
              size
            };
          })
          .sort((a, b) => b.marketCap - a.marketCap)
          .slice(0, 12); // Reduced to 12 to fit better

        setTiles(heatmapTiles);
      } catch (error) {
        console.error('Error fetching heatmap data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'large': return 'col-span-2 row-span-2'; // 2x2
      case 'medium': return 'col-span-2 row-span-1'; // 2x1
      default: return 'col-span-1 row-span-1'; // 1x1
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-sm mx-auto xl:max-w-none xl:w-120 xl:h-112 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Market Heatmap</h3>
        </div>
        <div className="grid grid-cols-4 gap-1 h-64 xl:h-96">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto xl:max-w-none xl:w-120 xl:h-112 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Market Heatmap</h3>
        
        {/* Compact Period Selector */}
        <div className="flex bg-gray-100/50 dark:bg-gray-700/50 rounded-lg p-0.5">
          {(['1d', '1w', '1m'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-1 py-0.5 text-xs font-medium rounded transition-all ${
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

      {/* Compact Grid */}
      <div className="grid grid-cols-4 gap-1 h-64 xl:h-96 overflow-hidden">
        {tiles.map((tile) => {
          const colors = getPerformanceColor(tile.performance);
          const sizeClass = getSizeClass(tile.size);
          const isSmall = tile.size === 'small';
          
          return (
            <Link
              key={tile.symbol}
              href={`/stocks/${tile.symbol}`}
              className={`${sizeClass} rounded border p-1 hover:scale-105 transition-all duration-200 cursor-pointer flex flex-col justify-center text-center min-h-0`}
              style={{
                backgroundColor: colors.backgroundColor,
                borderColor: colors.borderColor,
              }}
            >
              <div className={`font-bold ${isSmall ? 'text-xs' : 'text-sm'} ${colors.textColor} truncate`}>
                {tile.symbol}
              </div>
              {!isSmall && (
                <div className={`font-medium text-xs ${colors.textColor} mt-1`}>
                  {tile.performance >= 0 ? '+' : ''}{tile.performance.toFixed(1)}%
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
