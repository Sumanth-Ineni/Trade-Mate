import type { Trade, SortConfig } from '../types';

// In a real app, this would be in a config file (e.g., .env)
const API_BASE_URL = '/api'; 

export const getTrades = async (
    sortConfig: SortConfig,
    page: number,
    limit: number
): Promise<{ trades: Trade[]; hasMore: boolean }> => {
    const params = new URLSearchParams({
        sortKey: sortConfig.key,
        sortDirection: sortConfig.direction,
        page: String(page),
        limit: String(limit),
    });
    
    const response = await fetch(`${API_BASE_URL}/trades?${params.toString()}`);
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch trades' }));
        throw new Error(errorData.message || 'An unknown error occurred');
    }
    return response.json();
};

export const addTrade = async (trade: Omit<Trade, 'id' | 'rating'>): Promise<Trade> => {
    const response = await fetch(`${API_BASE_URL}/trades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trade),
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to add trade' }));
        throw new Error(errorData.message || 'An unknown error occurred');
    }
    return response.json();
};

export const getTradeOhlc = async (ticker: string, date: string): Promise<{ open: number; high: number; low: number; close: number }> => {
    const params = new URLSearchParams({ ticker, date });
    const response = await fetch(`${API_BASE_URL}/ohlc?${params.toString()}`);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch OHLC data' }));
        throw new Error(errorData.message || 'An unknown error occurred');
    }
    return response.json();
};

export const getTradeAnalysis = async (tradeId: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/trades/${tradeId}/analysis`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch trade analysis' }));
        throw new Error(errorData.message || 'An unknown error occurred');
    }
    const data = await response.json();
    return data.analysis;
};