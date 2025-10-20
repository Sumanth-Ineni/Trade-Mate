
import React, { useState, useEffect } from 'react';
import { getDailySuggestion } from '../services/geminiService';

export const TradeSuggestion: React.FC = () => {
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestion = async () => {
      try {
        const response = await getDailySuggestion();
        setSuggestion(response);
      } catch (error) {
        console.error("Error fetching daily suggestion:", error);
        setSuggestion("Could not load a suggestion at this time.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestion();
  }, []);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-white">AI Trade Suggestion</h2>
      <div className="bg-gray-700/50 p-4 rounded-md">
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></div>
            <span className="text-gray-300 ml-2">Generating today's insight...</span>
          </div>
        ) : (
          <p className="text-gray-300 whitespace-pre-wrap">{suggestion}</p>
        )}
      </div>
    </div>
  );
};
