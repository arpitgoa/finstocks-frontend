import Link from 'next/link';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Sector {
  name: string;
  performance_1d: number;
  performance_1w: number;
  performance_1m: number;
}

interface SectorCardProps {
  sector: Sector;
}

export default function SectorCard({ sector }: SectorCardProps) {
  const isPositive = sector.performance_1d >= 0;

  return (
    <Link href={`/sectors/${encodeURIComponent(sector.name)}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{sector.name}</h3>
          <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">1D</span>
            <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{sector.performance_1d.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">1W</span>
            <span className={`text-sm font-medium ${sector.performance_1w >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {sector.performance_1w >= 0 ? '+' : ''}{sector.performance_1w.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">1M</span>
            <span className={`text-sm font-medium ${sector.performance_1m >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {sector.performance_1m >= 0 ? '+' : ''}{sector.performance_1m.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
