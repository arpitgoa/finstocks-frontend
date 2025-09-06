import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import StatCard from './StatCard';

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      <StatCard
        href="/stocks"
        icon={TrendingUp}
        iconGradient="green"
        label="Market Cap"
        value="$2.1T"
      />
      <StatCard
        href="/stocks"
        icon={BarChart3}
        iconGradient="blue"
        label="Active Stocks"
        value="55+"
      />
      <StatCard
        href="/etfs"
        icon={DollarSign}
        iconGradient="purple"
        label="ETFs"
        value="36"
      />
      <StatCard
        href="/sectors"
        icon={TrendingDown}
        iconGradient="orange"
        label="Sectors"
        value="11"
      />
    </div>
  );
}
