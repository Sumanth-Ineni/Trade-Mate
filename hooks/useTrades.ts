
import { useState, useMemo } from 'react';
import type { Trade, SortConfig, SortableTradeKeys } from '../types';
import { TradeType } from '../types';

const INITIAL_PAGE_SIZE = 15;

// Mock initial data
const initialTrades: Trade[] = [
    { id: '1', date: '2024-07-20', time: '09:30:05', ticker: 'AAPL', type: TradeType.Buy, price: 150.50, quantity: 10, rating: 0.75 },
    { id: '2', date: '2024-07-20', time: '10:15:22', ticker: 'GOOGL', type: TradeType.Buy, price: 2800.00, quantity: 2, rating: 0.88 },
    { id: '3', date: '2024-07-21', time: '14:05:00', ticker: 'AAPL', type: TradeType.Sell, price: 155.25, quantity: 10, rating: -0.40 },
    { id: '4', date: '2024-07-22', time: '11:00:00', ticker: 'TSLA', type: TradeType.Buy, price: 650.00, quantity: 5, rating: 0.15 },
    { id: '5', date: '2024-07-23', time: '15:45:10', ticker: 'MSFT', type: TradeType.Buy, price: 300.10, quantity: 8, rating: 0.92 },
    { id: '6', date: '2024-07-19', time: '09:45:10', ticker: 'NVDA', type: TradeType.Buy, price: 125.10, quantity: 20, rating: 0.65 },
    { id: '7', date: '2024-07-18', time: '12:45:10', ticker: 'AMD', type: TradeType.Sell, price: 162.40, quantity: 15, rating: -0.85 },
];

export const useTrades = () => {
    const [trades, setTrades] = useState<Trade[]>(initialTrades);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'descending' });
    const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);

    const addTrade = (trade: Omit<Trade, 'id' | 'rating'>) => {
        const newTrade: Trade = {
            ...trade,
            id: new Date().toISOString() + Math.random(),
            rating: (Math.random() * 2 - 1), // Mock rating
        };
        setTrades(prevTrades => [newTrade, ...prevTrades]);
    };

    const sortedTrades = useMemo(() => {
        const sortableTrades = [...trades];
        sortableTrades.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (sortConfig.key === 'date') {
                const aDateTime = new Date(`${a.date}T${a.time}`).getTime();
                const bDateTime = new Date(`${b.date}T${b.time}`).getTime();
                 if (aDateTime < bDateTime) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aDateTime > bDateTime) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        return sortableTrades;
    }, [trades, sortConfig]);
    
    const visibleTrades = useMemo(() => sortedTrades.slice(0, visibleCount), [sortedTrades, visibleCount]);
    
    const loadMore = () => {
        setVisibleCount(prevCount => prevCount + INITIAL_PAGE_SIZE);
    };
    
    const hasMore = visibleCount < sortedTrades.length;

    return { trades, addTrade, sortConfig, setSortConfig, visibleTrades, loadMore, hasMore };
};
