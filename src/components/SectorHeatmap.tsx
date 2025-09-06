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

export default function SectorHeatmap() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'1d' | '1w' | '1m' | 'ytd'>('1d');

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

  const getPerformanceValue = (sector: Sector) => {
    switch (period) {
      case '1d': return sector.performance_1d;
      case '1w': return sector.performance_1w;
      case '1m': return sector.performance_1m;
      case 'ytd': return sector.performance_ytd;
      default: return sector.performance_1d;
    }
  };

  if (loading) {
    return (
      <div className="w-125 h-125 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Sectors</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 h-112">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
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

      <div className="grid grid-cols-2 gap-2 h-112 overflow-hidden">
        {sectors
          .sort((a, b) => Math.abs(getPerformanceValue(b)) - Math.abs(getPerformanceValue(a)))
          .slice(0, 8)
          .map((sector) => {
            const performance = getPerformanceValue(sector);
            const colors = getPerformanceColor(performance);
            
            return (
              <Link
                key={sector.name}
                href={`/sectors/${encodeURIComponent(sector.name)}`}
                className="rounded-lg border p-3 hover:scale-105 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                style={{
                  backgroundColor: colors.backgroundColor,
                  borderColor: colors.borderColor,
                }}
              >
                <div className={`font-bold text-sm ${colors.textColor} truncate`}>
                  {sector.name}
                </div>
                <div className={`font-semibold text-lg ${colors.textColor} text-right`}>
                  {performance >= 0 ? '+' : ''}{performance.toFixed(1)}%
                </div>
              </Link>
            );
          })}
      </div>
    </div>
  );
}
