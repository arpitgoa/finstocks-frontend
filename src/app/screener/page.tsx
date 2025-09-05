'use client';

import { useState, useEffect } from 'react';
import { Filter, Search } from 'lucide-react';
import StockCard from '@/components/StockCard';

interface Stock {
  symbol: string;
  name: string;
  sector: string;
  market_cap: number | null;
}

interface ScreenerFilters {
  min_market_cap?: number;
  max_market_cap?: number;
  sectors?: string[];
  limit?: number;
}

export default function ScreenerPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ScreenerFilters>({});
  
  const [minMarketCap, setMinMarketCap] = useState('');
  const [maxMarketCap, setMaxMarketCap] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);

  const sectors = [
    'Technology', 'Healthcare', 'Financial Services', 'Consumer Cyclical',
    'Communication Services', 'Industrials', 'Consumer Defensive', 'Energy',
    'Utilities', 'Real Estate', 'Basic Materials'
  ];

  const marketCapOptions = [
    { label: 'Mega Cap (>$200B)', min: 200000000000 },
    { label: 'Large Cap ($10B-$200B)', min: 10000000000, max: 200000000000 },
    { label: 'Mid Cap ($2B-$10B)', min: 2000000000, max: 10000000000 },
    { label: 'Small Cap ($300M-$2B)', min: 300000000, max: 2000000000 },
    { label: 'Micro Cap (<$300M)', max: 300000000 }
  ];

  const handleSearch = async () => {
    setLoading(true);
    try {
      const searchFilters: ScreenerFilters = {
        limit: 50
      };

      if (minMarketCap) searchFilters.min_market_cap = parseFloat(minMarketCap);
      if (maxMarketCap) searchFilters.max_market_cap = parseFloat(maxMarketCap);
      if (selectedSectors.length > 0) searchFilters.sectors = selectedSectors;

      const response = await fetch('http://localhost:8000/api/screener', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchFilters)
      });

      const data = await response.json();
      setStocks(data);
    } catch (error) {
      console.error('Error screening stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectorToggle = (sector: string) => {
    setSelectedSectors(prev => 
      prev.includes(sector) 
        ? prev.filter(s => s !== sector)
        : [...prev, sector]
    );
  };

  const handleMarketCapPreset = (preset: { min?: number; max?: number }) => {
    setMinMarketCap(preset.min ? preset.min.toString() : '');
    setMaxMarketCap(preset.max ? preset.max.toString() : '');
  };

  useEffect(() => {
    // Load initial data
    handleSearch();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Stock Screener</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Filter and discover stocks based on your investment criteria
        </p>
      </div>

      {/* Filters Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </h2>

        <div className="space-y-6">
          {/* Market Cap */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Market Cap Range
            </label>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <input
                type="number"
                placeholder="Min Market Cap"
                value={minMarketCap}
                onChange={(e) => setMinMarketCap(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Max Market Cap"
                value={maxMarketCap}
                onChange={(e) => setMaxMarketCap(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {marketCapOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleMarketCapPreset(option)}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sectors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sectors ({selectedSectors.length} selected)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {sectors.map((sector) => (
                <label key={sector} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedSectors.includes(sector)}
                    onChange={() => handleSectorToggle(sector)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{sector}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                setMinMarketCap('');
                setMaxMarketCap('');
                setSelectedSectors([]);
              }}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Clear Filters
            </button>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Searching...' : 'Search Stocks'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-300">
          {loading ? 'Searching...' : `Found ${stocks.length} stocks`}
        </p>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : stocks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stocks.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No stocks found matching your criteria</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
