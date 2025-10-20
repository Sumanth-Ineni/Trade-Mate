
import React, { useState, useMemo } from 'react';
import { TradeForm } from './components/TradeForm';
import { TradeList } from './components/TradeList';
import { PnLCard } from './components/PnLCard';
import { TradeSuggestion } from './components/TradeSuggestion';
import { useTrades } from './hooks/useTrades';
import type { Trade } from './types';

const App: React.FC = () => {
  const { 
    trades, 
    addTrade, 
    sortConfig, 
    setSortConfig,
    visibleTrades,
    loadMore,
    hasMore
  } = useTrades();
  
  const today = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState({ start: '2023-01-01', end: today });

  const filteredTrades = useMemo(() => {
    return visibleTrades.filter(trade => {
      const tradeDate = new Date(trade.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // Include the whole end day
      return tradeDate >= startDate && tradeDate <= endDate;
    });
  }, [visibleTrades, dateRange]);

  const pnl = useMemo(() => {
    return filteredTrades.reduce((acc, trade) => {
      if (trade.type === 'Buy') {
        return acc - (trade.price * trade.quantity);
      } else {
        return acc + (trade.price * trade.quantity);
      }
    }, 0);
  }, [filteredTrades]);
  
  const handleAddTrade = (newTrade: Omit<Trade, 'id' | 'rating'>) => {
    addTrade(newTrade);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-cyan-400">Trade-Tracker Pro</h1>
          <p className="text-gray-400 mt-2">Log, analyze, and get AI-powered insights for your trades.</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-white">Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PnLCard pnl={pnl} />
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium mb-2 text-gray-300">Filter Trades by Date</h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="bg-gray-700 text-white rounded-md p-2 w-full focus:ring-2 focus:ring-cyan-500 border-gray-600"
                    />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="bg-gray-700 text-white rounded-md p-2 w-full focus:ring-2 focus:ring-cyan-500 border-gray-600"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <TradeList 
              trades={filteredTrades}
              sortConfig={sortConfig}
              setSortConfig={setSortConfig}
              loadMore={loadMore}
              hasMore={hasMore}
            />
          </div>

          <div className="lg:col-span-1 space-y-8">
            <TradeForm onSubmit={handleAddTrade} />
            <TradeSuggestion />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
