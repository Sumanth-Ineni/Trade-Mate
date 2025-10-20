import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Trade, SortConfig } from '../types';
import { getTrades, addTrade as apiAddTrade } from '../services/tradeApi';

const PAGE_SIZE = 15;

export const useTrades = () => {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'descending' });
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    const fetchAndSetTrades = useCallback(async (reset = false) => {
        setIsLoading(true);
        try {
            const currentPage = reset ? 1 : page;
            const { trades: newTrades, hasMore: newHasMore } = await getTrades(sortConfig, currentPage, PAGE_SIZE);
            setTrades(prev => reset ? newTrades : [...prev, ...newTrades]);
            setHasMore(newHasMore);
            if (reset) setPage(1);
        } catch (error) {
            console.error("Failed to fetch trades:", error);
            // Optionally set an error state here
        } finally {
            setIsLoading(false);
        }
    }, [sortConfig, page]);

    useEffect(() => {
        fetchAndSetTrades(true); // Reset and fetch on sort change
    }, [sortConfig]);

    const addTrade = async (trade: Omit<Trade, 'id' | 'rating'>) => {
        setIsAdding(true);
        try {
            await apiAddTrade(trade);
            // After adding, refetch to see the new trade
            // This is simpler than trying to merge and re-sort on the client
            setSortConfig(current => ({ ...current })); // Trigger refetch
        } catch(error) {
            console.error("Failed to add trade:", error);
            throw error; // re-throw to be caught in form
        } finally {
            setIsAdding(false);
        }
    };
    
    const loadMore = () => {
        if (!isLoading && hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    };

    useEffect(() => {
        if (page > 1) {
            fetchAndSetTrades();
        }
    }, [page]);
    
    return { 
      trades, 
      addTrade, 
      sortConfig, 
      setSortConfig, 
      loadMore, 
      hasMore, 
      isLoading,
      isAdding
    };
};
