'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, DollarSign } from 'lucide-react';

interface SearchResult {
  symbol: string;
  name: string;
  type: 'stock' | 'etf';
  sector?: string;
  category?: string;
}

interface SearchDropdownProps {
  placeholder?: string;
  className?: string;
}

// Cache for search data
let searchCache: SearchResult[] = [];
let cacheLoaded = false;

export default function SearchDropdown({ placeholder = "Search stocks, ETFs...", className = "" }: SearchDropdownProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [cacheLoading, setCacheLoading] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Load all data once on component mount
  useEffect(() => {
    const loadSearchData = async () => {
      if (cacheLoaded) return;
      
      setCacheLoading(true);
      try {
        const [stocksRes, etfsRes] = await Promise.all([
          fetch('http://localhost:8000/api/screener', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ limit: 100 })
          }),
          fetch('http://localhost:8000/api/etfs')
        ]);

        const stocksData = await stocksRes.json();
        const etfsData = await etfsRes.json();

        console.log('SearchDropdown Stocks API Response:', stocksData); // Debug log
        console.log('SearchDropdown ETFs API Response:', etfsData); // Debug log

        // Ensure both are arrays
        const stocksArray = Array.isArray(stocksData) ? stocksData : [];
        const etfsArray = Array.isArray(etfsData) ? etfsData : [];

        const stockResults: SearchResult[] = stocksArray.map((stock: any) => ({
          symbol: stock.symbol,
          name: stock.name,
          type: 'stock' as const,
          sector: stock.sector
        }));

        const etfResults: SearchResult[] = etfsArray.map((etf: any) => ({
          symbol: etf.symbol,
          name: etf.name,
          type: 'etf' as const,
          category: etf.category
        }));

        searchCache = [...stockResults, ...etfResults];
        cacheLoaded = true;
      } catch (error) {
        console.error('Failed to load search data:', error);
      } finally {
        setCacheLoading(false);
      }
    };

    loadSearchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Instant search through cached data
  useEffect(() => {
    if (!cacheLoaded || searchTerm.length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    
    const filteredResults = searchCache
      .filter(item => {
        const symbolMatch = item.symbol.toLowerCase().startsWith(searchLower);
        const nameMatch = item.name.toLowerCase().includes(searchLower);
        return symbolMatch || nameMatch;
      })
      .sort((a, b) => {
        // Prioritize symbol matches over name matches
        const aSymbolMatch = a.symbol.toLowerCase().startsWith(searchLower);
        const bSymbolMatch = b.symbol.toLowerCase().startsWith(searchLower);
        
        if (aSymbolMatch && !bSymbolMatch) return -1;
        if (!aSymbolMatch && bSymbolMatch) return 1;
        
        // Then prioritize exact matches
        if (a.symbol.toLowerCase() === searchLower) return -1;
        if (b.symbol.toLowerCase() === searchLower) return 1;
        
        // Finally sort alphabetically
        return a.symbol.localeCompare(b.symbol);
      })
      .slice(0, 8);

    setResults(filteredResults);
    setIsOpen(filteredResults.length > 0);
  }, [searchTerm]);

  const handleSelect = (result: SearchResult) => {
    const path = result.type === 'stock' ? `/stocks/${result.symbol}` : `/etfs/${result.symbol}`;
    router.push(path);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) {
      handleSelect(results[0]);
    } else if (searchTerm.trim()) {
      // Fallback to stocks page with search
      router.push(`/stocks?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
      setIsOpen(false);
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder={cacheLoading ? "Loading..." : placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm.length >= 1 && results.length > 0 && setIsOpen(true)}
          disabled={cacheLoading}
          className={`pl-10 pr-4 py-2 border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all ${className} ${cacheLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      </form>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="py-2">
            {results.map((result) => (
              <button
                key={`${result.type}-${result.symbol}`}
                onClick={() => handleSelect(result)}
                className="w-full px-4 py-3 text-left hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors flex items-center space-x-3"
              >
                <div className={`p-2 rounded-lg ${result.type === 'stock' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-purple-100 dark:bg-purple-900'}`}>
                  {result.type === 'stock' ? (
                    <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{result.symbol}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${result.type === 'stock' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'}`}>
                      {result.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{result.name}</p>
                  {result.sector && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">{result.sector}</p>
                  )}
                  {result.category && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">{result.category}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
