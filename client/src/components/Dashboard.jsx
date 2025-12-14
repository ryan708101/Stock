import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { TrendingUp, Search, User, LogOut, LayoutDashboard, BarChart3, Menu, X } from 'lucide-react';
import StockCardComponent from './StockCard';
import NotificationToast from './Toast';

const API_ENDPOINT_BASE = 'http://localhost:5000/api';
const WEBSOCKET_SERVER_URL = 'http://localhost:5000';
const AVAILABLE_STOCK_TICKERS = ['GOOG', 'TSLA', 'AMZN', 'META', 'NVDA'];

const COMPANY_NAMES = {
  'GOOG': 'Alphabet Inc.',
  'TSLA': 'Tesla Inc.',
  'AMZN': 'Amazon.com Inc.',
  'META': 'Meta Platforms Inc.',
  'NVDA': 'NVIDIA Corporation'
};

const StockDashboard = ({ user, onLogout, onUserUpdate }) => {
  const [userSubscriptions, setUserSubscriptions] = useState(user.subscriptions || []);
  const [currentPriceData, setCurrentPriceData] = useState({});
  const [priorPriceValues, setPriorPriceValues] = useState({});
  const [priceHistoryData, setPriceHistoryData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notificationToast, setNotificationToast] = useState(null);
  const [selectedViewTab, setSelectedViewTab] = useState('subscribed');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Establish WebSocket connection
    const websocketConnection = io(WEBSOCKET_SERVER_URL, {
      transports: ['websocket', 'polling']
    });

    websocketConnection.on('connect', () => {
      console.log('✅ Connected to Socket.io server');
    });

    websocketConnection.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.io server');
    });

    // Handle real-time stock price updates
    websocketConnection.on('stockUpdates', (latestPrices) => {
      setCurrentPriceData(prevPriceData => {
        const updatedPriceData = {};
        Object.keys(latestPrices).forEach(stockTicker => {
          const latestPrice = parseFloat(latestPrices[stockTicker]);
          const priorPrice = prevPriceData[stockTicker]?.price || priorPriceValues[stockTicker];
          const priceDifference = priorPrice ? latestPrice - priorPrice : 0;

          updatedPriceData[stockTicker] = {
            price: latestPrice,
            change: priceDifference
          };
        });
        return updatedPriceData;
      });

      // Store previous prices for change calculations
      setPriorPriceValues(prevPriorPrices => {
        const updatedPriorPrices = {};
        Object.keys(latestPrices).forEach(stockTicker => {
          updatedPriorPrices[stockTicker] = parseFloat(latestPrices[stockTicker]);
        });
        return { ...prevPriorPrices, ...updatedPriorPrices };
      });

      // Maintain price history for visualization (last 12 data points)
      setPriceHistoryData(prevHistory => {
        const updatedHistory = { ...prevHistory };
        Object.keys(latestPrices).forEach(stockTicker => {
          const latestPrice = parseFloat(latestPrices[stockTicker]);
          if (!updatedHistory[stockTicker]) {
            updatedHistory[stockTicker] = [];
          }
          updatedHistory[stockTicker] = [...updatedHistory[stockTicker], latestPrice];
          if (updatedHistory[stockTicker].length > 12) {
            updatedHistory[stockTicker] = updatedHistory[stockTicker].slice(-12);
          }
        });
        return updatedHistory;
      });
    });

    // Cleanup WebSocket connection on component unmount
    return () => {
      websocketConnection.disconnect();
    };
  }, []);

  const displayNotification = (notificationText, notificationType) => {
    setNotificationToast({ message: notificationText, type: notificationType });
  };

  const subscribeToStock = async (stockTicker) => {
    if (userSubscriptions.includes(stockTicker)) {
      return;
    }

    setIsLoading(true);

    try {
      const apiResponse = await axios.post(`${API_ENDPOINT_BASE}/subscribe`, {
        email: user.email,
        ticker: stockTicker
      });

      if (apiResponse.data.success) {
        setUserSubscriptions(apiResponse.data.subscriptions);
        const modifiedUser = { ...user, subscriptions: apiResponse.data.subscriptions };
        onUserUpdate(modifiedUser);
        localStorage.setItem('stockDashboardUser', JSON.stringify(modifiedUser));
        displayNotification('Successfully subscribed!', 'success');
      }
    } catch (apiError) {
      displayNotification(apiError.response?.data?.error || 'Failed to subscribe. Please try again.', 'error');
      console.error('Subscribe error:', apiError);
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromStock = async (stockTicker) => {
    setIsLoading(true);

    try {
      const apiResponse = await axios.post(`${API_ENDPOINT_BASE}/unsubscribe`, {
        email: user.email,
        ticker: stockTicker
      });

      if (apiResponse.data.success) {
        setUserSubscriptions(apiResponse.data.subscriptions);
        const modifiedUser = { ...user, subscriptions: apiResponse.data.subscriptions };
        onUserUpdate(modifiedUser);
        localStorage.setItem('stockDashboardUser', JSON.stringify(modifiedUser));
        displayNotification('Successfully unsubscribed!', 'success');
      }
    } catch (apiError) {
      displayNotification(apiError.response?.data?.error || 'Failed to unsubscribe. Please try again.', 'error');
      console.error('Unsubscribe error:', apiError);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStockList = AVAILABLE_STOCK_TICKERS.filter(stockTicker =>
    stockTicker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    COMPANY_NAMES[stockTicker]?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const subscribedStockList = AVAILABLE_STOCK_TICKERS.filter(stockTicker => userSubscriptions.includes(stockTicker));
  const stocksToDisplay = selectedViewTab === 'subscribed' ? subscribedStockList : filteredStockList;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {notificationToast && (
        <NotificationToast
          message={notificationToast.message}
          type={notificationToast.type}
          onClose={() => setNotificationToast(null)}
        />
      )}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-64 bg-slate-900/95 lg:bg-slate-900/50 border-r border-slate-800/50 transform transition-transform duration-300 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 p-2 rounded-xl">
              <TrendingUp size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">TradePulse</h1>
          </div>
          <p className="text-xs text-slate-500 ml-12">Market Dashboard</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setSelectedViewTab('subscribed')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              selectedViewTab === 'subscribed'
                ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/20 text-violet-400 border border-violet-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">My Watchlist</span>
            <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
              selectedViewTab === 'subscribed' ? 'bg-violet-500/20 text-violet-400' : 'bg-slate-800 text-slate-500'
            }`}>
              {userSubscriptions.length}
            </span>
          </button>
          <button
            onClick={() => setSelectedViewTab('all')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              selectedViewTab === 'all'
                ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/20 text-violet-400 border border-violet-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 size={20} />
            <span className="font-medium">All Stocks</span>
            <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
              selectedViewTab === 'all' ? 'bg-violet-500/20 text-violet-400' : 'bg-slate-800 text-slate-500'
            }`}>
              {AVAILABLE_STOCK_TICKERS.length}
            </span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/30 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.fullName || user.email}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
          >
            <LogOut size={18} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-slate-800/90 backdrop-blur-sm rounded-xl text-white border border-slate-700/50"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-slate-900/30 backdrop-blur-sm border-b border-slate-800/50 px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">
                {selectedViewTab === 'subscribed' ? 'My Watchlist' : 'Market Overview'}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {selectedViewTab === 'subscribed' 
                  ? `${userSubscriptions.length} tracked stocks` 
                  : 'Browse all available stocks'}
              </p>
            </div>
            {selectedViewTab === 'all' && (
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type="text"
                  placeholder="Search stocks..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full pl-12 pr-5 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200"
                />
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">

          {stocksToDisplay.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-3xl mb-6 border border-violet-500/20">
                <TrendingUp size={40} className="text-violet-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {selectedViewTab === 'subscribed' ? 'Your watchlist is empty' : 'No stocks found'}
              </h3>
              <p className="text-slate-400 text-center max-w-md">
                {selectedViewTab === 'subscribed'
                  ? 'Start tracking stocks to see real-time price updates and analytics'
                  : 'Try adjusting your search terms or browse all available stocks'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {stocksToDisplay.map(stockTicker => (
                <StockCardComponent
                  key={stockTicker}
                  ticker={stockTicker}
                  subscribed={userSubscriptions.includes(stockTicker)}
                  onSubscribe={subscribeToStock}
                  onUnsubscribe={unsubscribeFromStock}
                  priceData={currentPriceData[stockTicker]}
                  historicalData={priceHistoryData[stockTicker] || []}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default StockDashboard;
