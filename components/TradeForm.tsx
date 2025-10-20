
import React, { useState, useEffect, useCallback } from 'react';
import type { Trade, TradeType } from '../types';
import { getTickerSuggestion } from '../services/geminiService';
import { TradeType as TradeTypeEnum } from '../types';

interface TradeFormProps {
  onSubmit: (trade: Omit<Trade, 'id' | 'rating'>) => void;
}

export const TradeForm: React.FC<TradeFormProps> = ({ onSubmit }) => {
  const now = new Date();
  const [date, setDate] = useState(now.toISOString().split('T')[0]);
  const [time, setTime] = useState(now.toTimeString().split(' ')[0]);
  const [ticker, setTicker] = useState('');
  const [tradeType, setTradeType] = useState<TradeType>(TradeTypeEnum.Buy);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const [suggestion, setSuggestion] = useState('');
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

  const fetchSuggestion = useCallback(async (currentTicker: string) => {
    if (currentTicker.length < 2) {
      setSuggestion('');
      return;
    }
    setIsLoadingSuggestion(true);
    try {
      const response = await getTickerSuggestion(currentTicker);
      setSuggestion(response);
    } catch (error) {
      console.error('Error fetching ticker suggestion:', error);
      setSuggestion('Could not fetch suggestion.');
    } finally {
      setIsLoadingSuggestion(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (ticker) {
        fetchSuggestion(ticker);
      }
    }, 1000); // Debounce API call

    return () => {
      clearTimeout(handler);
    };
  }, [ticker, fetchSuggestion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !ticker || !price || !quantity) {
      alert('Please fill out all fields.');
      return;
    }
    onSubmit({
      date,
      time,
      ticker: ticker.toUpperCase(),
      type: tradeType,
      price: parseFloat(price),
      quantity: parseInt(quantity, 10),
    });
    // Reset form
    setTicker('');
    setPrice('');
    setQuantity('');
    setSuggestion('');
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-white">Log New Trade</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-300">Date</label>
            <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full bg-gray-700 text-white rounded-md p-2 border-gray-600 focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-300">Time</label>
            <input type="time" id="time" value={time} step="1" onChange={(e) => setTime(e.target.value)} className="mt-1 w-full bg-gray-700 text-white rounded-md p-2 border-gray-600 focus:ring-2 focus:ring-cyan-500" />
          </div>
        </div>
        <div>
          <label htmlFor="ticker" className="block text-sm font-medium text-gray-300">Ticker</label>
          <input type="text" id="ticker" value={ticker} onChange={(e) => setTicker(e.target.value)} placeholder="e.g., AAPL" className="mt-1 w-full bg-gray-700 text-white rounded-md p-2 border-gray-600 focus:ring-2 focus:ring-cyan-500" />
        </div>
        { (isLoadingSuggestion || suggestion) && (
            <div className="bg-gray-700/50 p-3 rounded-md text-sm text-gray-300">
                {isLoadingSuggestion ? 'Analyzing ticker...' : suggestion}
            </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-300">Trade Type</label>
          <div className="mt-1 grid grid-cols-2 gap-2 rounded-md bg-gray-700 p-1">
            <button type="button" onClick={() => setTradeType(TradeTypeEnum.Buy)} className={`px-3 py-2 text-sm font-medium rounded ${tradeType === TradeTypeEnum.Buy ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Buy</button>
            <button type="button" onClick={() => setTradeType(TradeTypeEnum.Sell)} className={`px-3 py-2 text-sm font-medium rounded ${tradeType === TradeTypeEnum.Sell ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Sell</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-300">Price</label>
            <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} step="0.01" placeholder="150.25" className="mt-1 w-full bg-gray-700 text-white rounded-md p-2 border-gray-600 focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-300">Quantity</label>
            <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} step="1" placeholder="100" className="mt-1 w-full bg-gray-700 text-white rounded-md p-2 border-gray-600 focus:ring-2 focus:ring-cyan-500" />
          </div>
        </div>
        <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-md transition duration-300">Add Trade</button>
      </form>
    </div>
  );
};
