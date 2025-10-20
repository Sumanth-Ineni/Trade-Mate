
// Mock OHLC data for specific tickers and dates
const mockOhlcDatabase: { [key: string]: { [date: string]: { open: number; high: number; low: number; close: number } } } = {
  'AAPL': {
    '2024-07-20': { open: 149.80, high: 151.00, low: 149.50, close: 150.75 },
    '2024-07-21': { open: 151.00, high: 156.00, low: 150.80, close: 155.00 },
  },
  'GOOGL': {
    '2024-07-20': { open: 2790.00, high: 2810.00, low: 2785.00, close: 2805.00 },
  },
  'TSLA': {
    '2024-07-22': { open: 645.00, high: 660.00, low: 640.00, close: 655.00 },
  },
  'MSFT': {
    '2024-07-23': { open: 298.00, high: 301.00, low: 297.50, close: 300.50 },
  },
  'NVDA': {
    '2024-07-19': { open: 120.00, high: 130.00, low: 119.50, close: 128.00 },
  },
  'AMD': {
      '2024-07-18': { open: 165.00, high: 166.00, low: 160.00, close: 161.00 },
  }
};

/**
 * Fetches mock OHLC data for a given ticker and date.
 * Simulates a network request.
 * @param ticker The stock ticker symbol.
 * @param date The date in 'YYYY-MM-DD' format.
 * @returns A promise that resolves to the OHLC data or a default value.
 */
export const getOhlcData = async (ticker: string, date: string): Promise<{ open: number; high: number; low: number; close: number }> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const tickerData = mockOhlcDatabase[ticker.toUpperCase()];
      if (tickerData && tickerData[date]) {
        resolve(tickerData[date]);
      } else {
        // Return a fallback with some volatility if no specific mock data is found
        const randomBase = Math.random() * 500 + 50;
        const low = randomBase * 0.98;
        const high = randomBase * 1.02;
        const open = low + Math.random() * (high - low);
        const close = low + Math.random() * (high - low);
        resolve({ open, high, low, close });
      }
    }, 300); // Simulate network latency
  });
};
