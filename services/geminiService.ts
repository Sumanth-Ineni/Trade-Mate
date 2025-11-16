import type { TradeSuggestionData } from '../types';

const API_BASE_URL = 'https://trade-mate-backend-1093010213661.europe-west1.run.app/api';

export const getDailySuggestion = async (prompt?: string): Promise<TradeSuggestionData> => {
    const params = new URLSearchParams();
    if (prompt) {
        params.append('prompt', prompt);
    }
    const url = `${API_BASE_URL}/suggestions/daily${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch daily suggestion' }));
        throw new Error(errorData.message || 'An unknown error occurred');
    }
    return response.json();
};

export const getTickerSuggestion = async (ticker: string): Promise<string> => {
    const params = new URLSearchParams({ ticker });
    const response = await fetch(`${API_BASE_URL}/suggestions/ticker?${params.toString()}`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch ticker suggestion' }));
        throw new Error(errorData.message || 'An unknown error occurred');
    }
    const data = await response.json();
    return data.suggestion;
};