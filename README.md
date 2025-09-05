# FinStocks Frontend

Modern React/Next.js frontend for the FinStocks financial data platform.

## Features

- 🎨 Modern, responsive design with Tailwind CSS
- 📱 Mobile-first approach
- 🌙 Dark mode support
- 📊 Interactive charts with Recharts
- 🔍 Real-time search and filtering
- ⚡ Fast performance with Next.js 15

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Make sure your backend is running on http://localhost:8000

## Pages

- **Home** (`/`) - Dashboard overview with market stats
- **Stocks** (`/stocks`) - Browse and search stocks
- **ETFs** (`/etfs`) - ETF listings and analysis
- **Sectors** (`/sectors`) - Sector performance tracking
- **Screener** (`/screener`) - Advanced stock filtering

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **TypeScript**: Full type safety
- **UI Components**: Headless UI

## API Integration

The frontend connects to your FastAPI backend at `http://localhost:8000/api/`

All API calls are handled client-side with proper error handling and loading states.
# finstocks-frontend
