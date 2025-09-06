const API_BASE_URL = 'http://localhost:8000/api';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(`API Error: ${response.statusText}`, response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Network error occurred');
  }
}

// Stock API calls
export const stockApi = {
  getStock: (symbol: string) => fetchApi(`/stocks/${symbol}`),
  getStockPrices: (symbol: string, days: number = 30) => fetchApi(`/stocks/${symbol}/prices?days=${days}`),
  getStockTechnical: (symbol: string) => fetchApi(`/stocks/${symbol}/technical`),
  getStockETFs: (symbol: string) => fetchApi(`/stocks/${symbol}/etfs`),
  screenStocks: (filters: any) => fetchApi('/screener', {
    method: 'POST',
    body: JSON.stringify(filters),
  }),
  getGainers: (limit: number = 10) => fetchApi(`/screener/gainers?limit=${limit}`),
  getLosers: (limit: number = 10) => fetchApi(`/screener/losers?limit=${limit}`),
};

// ETF API calls
export const etfApi = {
  getAllETFs: () => fetchApi('/etfs'),
  getETF: (symbol: string) => fetchApi(`/etfs/${symbol}`),
  getETFPrices: (symbol: string, days: number = 30) => fetchApi(`/etfs/${symbol}/prices?days=${days}`),
  getETFHoldings: (symbol: string, limit: number = 50) => fetchApi(`/etfs/${symbol}/holdings?limit=${limit}`),
  getETFTopHoldings: (symbol: string, limit: number = 10) => fetchApi(`/etfs/${symbol}/top-holdings?limit=${limit}`),
  getETFsByCategory: (category: string) => fetchApi(`/etfs/category/${category}`),
  getLeveragedETFs: () => fetchApi('/etfs/leveraged'),
};

// Sector API calls
export const sectorApi = {
  getAllSectors: () => fetchApi('/sectors'),
  getTopSectors: (period: string = '1d', limit: number = 5) => fetchApi(`/sectors/top-performers?period=${period}&limit=${limit}`),
  getSectorStocks: (sectorName: string) => fetchApi(`/sectors/${encodeURIComponent(sectorName)}/stocks`),
};
