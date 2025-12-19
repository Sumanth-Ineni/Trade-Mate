import { Firestore } from "@google-cloud/firestore";
import { getDailyOHLC } from "./fetchStock.js";

// import db from './database/db.js'; // Your Firestore client initialization
const db = new Firestore();
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


let trades: Trade[] = [];

export const getOhlcDataForTrade = async (ticker: string, date: string): Promise<{ open: number; high: number; low: number; close: number }> => {
  const data = await getDailyOHLC(ticker.toUpperCase());
  if (data) {
    const dailyOhlc = data[date.toString() as keyof typeof data];
    if (dailyOhlc) {
      return {
        open: Number(dailyOhlc['1. open' as keyof typeof dailyOhlc]),
        high: Number(dailyOhlc['2. high' as keyof typeof dailyOhlc]),
        low: Number(dailyOhlc['3. low' as keyof typeof dailyOhlc]),
        close: Number(dailyOhlc['4. close' as keyof typeof dailyOhlc]),
      };
    } else {
      console.log(`No daily OHLC data found for ${ticker} on ${date}, using mock data.`);
      return { open: 0, high: 0, low: 0, close: 0 }; // Default OHLC data
    }
  } else {
    console.log(`No data returned for ${ticker}, using mock data.`);
    return { open: 0, high: 0, low: 0, close: 0 }; // Default OHLC data
  }
};

const getTradeData = async () => {
  const snapshot = await tradeCollection.get();
  const items = snapshot.docs.map((doc: any) => doc.data());
  const tradePromises = await items.map(async (trade: any) => {
    let rating = trade.rating;
    if (!rating) {
      const ohlc = await getOhlcDataForTrade(trade.ticker, trade.date);
      rating = calculateTradeRating(trade, ohlc);
    }
    return { ...trade, rating };
  });
  trades = await Promise.all(tradePromises);
  return trades;
};

// --- Data Access Functions ---

export const getTrades = async (sortConfig: SortConfig, page: number, limit: number) => {
  const trades = await getTradeData();
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

export const addTrade = async (trade: Omit<Trade, 'id' | 'rating'>): Promise<Trade> => {
  const ohlc = await getOhlcDataForTrade(trade.ticker, trade.date);
  console.log('OHLC data for new trade:', ohlc);
  const rating = calculateTradeRating(trade, ohlc);
  const newTrade: Trade = {
    ...trade,
    id: new Date().toISOString() + Math.random(),
    rating,
  };
  try {
    await tradeCollection.add(newTrade);
    trades.unshift(newTrade); // Add to the beginning for immediate visibility
    return newTrade;
  } catch (error) {
    console.error('POST /trades error:', error);
    throw error;
  }

};

export const getTradeById = async (id: string): Promise<Trade | undefined> => {
  const trade = await tradeCollection.where("id", "==", id).limit(1).get();
  if (trade.size > 0) {
    const doc = trade.docs[0];
    return doc.data() as Trade;
  }
  return undefined;
};

export const storeDailySuggestion = async (suggestion: any): Promise<void> => {
  const dateKey = new Date().toISOString().split('T')[0];
  const suggestionDoc = db.collection('dailySuggestions').doc(dateKey);
  await suggestionDoc.set({
    ...suggestion,
    date: dateKey,
    timestamp: Date.now(),
  });
}

export const getDailySuggestion = async (timestamp: number): Promise<any | null> => {
  const dateKey = new Date(timestamp).toISOString().split('T')[0];
  const suggestionDoc = db.collection('dailySuggestions').doc(dateKey);
  const doc = await suggestionDoc.get();
  if (doc.exists) {
    return doc.data();
  }
  return null;
}

export const getTradeSuggestions = async (sortConfig: SortConfig, limit: number) => {
  const snapshot = await db.collection('dailySuggestions')
    .orderBy(sortConfig.key, sortConfig.direction === 'ascending' ? 'asc' : 'desc')
    .limit(limit).get();

  return snapshot.docs.map((doc: any) => doc.data());
};