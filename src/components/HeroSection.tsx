import Link from 'next/link';

export default function HeroSection() {
  return (
    <div className="text-center mb-16">
      <div className="py-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/stocks" className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105">
            Explore Stocks
          </Link>
          <Link href="/screener" className="px-8 py-3 bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-white/20 dark:hover:bg-gray-800/70 transition-all">
            Stock Screener
          </Link>
        </div>
      </div>
    </div>
  );
}
