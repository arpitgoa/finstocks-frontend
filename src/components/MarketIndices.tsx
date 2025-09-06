'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  date?: string;
}

interface IndexData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  candleData: CandleData[];
}

export default function MarketIndices() {
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIndices = async () => {
      setLoading(true);
      try {
        const symbols = ['SPY', 'QQQ', 'IWM', 'VTI']; // Changed DIA to VTI
        const names = ['S&P 500', 'NASDAQ', 'Russell 2000', 'Total Stock Market'];
        
        const indicesData = await Promise.all(
          symbols.map(async (symbol, index) => {
            try {
              // Fetch ETF data and price history
              const [etfRes, pricesRes] = await Promise.all([
                fetch(`http://localhost:8000/api/etfs/${symbol}`),
                fetch(`http://localhost:8000/api/etfs/${symbol}/prices?days=30`)
              ]);
              
              const etfData = await etfRes.json();
              const pricesData = await pricesRes.json();
              
              // Check if we have valid price data
              if (!pricesData || pricesData.length === 0) {
                throw new Error(`No price data for ${symbol}`);
              }
              
              // Convert all 30 days of price data to candlestick format
              const candleData = pricesData.map((price: any) => ({
                open: price.open_price || price.close_price,
                high: price.high_price || price.close_price * 1.02,
                low: price.low_price || price.close_price * 0.98,
                close: price.close_price,
                volume: price.volume || 0,
                date: price.date
              }));
              
              // Calculate change from latest price
              const latestPrice = pricesData[pricesData.length - 1];
              const previousPrice = pricesData.length > 1 ? pricesData[pricesData.length - 2] : null;
              
              if (!latestPrice || !latestPrice.close_price) {
                throw new Error(`Invalid price data for ${symbol}`);
              }
              
              const change = previousPrice?.close_price 
                ? latestPrice.close_price - previousPrice.close_price 
                : 0;
              const changePercent = previousPrice?.close_price 
                ? (change / previousPrice.close_price) * 100 
                : 0;
              
              return {
                symbol,
                name: names[index],
                price: latestPrice.close_price,
                change,
                changePercent,
                candleData
              };
            } catch (error) {
              console.error(`Error fetching ${symbol}:`, error);
              // Fallback to mock data for this symbol
              const mockDates = Array.from({ length: 30 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (29 - i));
                return date.toISOString().split('T')[0];
              });
              
              return {
                symbol,
                name: names[index],
                price: 100 + Math.random() * 400,
                change: (Math.random() - 0.5) * 20,
                changePercent: (Math.random() - 0.5) * 5,
                candleData: Array.from({ length: 30 }, (_, i) => {
                  const base = 100 + Math.random() * 400;
                  return {
                    open: base,
                    high: base * 1.02,
                    low: base * 0.98,
                    close: base + (Math.random() - 0.5) * 10,
                    volume: Math.floor(Math.random() * 50000000 + 10000000), // 10M-60M volume
                    date: mockDates[i]
                  };
                })
              };
            }
          })
        );

        setIndices(indicesData);
      } catch (error) {
        console.error('Error fetching indices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIndices();
  }, []);

  const CandlestickChart = ({ data, isPositive }: { 
    data: CandleData[], 
    isPositive: boolean 
  }) => {
    const allValues = data.flatMap(d => [d.open, d.high, d.low, d.close]);
    const max = Math.max(...allValues);
    const min = Math.min(...allValues);
    const range = max - min;
    
    // Volume calculations - relative to 30-day average
    const volumes = data.map(d => d.volume || 0);
    const avgVolume30Day = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const maxRelativeVolume = Math.max(...volumes.map(v => v / avgVolume30Day));
    
    // Responsive chart dimensions
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const isTablet = typeof window !== 'undefined' && window.innerWidth < 1280;
    
    let chartWidth, chartHeight, margin;
    if (isMobile) {
      chartWidth = 150;
      chartHeight = 60;
      margin = { top: 8, right: 20, bottom: 20, left: 25 };
    } else if (isTablet) {
      chartWidth = 200;
      chartHeight = 80;
      margin = { top: 10, right: 25, bottom: 22, left: 30 };
    } else {
      chartWidth = 300;
      chartHeight = 120;
      margin = { top: 12, right: 35, bottom: 25, left: 45 };
    }
    
    const plotWidth = chartWidth - margin.left - margin.right;
    const plotHeight = chartHeight - margin.top - margin.bottom;
    
    const candleWidth = Math.max(1, plotWidth / data.length - 1);
    
    // Format date for x-axis
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    };
    
    // Y-axis ticks
    const yTicks = [min, (min + max) / 2, max];
    
    // Right Y-axis ticks for relative volume
    const volumeTicks = [0, 1, 2, Math.ceil(maxRelativeVolume)].filter((v, i, arr) => arr.indexOf(v) === i); // Remove duplicates
    
    return (
      <svg width={chartWidth} height={chartHeight + 20} className="mt-2">
        {/* Y-axis (Price) */}
        <g>
          {yTicks.map((tick, i) => {
            const y = margin.top + (plotHeight * (max - tick)) / range;
            return (
              <g key={i}>
                <line
                  x1={margin.left - 5}
                  y1={y}
                  x2={margin.left}
                  y2={y}
                  stroke="#6b7280"
                  strokeWidth="1"
                />
                <text
                  x={margin.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="8"
                  fill="#6b7280"
                >
                  ${tick.toFixed(0)}
                </text>
              </g>
            );
          })}
        </g>
        
        {/* Right Y-axis (Relative Volume) */}
        <g>
          {volumeTicks.map((tick, i) => {
            const y = margin.top + plotHeight - (tick / maxRelativeVolume) * plotHeight;
            return (
              <g key={i}>
                <line
                  x1={chartWidth - margin.right}
                  y1={y}
                  x2={chartWidth - margin.right + 5}
                  y2={y}
                  stroke="#6b7280"
                  strokeWidth="1"
                />
                <text
                  x={chartWidth - margin.right + 8}
                  y={y + 3}
                  textAnchor="start"
                  fontSize="8"
                  fill="#6b7280"
                >
                  {tick.toFixed(1)}x
                </text>
              </g>
            );
          })}
          
          {/* Volume Strength Indicator Bar */}
          <g>
            {/* Background bar */}
            <rect
              x={chartWidth - margin.right + 2}
              y={margin.top}
              width="4"
              height={plotHeight}
              fill="#e5e7eb"
              rx="2"
            />
            
            {/* Current volume strength bar */}
            {(() => {
              const latestVolume = data[data.length - 1]?.volume || 0;
              const latestRelativeVolume = latestVolume / avgVolume30Day;
              const strengthHeight = Math.min((latestRelativeVolume / maxRelativeVolume) * plotHeight, plotHeight);
              
              let strengthColor = '#9ca3af';
              if (latestRelativeVolume > 2.0) strengthColor = '#dc2626';
              else if (latestRelativeVolume > 1.5) strengthColor = '#f59e0b';
              else if (latestRelativeVolume < 0.5) strengthColor = '#6b7280';
              
              return (
                <rect
                  x={chartWidth - margin.right + 2}
                  y={margin.top + plotHeight - strengthHeight}
                  width="4"
                  height={strengthHeight}
                  fill={strengthColor}
                  rx="2"
                />
              );
            })()}
          </g>
        </g>
        
        {/* Candlesticks */}
        <g>
          {data.map((candle, index) => {
            const x = margin.left + (index * plotWidth) / data.length;
            const isBullish = candle.close >= candle.open;
            
            const high = margin.top + ((max - candle.high) / range) * plotHeight;
            const low = margin.top + ((max - candle.low) / range) * plotHeight;
            const open = margin.top + ((max - candle.open) / range) * plotHeight;
            const close = margin.top + ((max - candle.close) / range) * plotHeight;
            
            const bodyTop = Math.min(open, close);
            const bodyHeight = Math.abs(close - open);
            
            // Relative volume strength (vs 30-day average)
            const relativeVolume = (candle.volume || 0) / avgVolume30Day;
            const volumeHeight = Math.min((relativeVolume / maxRelativeVolume) * 25, 25); // Scale to max 25px
            
            // Color based on relative volume strength
            let volumeColor = '#9ca3af'; // Gray for normal (0.5x - 1.5x)
            if (relativeVolume > 2.0) volumeColor = '#dc2626'; // Red for very high (>2x)
            else if (relativeVolume > 1.5) volumeColor = '#f59e0b'; // Orange for high (1.5x-2x)
            else if (relativeVolume < 0.5) volumeColor = '#6b7280'; // Dark gray for low (<0.5x)
            
            return (
              <g key={index}>
                {/* Volume bar (very small, next to candle) */}
                <rect
                  x={x + candleWidth + 1}
                  y={margin.top + plotHeight - volumeHeight}
                  width="2"
                  height={volumeHeight}
                  fill={volumeColor}
                  opacity="0.6"
                />
                
                {/* Wick */}
                <line
                  x1={x + candleWidth/2}
                  y1={high}
                  x2={x + candleWidth/2}
                  y2={low}
                  stroke={isBullish ? '#10b981' : '#ef4444'}
                  strokeWidth="1"
                />
                {/* Body */}
                <rect
                  x={x}
                  y={bodyTop}
                  width={candleWidth}
                  height={Math.max(bodyHeight, 1)}
                  fill={isBullish ? '#10b981' : '#ef4444'}
                  stroke={isBullish ? '#10b981' : '#ef4444'}
                  strokeWidth="0.5"
                />
              </g>
            );
          })}
        </g>
        
        {/* X-axis labels (show every 5th day) */}
        <g>
          {data.map((candle, index) => {
            if (index % 5 === 0 || index === data.length - 1) {
              const x = margin.left + (index * plotWidth) / data.length;
              // Don't show last date if it would overlap with volume label
              const isLastDate = index === data.length - 1;
              const wouldOverlap = x + candleWidth/2 > chartWidth - 50;
              
              if (isLastDate && wouldOverlap) return null;
              
              return (
                <text
                  key={index}
                  x={x + candleWidth/2}
                  y={chartHeight + 15}
                  textAnchor="middle"
                  fontSize="8"
                  fill="#6b7280"
                >
                  {candle.date ? formatDate(candle.date) : `${index + 1}`}
                </text>
              );
            }
            return null;
          })}
        </g>
        
        {/* Volume label (positioned to avoid overlap) */}
        <g>
          <text
            x={chartWidth - 15}
            y={chartHeight + 10}
            textAnchor="middle"
            fontSize="7"
            fill="#6b7280"
          >
            Relative
          </text>
          <text
            x={chartWidth - 15}
            y={chartHeight + 18}
            textAnchor="middle"
            fontSize="7"
            fill="#6b7280"
          >
            Volume
          </text>
        </g>
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="mb-16 px-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 lg:mb-6 text-center">Market Indices</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-8 max-w-full overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg lg:rounded-xl p-2 lg:p-4 border border-gray-200/50 dark:border-gray-700/50 animate-pulse w-full min-w-0">
              <div className="text-center mb-2 lg:mb-4">
                <div className="h-3 lg:h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-24 lg:w-48"></div>
              </div>
              <div className="h-16 lg:h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-16 px-4">
      <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 lg:mb-6 text-center">Market Indices</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 xl:gap-8 max-w-full overflow-hidden justify-items-center">
        {indices.map((index) => {
          const isPositive = index.change >= 0;
          
          return (
            <Link
              key={index.symbol}
              href={`/etfs/${index.symbol}`}
              className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg lg:rounded-xl p-2 lg:p-4 xl:p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200 card-hover w-full max-w-xs lg:max-w-sm xl:max-w-none min-w-0"
            >
              {/* Compact Single Line Header */}
              <div className="text-center mb-2 lg:mb-4">
                <div className="text-xs lg:text-sm xl:text-base text-gray-600 dark:text-gray-400 mb-1 truncate">
                  <span className="font-bold text-gray-900 dark:text-white">{index.symbol}</span>
                  <span className="hidden sm:inline"> • {index.name}</span>
                  <br className="sm:hidden" />
                  <span className="text-xs lg:text-sm">${index.price.toFixed(0)} • </span>
                  <span className={`font-semibold text-xs lg:text-sm ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isPositive ? '+' : ''}{index.change.toFixed(1)}
                  </span>
                </div>
              </div>
              
              {/* Main Chart */}
              <div className="overflow-hidden">
                <CandlestickChart data={index.candleData} isPositive={isPositive} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
