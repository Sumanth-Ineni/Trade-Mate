import React, { useState, useEffect, useCallback } from 'react';
import type { Trade, TradeType } from '../types';
import { getTickerSuggestion } from '../services/geminiService';
import { TradeType as TradeTypeEnum } from '../types';

interface TradeFormProps {
  onSubmit: (trade: Omit<Trade, 'id' | 'rating'>) => Promise<void>;
}

export const TradeForm: React.FC<TradeFormProps> = ({ onSubmit }) => {
  const now = new Date();
  const [date, setDate] = useState(now.toISOString().split('T')[0]);
  const [time, setTime] = useState(now.toTimeString().split(' ')[0]);
  const [ticker, setTicker] = useState('');
  const [tradeType, setTradeType] = useState<TradeType>(TradeTypeEnum.Buy);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
  
  const validateForm = (): boolean => {
      const newErrors: { [key: string]: string } = {};
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today

      if (!ticker.trim()) {
          newErrors.ticker = 'Ticker is required.';
      }

      const priceValue = parseFloat(price);
      if (isNaN(priceValue) || priceValue <= 0) {
          newErrors.price = 'Price must be a positive number.';
      }

      const quantityValue = parseInt(quantity, 10);
       if (isNaN(quantityValue) || quantityValue <= 0 || parseFloat(quantity) % 1 !== 0) {
          newErrors.quantity = 'Quantity must be a positive whole number.';
      }

      if (!date) {
        newErrors.date = 'Date is required.';
      } else if (new Date(date) > today) {
        newErrors.date = 'Date cannot be in the future.';
      }

      if(!time) {
          newErrors.time = 'Time is required.';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
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
      setErrors({});
    } catch (error) {
      console.error("Failed to submit trade:", error);
      alert("There was an error submitting your trade. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-white">Log New Trade</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-300">Date</label>
            <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className={`mt-1 w-full bg-gray-700 text-white rounded-md p-2 border ${errors.date ? 'border-red-500' : 'border-gray-600'} focus:ring-2 focus:ring-cyan-500`} aria-invalid={!!errors.date} aria-describedby={errors.date ? 'date-error' : undefined} />
            {errors.date && <p id="date-error" className="mt-1 text-sm text-red-400">{errors.date}</p>}
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-300">Time</label>
            <input type="time" id="time" value={time} step="1" onChange={(e) => setTime(e.target.value)} className={`mt-1 w-full bg-gray-700 text-white rounded-md p-2 border ${errors.time ? 'border-red-500' : 'border-gray-600'} focus:ring-2 focus:ring-cyan-500`} aria-invalid={!!errors.time} aria-describedby={errors.time ? 'time-error' : undefined} />
             {errors.time && <p id="time-error" className="mt-1 text-sm text-red-400">{errors.time}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="ticker" className="block text-sm font-medium text-gray-300">Ticker</label>
          <input type="text" id="ticker" value={ticker} onChange={(e) => setTicker(e.target.value)} placeholder="e.g., AAPL" className={`mt-1 w-full bg-gray-700 text-white rounded-md p-2 border ${errors.ticker ? 'border-red-500' : 'border-gray-600'} focus:ring-2 focus:ring-cyan-500`} aria-invalid={!!errors.ticker} aria-describedby={errors.ticker ? 'ticker-error' : undefined} />
          {errors.ticker && <p id="ticker-error" className="mt-1 text-sm text-red-400">{errors.ticker}</p>}
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
            <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} step="0.01" placeholder="150.25" className={`mt-1 w-full bg-gray-700 text-white rounded-md p-2 border ${errors.price ? 'border-red-500' : 'border-gray-600'} focus:ring-2 focus:ring-cyan-500`} aria-invalid={!!errors.price} aria-describedby={errors.price ? 'price-error' : undefined} />
            {errors.price && <p id="price-error" className="mt-1 text-sm text-red-400">{errors.price}</p>}
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-300">Quantity</label>
            <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} step="1" placeholder="100" className={`mt-1 w-full bg-gray-700 text-white rounded-md p-2 border ${errors.quantity ? 'border-red-500' : 'border-gray-600'} focus:ring-2 focus:ring-cyan-500`} aria-invalid={!!errors.quantity} aria-describedby={errors.quantity ? 'quantity-error' : undefined} />
            {errors.quantity && <p id="quantity-error" className="mt-1 text-sm text-red-400">{errors.quantity}</p>}
          </div>
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:bg-cyan-800 disabled:cursor-not-allowed">
          {isSubmitting ? 'Adding...' : 'Add Trade'}
        </button>
      </form>
    </div>
  );
};