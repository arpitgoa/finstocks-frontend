export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  industry?: string;
  market_cap: number | null;
}

export interface StockPrice {
  close_price: number;
  date: string;
  volume: number;
  open_price?: number;
  high_price?: number;
  low_price?: number;
}

export interface StockData extends Stock {
  latest_price?: StockPrice;
  fundamentals?: Fundamentals;
}

export interface Fundamentals {
  pe_ratio: number | null;
  pb_ratio: number | null;
  eps: number | null;
  dividend_yield: number | null;
  roe: number | null;
  debt_to_equity?: number | null;
  revenue?: number | null;
  net_income?: number | null;
}

export interface ETF {
  symbol: string;
  name: string;
  category: string;
  expense_ratio: number;
  aum: number;
}

export interface ETFData extends ETF {
  latest_price?: StockPrice;
}

export interface Holding {
  stock_symbol: string;
  weight_percentage: number;
  stocks: {
    name: string;
    sector: string;
    market_cap: number | null;
  };
}

export interface ETFHolding {
  etf_symbol: string;
  weight_percentage: number;
  etfs: {
    name: string;
    category: string;
  };
}

export interface Sector {
  name: string;
  performance_1d: number;
  performance_1w: number;
  performance_1m: number;
  performance_ytd: number;
}

export interface ScreenerFilters {
  min_market_cap?: number;
  max_market_cap?: number;
  min_pe_ratio?: number;
  max_pe_ratio?: number;
  min_roe?: number;
  sectors?: string[];
  min_price?: number;
  max_price?: number;
  limit?: number;
}
