import Link from 'next/link';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Stock {
  symbol: string;
  name: string;
  sector: string;
  market_cap: number | null;
}

interface StockCardProps {
  stock: Stock;
}

export default function StockCard({ stock }: StockCardProps) {
  const formatMarketCap = (marketCap: number | null) => {
    if (!marketCap) return 'N/A';
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(1)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(1)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(1)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  // Mock price change for demo
  const priceChange = Math.random() > 0.5 ? Math.random() * 5 : -Math.random() * 5;
  const isPositive = priceChange >= 0;

  return (
    <Link href={`/stocks/${stock.symbol}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{stock.symbol}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{stock.name}</p>
          </div>
          <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span className="ml-1 text-sm font-medium">
              {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sector</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{stock.sector}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Market Cap</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {formatMarketCap(stock.market_cap)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
