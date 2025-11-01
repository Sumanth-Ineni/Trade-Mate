import React, { useState } from 'react';
import type { Trade, SortConfig, SortableTradeKeys } from '../types';
import { TradeType } from '../types';
import { ArrowUpIcon, ArrowDownIcon } from './icons/SortIcons';
import { TradeDetailModal } from './TradeDetailModal';
import { getTradeOhlc, getTradeAnalysis } from '../services/tradeApi';

interface TradeListProps {
  trades: Trade[];
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
  loadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
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

export const TradeList: React.FC<TradeListProps> = ({ trades, sortConfig, setSortConfig, loadMore, hasMore, isLoading }) => {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [tradeOhlc, setTradeOhlc] = useState<OhlcData | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<{ [key: string]: { analysis: string; isLoading: boolean; error?: string } }>({});


  const handleRowClick = async (tradeId: string) => {
    const isAlreadyExpanded = expandedTradeId === tradeId;
    setExpandedTradeId(isAlreadyExpanded ? null : tradeId);

    // Fetch analysis if it's not already cached and we are expanding the row
    if (!isAlreadyExpanded && !analysisData[tradeId]) {
      setAnalysisData(prev => ({ ...prev, [tradeId]: { analysis: '', isLoading: true } }));
      try {
        const analysis = await getTradeAnalysis(tradeId);
        setAnalysisData(prev => ({ ...prev, [tradeId]: { analysis, isLoading: false } }));
      } catch (error) {
        console.error("Failed to fetch trade analysis:", error);
        const errorMessage = error instanceof Error ? error.message : "Could not load analysis.";
        setAnalysisData(prev => ({ ...prev, [tradeId]: { analysis: '', isLoading: false, error: errorMessage } }));
      }
    }
  };


  const handleOpenModal = async (trade: Trade) => {
    setSelectedTrade(trade);
    setIsModalLoading(true);
    setTradeOhlc(null); // Clear previous data
    try {
      const ohlc = await getTradeOhlc(trade.ticker, trade.date);
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
              <React.Fragment key={trade.id}>
                <tr className="hover:bg-gray-700/50 cursor-pointer" onClick={() => handleRowClick(trade.id)}>
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
                      {/* <div className="flex items-center">
                          <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden mr-2">
                            <div className={`h-full ${getRatingColor(trade.rating)}`} style={{ width: `${(trade.rating + 1) / 2 * 100}%`}}></div>
                          </div>
                          <span className="font-mono">{trade.rating?.toFixed(2)}</span>
                      </div> */}
                  </td>
                </tr>
                {expandedTradeId === trade.id && (
                  <tr className="bg-gray-900/70">
                    <td colSpan={6} className="p-4">
                      {analysisData[trade.id]?.isLoading ? (
                         <div className="flex items-center justify-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
                        </div>
                      ) : analysisData[trade.id]?.error ? (
                        <div className="text-red-400 text-center text-sm">{analysisData[trade.id].error}</div>
                      ) : (
                        <div className="text-gray-300">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-cyan-400 mb-2">AI Analysis</h4>
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleOpenModal(trade); }} 
                                className="text-xs bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md transition-colors"
                              >
                                View Market Details
                              </button>
                          </div>
                          <p className="text-sm italic border-l-2 border-cyan-700 pl-3">{analysisData[trade.id]?.analysis}</p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {isLoading && trades.length === 0 && <p className="text-center py-8 text-gray-400">Loading trades...</p>}
      {!isLoading && trades.length === 0 && <p className="text-center py-8 text-gray-400">No trades match the current filter.</p>}
      {hasMore && (
        <div className="mt-6 text-center">
          <button onClick={loadMore} disabled={isLoading} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-600 disabled:cursor-wait">
            {isLoading ? 'Loading...' : 'Load More'}
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