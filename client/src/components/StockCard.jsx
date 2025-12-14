import { useState } from 'react';
import { TrendingUp, TrendingDown, Search, Zap, Package, Facebook, Cpu, Check, Plus } from 'lucide-react';
import BarChartVisualization from './MiniBarChart';

const COMPANY_NAME_MAP = {
  'GOOG': 'Alphabet Inc.',
  'TSLA': 'Tesla Inc.',
  'AMZN': 'Amazon.com Inc.',
  'META': 'Meta Platforms Inc.',
  'NVDA': 'NVIDIA Corporation'
};

const TICKER_ICON_MAP = {
  'GOOG': Search,
  'TSLA': Zap,
  'AMZN': Package,
  'META': Facebook,
  'NVDA': Cpu
};

const TICKER_COLOR_MAP = {
  'GOOG': 'text-blue-400',
  'TSLA': 'text-orange-400',
  'AMZN': 'text-amber-400',
  'META': 'text-blue-500',
  'NVDA': 'text-green-400'
};

const StockCardComponent = ({ ticker, subscribed, onSubscribe, onUnsubscribe, priceData, historicalData = [] }) => {
  const latestPrice = priceData?.price ? parseFloat(priceData.price) : null;
  const priceChange = priceData?.change || 0;
  const priceDirection = priceChange > 0 ? 'up' : priceChange < 0 ? 'down' : 'neutral';
  const priorPrice = latestPrice ? latestPrice - priceChange : null;
  const percentageChange = priorPrice && priceChange !== 0 
    ? ((priceChange / priorPrice) * 100).toFixed(2) 
    : '0.00';

  const StockIcon = TICKER_ICON_MAP[ticker] || Search;
  const iconColorClass = TICKER_COLOR_MAP[ticker] || 'text-blue-400';

  // Prepare chart data from historical prices or generate placeholder data
  const visualizationData = historicalData.length > 0 
    ? historicalData.map(priceValue => priceValue.price || priceValue)
    : Array.from({ length: 10 }, () => Math.random() * 100);

  return (
    <div className={`group bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${
      subscribed ? 'border-violet-500/40 shadow-lg shadow-violet-500/5' : 'border-slate-700/30 hover:border-slate-700/50'
    }`}>
      <div className="flex items-start justify-between gap-4">
        {/* Left side - Icon and Info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className={`${iconColorClass} flex-shrink-0 mt-1`}>
            <StockIcon size={32} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-2xl font-bold text-white tracking-tight">{ticker}</h3>
              {subscribed && (
                <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
              )}
            </div>
            <p className="text-slate-400 text-sm mb-4 truncate">{COMPANY_NAME_MAP[ticker] || ticker}</p>
            
            {/* Price and change inline */}
            <div className="flex items-baseline gap-3 mb-4">
              <div className="text-3xl font-bold text-white tracking-tight">
                {latestPrice ? `$${latestPrice.toFixed(2)}` : '---'}
              </div>
              {latestPrice && (
                <div className={`flex items-center gap-1 text-sm font-semibold ${
                  priceChange > 0 ? 'text-violet-400' : priceChange < 0 ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {priceChange !== 0 && (
                    <>
                      {priceDirection === 'up' && <TrendingUp size={16} />}
                      {priceDirection === 'down' && <TrendingDown size={16} />}
                    </>
                  )}
                  {priceChange === 0 && <TrendingUp size={16} />}
                  <span>
                    {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)} ({percentageChange}%)
                  </span>
                </div>
              )}
            </div>

            {/* Chart */}
            <div className="mt-4">
              <BarChartVisualization 
                data={visualizationData} 
                color={subscribed ? 'violet' : 'slate'} 
              />
            </div>
          </div>
        </div>

        {/* Right side - Subscribe button */}
        <div className="flex-shrink-0">
          {subscribed ? (
            <button
              onClick={() => onUnsubscribe(ticker)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all duration-200 text-sm font-semibold shadow-lg shadow-violet-500/20"
            >
              <Check size={16} />
              <span className="hidden sm:inline">Subscribed</span>
            </button>
          ) : (
            <button
              onClick={() => onSubscribe(ticker)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 text-white rounded-xl hover:bg-slate-700 transition-all duration-200 text-sm font-semibold border border-slate-600/50 hover:border-violet-500/50"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Subscribe</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default StockCardComponent;
