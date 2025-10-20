import React, { useState } from 'react';
import type { Trade, SortConfig, SortableTradeKeys } from '../types';
import { TradeType } from '../types';
import { ArrowUpIcon, ArrowDownIcon } from './icons/SortIcons';
import { TradeDetailModal } from './TradeDetailModal';
import { getOhlcData } from '../services/marketDataService';

interface TradeListProps {
  trades: Trade[];
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
  loadMore: () => void;
  hasMore: boolean;
}

interface OhlcData {
  open: number;
  high: number;
  low: number;
  close: number;
}

const SortableHeader: React.FC<{
  label: string;
  sortKey: SortableTradeKeys;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
  className?: string;
}> = ({ label, sortKey, sortConfig, setSortConfig, className }) => {
  const isSorted = sortConfig.key === sortKey;
  const direction = isSorted ? sortConfig.direction : undefined;

  const requestSort = (key: SortableTradeKeys) => {
    let newDirection: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      newDirection = 'descending';
    }
    setSortConfig({ key, direction: newDirection });
  };

  return (
    <th className={`px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer ${className}`} onClick={() => requestSort(sortKey)}>
      <div className="flex items-center">
        {label}
        <span className="ml-2">
          {direction === 'ascending' && <ArrowUpIcon />}
          {direction === 'descending' && <ArrowDownIcon />}
        </span>
      </div>
    </th>
  );
};

export const TradeList: React.FC<TradeListProps> = ({ trades, sortConfig, setSortConfig, loadMore, hasMore }) => {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [tradeOhlc, setTradeOhlc] = useState<OhlcData | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const handleRowClick = async (trade: Trade) => {
    setSelectedTrade(trade);
    setIsModalLoading(true);
    setTradeOhlc(null); // Clear previous data
    try {
      const ohlc = await getOhlcData(trade.ticker, trade.date);
      setTradeOhlc(ohlc);
    } catch (error) {
      console.error("Failed to fetch OHLC data for modal:", error);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedTrade(null);
    setTradeOhlc(null);
  };
  
  const getRatingColor = (rating: number) => {
    if (rating > 0.5) return 'bg-green-500';
    if (rating > 0) return 'bg-green-700';
    if (rating < -0.5) return 'bg-red-500';
    if (rating < 0) return 'bg-red-700';
    return 'bg-gray-500';
  };
    
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-white">Trade History</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700/50">
            <tr>
              <SortableHeader label="Date" sortKey="date" sortConfig={sortConfig} setSortConfig={setSortConfig} />
              <SortableHeader label="Ticker" sortKey="ticker" sortConfig={sortConfig} setSortConfig={setSortConfig} />
              <SortableHeader label="Type" sortKey="type" sortConfig={sortConfig} setSortConfig={setSortConfig} className="hidden sm:table-cell" />
              <SortableHeader label="Price" sortKey="price" sortConfig={sortConfig} setSortConfig={setSortConfig} />
              <SortableHeader label="Qty" sortKey="quantity" sortConfig={sortConfig} setSortConfig={setSortConfig} className="hidden md:table-cell" />
              <SortableHeader label="Rating" sortKey="rating" sortConfig={sortConfig} setSortConfig={setSortConfig} />
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {trades.map(trade => (
              <tr key={trade.id} className="hover:bg-gray-700/50 cursor-pointer" onClick={() => handleRowClick(trade)}>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div>{new Date(trade.date).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{trade.time}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{trade.ticker}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm hidden sm:table-cell">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${trade.type === TradeType.Buy ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {trade.type}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">${trade.price.toFixed(2)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300 hidden md:table-cell">{trade.quantity}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex items-center">
                        <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden mr-2">
                           <div className={`h-full ${getRatingColor(trade.rating)}`} style={{ width: `${(trade.rating + 1) / 2 * 100}%`}}></div>
                        </div>
                        <span className="font-mono">{trade.rating.toFixed(2)}</span>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {trades.length === 0 && <p className="text-center py-8 text-gray-400">No trades match the current filter.</p>}
      {hasMore && (
        <div className="mt-6 text-center">
          <button onClick={loadMore} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">
            Load More
          </button>
        </div>
      )}
      {selectedTrade && (
        <TradeDetailModal
          trade={selectedTrade}
          ohlc={tradeOhlc}
          isLoading={isModalLoading}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};