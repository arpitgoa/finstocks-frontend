import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  href: string;
  icon: LucideIcon;
  iconGradient: 'green' | 'blue' | 'purple' | 'orange';
  label: string;
  value: string;
}

export default function StatCard({ href, icon: Icon, iconGradient, label, value }: StatCardProps) {
  const gradientClass = `gradient-${iconGradient}`;
  
  return (
    <Link href={href}>
      <div className="stat-card">
        <div className="flex items-center">
          <div className={`gradient-icon ${gradientClass}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
