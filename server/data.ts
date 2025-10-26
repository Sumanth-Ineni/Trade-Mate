import db from './database/db.js'; // Your Firestore client initialization

const tradeCollection = db.collection('trades');
// NOTE: In a real application, types would be shared from a common package.
// For this environment, we are duplicating the necessary types.
export enum TradeType {
  Buy = 'Buy',
  Sell = 'Sell',
}
export interface Trade {
  id: string;
  date: string;
  time: string;
  ticker: string;
  type: TradeType;
  price: number;
  quantity: number;
  rating: number;
}
export type SortableTradeKeys = keyof Omit<Trade, 'id'>;
export interface SortConfig {
  key: SortableTradeKeys;
  direction: 'ascending' | 'descending';
}

// --- Business Logic: Rating Calculation ---
interface OhlcData { high: number; low: number; }

const calculateTradeRating = (trade: Pick<Trade, 'price' | 'type'>, ohlc: OhlcData): number => {
  const { price, type } = trade;
  const { high, low } = ohlc;
  const range = high - low;
  if (range <= 0) return 0;
  const normalizedPrice = (price - low) / range;
  if (type === TradeType.Buy) return 1 - 2 * normalizedPrice;
  if (type === TradeType.Sell) return 2 * normalizedPrice - 1;
  return 0;
};


// --- Data Layer (Simulated Database) ---

const mockOhlcDatabase: { [key: string]: { [date: string]: { open: number; high: number; low: number; close: number } } } = {
  'AAPL': {
    '2024-07-20': { open: 149.80, high: 151.00, low: 149.50, close: 150.75 },
    '2024-07-21': { open: 151.00, high: 156.00, low: 150.80, close: 155.00 },
  },
  'GOOGL': { '2024-07-20': { open: 2790.00, high: 2810.00, low: 2785.00, close: 2805.00 } },
  'TSLA': { '2024-07-22': { open: 645.00, high: 660.00, low: 640.00, close: 655.00 } },
  'MSFT': { '2024-07-23': { open: 298.00, high: 301.00, low: 297.50, close: 300.50 } },
  'NVDA': { '2024-07-19': { open: 120.00, high: 130.00, low: 119.50, close: 128.00 } },
  'AMD': { '2024-07-18': { open: 165.00, high: 166.00, low: 160.00, close: 161.00 } },
};

const initialTradesData: Omit<Trade, 'rating' | 'id'>[] = [
    { date: '2024-07-20', time: '09:30:05', ticker: 'AAPL', type: TradeType.Buy, price: 150.50, quantity: 10 },
    { date: '2024-07-20', time: '10:15:22', ticker: 'GOOGL', type: TradeType.Buy, price: 2800.00, quantity: 2 },
    { date: '2024-07-21', time: '14:05:00', ticker: 'AAPL', type: TradeType.Sell, price: 155.25, quantity: 10 },
    { date: '2024-07-22', time: '11:00:00', ticker: 'TSLA', type: TradeType.Buy, price: 650.00, quantity: 5 },
    { date: '2024-07-23', time: '15:45:10', ticker: 'MSFT', type: TradeType.Buy, price: 300.10, quantity: 8 },
    { date: '2024-07-19', time: '09:45:10', ticker: 'NVDA', type: TradeType.Buy, price: 125.10, quantity: 20 },
    { date: '2024-07-18', time: '12:45:10', ticker: 'AMD', type: TradeType.Sell, price: 162.40, quantity: 15 },
];

let trades: Trade[] = [];

export const getOhlcDataForTrade = (ticker: string, date: string): { open: number; high: number; low: number; close: number } => {
  const tickerData = mockOhlcDatabase[ticker.toUpperCase()];
  if (tickerData && tickerData[date]) {
    return tickerData[date];
  }
  const randomBase = Math.random() * 500 + 50;
  const low = randomBase * 0.98;
  const high = randomBase * 1.02;
  const open = low + Math.random() * (high - low);
  const close = low + Math.random() * (high - low);
  return { open, high, low, close };
};

const initializeData = async () => {
  const snapshot = await tradeCollection.get();
    const items = snapshot.docs.map((doc: any) => doc.data());
    console.log(items);
    trades = initialTradesData.map((trade, index) => {
        const ohlc = getOhlcDataForTrade(trade.ticker, trade.date);
        const rating = calculateTradeRating(trade, ohlc);
        return { ...trade, id: `${Date.now()}-${index}`, rating };
    });
};

initializeData();

// --- Data Access Functions ---

export const getTrades = (sortConfig: SortConfig, page: number, limit: number) => {
    const sortedTrades = [...trades].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (sortConfig.key === 'date') {
            const aDateTime = new Date(`${a.date}T${a.time}`).getTime();
            const bDateTime = new Date(`${b.date}T${b.time}`).getTime();
            if (aDateTime < bDateTime) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aDateTime > bDateTime) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
    });

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTrades = sortedTrades.slice(startIndex, endIndex);
    const hasMore = endIndex < sortedTrades.length;

    return { trades: paginatedTrades, hasMore };
};

export const addTrade = (trade: Omit<Trade, 'id' | 'rating'>): Trade => {
    const ohlc = getOhlcDataForTrade(trade.ticker, trade.date);
    const rating = calculateTradeRating(trade, ohlc);
    const newTrade: Trade = {
        ...trade,
        id: new Date().toISOString() + Math.random(),
        rating,
    };
    trades.unshift(newTrade); // Add to the beginning for immediate visibility
    return newTrade;
};

export const getTradeById = (id: string): Trade | undefined => {
  return trades.find(trade => trade.id === id);
};