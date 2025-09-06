import { useState, useEffect } from 'react';
import { getCachedData } from '@/utils/apiCache';

export interface HomepageData {
  indices: any[];
  sectors: any[];
  stocks: {
    gainers: any[];
    losers: any[];
    volume: any[];
  };
  heatmapData: any[];
}

export const useHomepageData = () => {
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [
          sectorsData,
          gainersData,
          losersData,
          // ETF data for indices
          spyData,
          spyPrices,
          qqqData,
          qqqPrices,
          iwmData,
          iwmPrices,
          vtiData,
          vtiPrices
        ] = await Promise.all([
          getCachedData('http://localhost:8000/api/sectors'),
          getCachedData('http://localhost:8000/api/screener/gainers?limit=15'),
          getCachedData('http://localhost:8000/api/screener/losers?limit=15'),
          getCachedData('http://localhost:8000/api/etfs/SPY'),
          getCachedData('http://localhost:8000/api/etfs/SPY/prices?days=30'),
          getCachedData('http://localhost:8000/api/etfs/QQQ'),
          getCachedData('http://localhost:8000/api/etfs/QQQ/prices?days=30'),
          getCachedData('http://localhost:8000/api/etfs/IWM'),
          getCachedData('http://localhost:8000/api/etfs/IWM/prices?days=30'),
          getCachedData('http://localhost:8000/api/etfs/VTI'),
          getCachedData('http://localhost:8000/api/etfs/VTI/prices?days=30')
        ]);

        // Volume data (POST request)
        const volumeResponse = await fetch('http://localhost:8000/api/screener', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sort_by: 'volume', limit: 15 })
        });
        const volumeData = await volumeResponse.json();

        // Process indices data
        const indices = [
          {
            symbol: 'SPY',
            name: 'S&P 500',
            price: spyData.current_price || 0,
            change: spyData.change_percent || 0,
            candleData: spyPrices || []
          },
          {
            symbol: 'QQQ',
            name: 'NASDAQ',
            price: qqqData.current_price || 0,
            change: qqqData.change_percent || 0,
            candleData: qqqPrices || []
          },
          {
            symbol: 'IWM',
            name: 'Russell 2000',
            price: iwmData.current_price || 0,
            change: iwmData.change_percent || 0,
            candleData: iwmPrices || []
          },
          {
            symbol: 'VTI',
            name: 'Total Stock Market',
            price: vtiData.current_price || 0,
            change: vtiData.change_percent || 0,
            candleData: vtiPrices || []
          }
        ];

        setData({
          indices,
          sectors: sectorsData || [],
          stocks: {
            gainers: gainersData || [],
            losers: losersData || [],
            volume: volumeData || []
          },
          heatmapData: gainersData?.slice(0, 20) || []
        });

      } catch (err) {
        console.error('Error fetching homepage data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return { data, loading, error };
};
