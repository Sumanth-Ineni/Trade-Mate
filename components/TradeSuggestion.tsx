
import React, { useState, useEffect } from 'react';
import { getDailySuggestion } from '../services/geminiService';
import type { TradeSuggestionData } from '../types';

export const TradeSuggestion: React.FC = () => {
  const [suggestion, setSuggestion] = useState<TradeSuggestionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestion = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getDailySuggestion();
        setSuggestion(response);
      } catch (error) {
        console.error("Error fetching daily suggestion:", error);
        setError("Could not load a suggestion at this time.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestion();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
          <span className="text-gray-300 ml-2">Generating today's insight...</span>
        </div>
      );
    }

    if (error) {
        return <p className="text-red-400">{error}</p>;
    }
    
    if (suggestion) {
      const actionColor = suggestion.action === 'Buy' ? 'text-green-400' : 'text-red-400';

      return (
        <div className="space-y-4 text-gray-300 w-full">
            <div>
                <p className="text-sm text-gray-400">Suggestion</p>
                <p className={`text-xl font-bold ${actionColor}`}>{suggestion.action.toUpperCase()} {suggestion.ticker.toUpperCase()}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-400">Target Price</p>
                    <p className="text-lg font-semibold">{suggestion.targetPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                </div>
                {suggestion.stopLossPrice && (
                    <div>
                        <p className="text-sm text-gray-400">Stop-Loss</p>
                        <p className="text-lg font-semibold">{suggestion.stopLossPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm text-gray-400">Rationale</p>
                <p className="text-sm whitespace-pre-wrap">{suggestion.rationale}</p>
            </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-white">AI Trade Suggestion</h2>
      <div className="bg-gray-700/50 p-4 rounded-md min-h-[180px] flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
};
