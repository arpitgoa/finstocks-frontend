'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Filter, TrendingUp, TrendingDown, Activity, Clock, Moon } from 'lucide-react';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
}

interface IndexData {
  name: string;
  change: number;
  changePercent: number;
}

type MoversType = 'gainers' | 'losers' | 'active' | 'premarket' | 'afterhours';
type TimeFrame = 'today' | 'week' | 'month' | 'ytd' | 'year' | '3years' | '5years';

export default function MarketMoversPage() {
  const [activeTab, setActiveTab] = useState<MoversType>('gainers');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Cache for all data
  const [dataCache, setDataCache] = useState<{
    [key: string]: { data: Stock[], timestamp: number }
  }>({});

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  // Mock data for demonstration
  const stockIndexes: IndexData[] = [
    { name: 'S&P 500', change: -0.29, changePercent: -0.29 },
    { name: 'Nasdaq 100', change: 0.14, changePercent: 0.14 },
    { name: 'Dow Jones', change: -0.45, changePercent: -0.45 },
    { name: 'Russell 2000', change: 0.50, changePercent: 0.50 },
  ];

  // Fetch all data for a tab and cache it
  const fetchAllDataForTab = async (tab: MoversType) => {
    const timeFramesToFetch = tab === 'premarket' || tab === 'afterhours' 
      ? ['today'] 
      : ['today', 'week', 'month', 'ytd', 'year'];

    const promises = timeFramesToFetch.map(async (period) => {
      const cacheKey = `${tab}-${period}`;
      
      // Check if we have fresh cached data (less than 5 minutes old)
      const cached = dataCache[cacheKey];
      if (cached && Date.now() - cached.timestamp < 300000) {
        return { period, data: cached.data };
      }

      try {
        let endpoint = '';
        switch (tab) {
          case 'gainers':
            endpoint = `http://localhost:8000/api/screener/gainers?limit=20&period=${period}`;
            break;
          case 'losers':
            endpoint = `http://localhost:8000/api/screener/losers?limit=20&period=${period}`;
            break;
          case 'active':
            endpoint = 'http://localhost:8000/api/screener?limit=20';
            break;
          case 'premarket':
          case 'afterhours':
            endpoint = `http://localhost:8000/api/screener/gainers?limit=20&period=today`;
            break;
        }

        const response = await fetch(endpoint);
        const data = await response.json();
        
        const stocksArray = Array.isArray(data) ? data : [];
        const transformedData = stocksArray.map((stock: any) => ({
          symbol: stock.symbol,
          name: stock.name,
          price: stock.price || 0,
          change: 0,
          changePercent: stock.change_percent || 0,
          volume: stock.volume || 0,
          marketCap: stock.market_cap ? stock.market_cap / 1000000 : 0
        }));

        return { period, data: transformedData };
      } catch (error) {
        console.error(`Error fetching ${tab} ${period}:`, error);
        return { period, data: [] };
      }
    });

    const results = await Promise.all(promises);
    
    // Update cache
    const newCache = { ...dataCache };
    results.forEach(({ period, data }) => {
      const cacheKey = `${tab}-${period}`;
      newCache[cacheKey] = { data, timestamp: Date.now() };
    });
    setDataCache(newCache);

    return results;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Check if we already have cached data for this tab and timeframe
      const cacheKey = `${activeTab}-${timeFrame}`;
      const cached = dataCache[cacheKey];
      
      if (cached && Date.now() - cached.timestamp < 300000) {
        // Use cached data if less than 5 minutes old
        setStocks(cached.data);
        setLoading(false);
        return;
      }

      try {
        // Fetch all data for this tab at once
        const results = await fetchAllDataForTab(activeTab);
        
        // Update cache with all results
        const newCache = { ...dataCache };
        results.forEach(({ period, data }) => {
          const key = `${activeTab}-${period}`;
          newCache[key] = { data, timestamp: Date.now() };
        });
        setDataCache(newCache);
        
        // Set the current timeframe data
        const currentData = results.find(r => r.period === timeFrame);
        if (currentData) {
          setStocks(currentData.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setStocks([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab]);

  // When timeframe changes, use cached data if available
  useEffect(() => {
    if (activeTab === 'premarket' || activeTab === 'afterhours') {
      return; // These don't have time frames
    }
    
    const cacheKey = `${activeTab}-${timeFrame}`;
    const cached = dataCache[cacheKey];
    
    if (cached && Date.now() - cached.timestamp < 300000) {
      console.log(`Using cached data for ${cacheKey}:`, cached.data.length, 'stocks');
      setStocks(cached.data);
    } else {
      console.log(`No cached data for ${cacheKey}, fetching...`);
      // If no cached data, fetch it
      const fetchSinglePeriod = async () => {
        setLoading(true);
        try {
          let endpoint = '';
          switch (activeTab) {
            case 'gainers':
              endpoint = `http://localhost:8000/api/screener/gainers?limit=20&period=${timeFrame}`;
              break;
            case 'losers':
              endpoint = `http://localhost:8000/api/screener/losers?limit=20&period=${timeFrame}`;
              break;
            case 'active':
              endpoint = 'http://localhost:8000/api/screener?limit=20';
              break;
          }

          const response = await fetch(endpoint);
          const data = await response.json();
          
          const stocksArray = Array.isArray(data) ? data : [];
          const transformedData = stocksArray.map((stock: any) => ({
            symbol: stock.symbol,
            name: stock.name,
            price: stock.price || 0,
            change: 0,
            changePercent: stock.change_percent || 0,
            volume: stock.volume || 0,
            marketCap: stock.market_cap ? stock.market_cap / 1000000 : 0
          }));

          // Update cache
          setDataCache(prev => ({
            ...prev,
            [cacheKey]: { data: transformedData, timestamp: Date.now() }
          }));
          setStocks(transformedData);
        } catch (error) {
          console.error('Error fetching single period:', error);
          setStocks([]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchSinglePeriod();
    }
  }, [timeFrame, activeTab]); // Fixed dependency array

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toLocaleString();
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000) return `${(marketCap / 1000).toFixed(1)}B`;
    return `${marketCap.toFixed(1)}M`;
  };

  const filteredStocks = stocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'gainers', label: 'Gainers', icon: TrendingUp },
    { id: 'losers', label: 'Losers', icon: TrendingDown },
    { id: 'active', label: 'Active', icon: Activity },
    { id: 'premarket', label: 'Premarket', icon: Clock },
    { id: 'afterhours', label: 'After Hours', icon: Moon },
  ];

  const timeFrames = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'ytd', label: 'YTD' },
    { id: 'year', label: 'Year' },
    { id: '3years', label: '3 Years' },
    { id: '5years', label: '5 Years' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Market Movers</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Track the biggest gainers, losers, and most active stocks in real-time
        </p>
      </div>

      {/* Stock Indexes */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Stock Indexes</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{currentDate}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stockIndexes.map((index) => (
            <div key={index.name} className="text-center">
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {index.name}
              </div>
              <div className={`text-lg font-bold ${
                index.changePercent >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 mb-8">
        <div className="flex flex-wrap border-b border-gray-200/50 dark:border-gray-700/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as MoversType)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Controls */}
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Time Frame Buttons - Hide for Premarket and After Hours */}
            {activeTab !== 'premarket' && activeTab !== 'afterhours' && (
              <div className="flex flex-wrap gap-2">
                {timeFrames.map((tf) => (
                  <button
                    key={tf.id}
                    onClick={() => setTimeFrame(tf.id as TimeFrame)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      timeFrame === tf.id
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            )}

            {/* Search and Actions */}
            <div className="flex gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Find..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
              {activeTab} {timeFrame === 'today' ? 'Today' : timeFrame}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Updated {currentDate}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  % Change
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Volume
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Market Cap
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : (
                filteredStocks.map((stock, index) => (
                  <tr key={stock.symbol} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {stock.symbol}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {stock.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm font-medium ${
                        stock.changePercent >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ${stock.price.toFixed(3)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatVolume(stock.volume)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatMarketCap(stock.marketCap)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
