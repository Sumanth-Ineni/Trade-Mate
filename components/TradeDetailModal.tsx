import React from 'react';
import type { Trade } from '../types';
import { TradeType } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface OhlcData {
  open: number;
  high: number;
  low: number;
  close: number;
}

interface TradeDetailModalProps {
  trade: Trade;
  ohlc: OhlcData | null;
  isLoading: boolean;
  onClose: () => void;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode; className?: string }> = ({ label, value, className }) => (
  <div className={`flex justify-between items-center py-3 ${className}`}>
    <dt className="text-sm font-medium text-gray-400">{label}</dt>
    <dd className="mt-1 text-sm text-white sm:mt-0">{value}</dd>
  </div>
);

export const TradeDetailModal: React.FC<TradeDetailModalProps> = ({ trade, ohlc, isLoading, onClose }) => {
  const tradeValue = trade.price * trade.quantity;
  const pnlColor = trade.type === TradeType.Buy ? 'text-red-400' : 'text-green-400';

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity"
      aria-labelledby="trade-detail-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 id="trade-detail-modal-title" className="text-xl font-semibold text-white">
            Trade Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
             <div className="flex items-center justify-center h-48">
                <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse"></div>
                <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s] mx-2"></div>
                <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
            </div>
          ) : (
            <dl className="divide-y divide-gray-700">
              <DetailRow label="Ticker" value={<span className="font-bold text-cyan-400">{trade.ticker}</span>} />
              <DetailRow label="Date" value={`${new Date(trade.date).toLocaleDateString()} at ${trade.time}`} />
              <DetailRow label="Type" value={
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${trade.type === TradeType.Buy ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {trade.type}
                </span>
              }/>
              <DetailRow label="Price" value={`$${trade.price.toFixed(2)}`} />
              <DetailRow label="Quantity" value={trade.quantity.toLocaleString()} />
              <DetailRow label="Total Value" value={<span className={pnlColor}>{trade.type === TradeType.Buy ? '-' : '+'}{tradeValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>} />
              <DetailRow label="Trade Rating" value={trade.rating.toFixed(3)} />
              
              {ohlc && (
                <>
                  <div className="pt-4">
                    <h3 className="text-md font-semibold text-gray-300">Daily Market Data</h3>
                  </div>
                  <DetailRow label="Open" value={`$${ohlc.open.toFixed(2)}`} className="pt-2"/>
                  <DetailRow label="High" value={`$${ohlc.high.toFixed(2)}`} />
                  <DetailRow label="Low" value={`$${ohlc.low.toFixed(2)}`} />
                  <DetailRow label="Close" value={`$${ohlc.close.toFixed(2)}`} />
                </>
              )}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
};
