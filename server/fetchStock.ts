import fetch from 'node-fetch';

// Alpha Vantage API Key
const API_KEY: string = 'AAGVCGCR9WN5N19K'; 

// --- 1. Type Definitions ---

/**
 * Defines the structure for a single daily OHLCV data point.
 */
interface DailyOHLCV {
  '1. open': string;
  '2. high': string;
  '3. low': string;
  '4. close': string;
  '5. volume': string;
}

/**
 * Defines the structure of the time series part of the Alpha Vantage response.
 * Keys are dates (e.g., "YYYY-MM-DD").
 */
interface TimeSeriesDaily {
  [date: string]: DailyOHLCV;
}

/**
 * Defines the overall structure of the Alpha Vantage Daily API response.
 */
interface AlphaVantageDailyResponse {
  'Meta Data': any; 
  'Time Series (Daily)'?: TimeSeriesDaily; // Key is specific to daily data
  'Error Message'?: string;
  'Note'?: string; 
}

// --- 2. Data Fetching Function ---

/**
 * Fetches daily (End-of-Day) OHLC data for a given stock symbol.
 * @param symbol The stock ticker symbol (e.g., 'AAPL', 'MSFT').
 */
export async function getDailyOHLC(symbol: string): Promise<TimeSeriesDaily | null> {
  // **KEY CHANGE**: Use TIME_SERIES_DAILY function
  const functionType: string = 'TIME_SERIES_DAILY';
  
  const url: string = 
    `https://www.alphavantage.co/query?function=${functionType}&symbol=${symbol}&apikey=${API_KEY}`;

  try {
    console.log(`Fetching daily OHLC data for ${symbol}...`);
    
    const response = await fetch(url);
    const data = await response.json() as AlphaVantageDailyResponse;

    if (data['Error Message'] || data['Note']) {
      console.error('API Error or Note:', data['Error Message'] || data['Note']);
      return null;
    }
    console.log(`Raw API response for ${symbol}:`, data);
    // **KEY CHANGE**: Access the data using the "Time Series (Daily)" key
    const timeSeriesKey: keyof AlphaVantageDailyResponse = 'Time Series (Daily)';
    const timeSeries: TimeSeriesDaily | undefined = data[timeSeriesKey]; 

    if (!timeSeries) {
        console.log(`No daily time series data found for ${symbol}.`);
        return null;
    }

    // console.log(`Successfully fetched daily data for ${symbol}. Total entries: ${Object.keys(timeSeries).length}`);
    
    // // Log the data for the last few days
    // console.log('\n--- Recent Daily OHLC Data ---');
    
    // // Get the dates (keys) and sort them in descending order (most recent first)
    // const dates: string[] = Object.keys(timeSeries).sort().reverse(); 
    
    // // Loop through the last 15 days
    // for (let i = 0; i < Math.min(15, dates.length); i++) {
    //     const date: string = dates[i];
    //     const dailyData: DailyOHLCV = timeSeries[date] as DailyOHLCV;
        
    //     console.log(`\nDate: **${date}**`);
    //     console.log(`Open: $${dailyData['1. open']}`);
    //     console.log(`High: $${dailyData['2. high']}`);
    //     console.log(`Low: $${dailyData['3. low']}`);
    //     console.log(`Close: $${dailyData['4. close']}`);
    //     console.log(`Volume: ${dailyData['5. volume']}`);
    // }

    return timeSeries; 

  } catch (error) {
    console.error('An error occurred during the API request:', (error as Error).message);
    return null;
  }
}
