'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/app/layout';
import { 
  Home, 
  TrendingUp, 
  Building2, 
  DollarSign, 
  Newspaper, 
  Flame, 
  FileText, 
  BarChart3, 
  Activity,
  Mail,
  Star,
  Bookmark,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const menuItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Stocks', href: '/stocks', icon: TrendingUp },
  { name: 'IPOs', href: '/ipos', icon: Building2 },
  { name: 'ETFs', href: '/etfs', icon: DollarSign },
  { 
    name: 'News', 
    icon: Newspaper,
    submenu: [
      { name: 'Trending', href: '/news/trending', icon: Flame },
      { name: 'Articles', href: '/news/articles', icon: FileText },
    ]
  },
  { name: 'Technical Chart', href: '/chart', icon: BarChart3 },
  { name: 'Market Movers', href: '/movers', icon: Activity },
  { name: 'Market Newsletter', href: '/newsletter', icon: Mail },
  { name: 'Stock Analysis Pro', href: '/analysis', icon: Star },
  { name: 'Watchlist', href: '/watchlist', icon: Bookmark },
];

export default function SideNav() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const pathname = usePathname();

  const toggleSubmenu = (menuName: string) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 z-40 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
        {!isCollapsed && (
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            FinStocks
          </h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isExpanded = expandedMenu === item.name;

          return (
            <div key={item.name}>
              {hasSubmenu ? (
                <button
                  onClick={() => toggleSubmenu(item.name)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href || '#'}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              )}

              {/* Submenu */}
              {hasSubmenu && isExpanded && !isCollapsed && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.submenu?.map((subItem) => {
                    const isSubActive = pathname === subItem.href;
                    return (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                          isSubActive
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <subItem.icon className="h-4 w-4 flex-shrink-0" />
                        <span>{subItem.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Collapse Button at Bottom */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => setIsCollapsed(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Collapse
          </button>
        </div>
      )}
    </div>
  );
}
