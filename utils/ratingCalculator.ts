
import type { Trade } from '../types';
import { TradeType } from '../types';

interface OhlcData {
  high: number;
  low: number;
}

/**
 * Calculates a trade rating from -1 to 1 based on its price relative to the day's high and low.
 * For Buys, closer to Low is better (1).
 * For Sells, closer to High is better (1).
 * @param trade The trade object.
 * @param ohlc The OHLC data for the day of the trade.
 * @returns A rating number between -1 and 1.
 */
export const calculateTradeRating = (
  trade: Pick<Trade, 'price' | 'type'>,
  ohlc: OhlcData
): number => {
  const { price, type } = trade;
  const { high, low } = ohlc;

  const range = high - low;

  if (range <= 0) {
    return 0; // No price movement or invalid data, neutral rating
  }

  // Normalize the price within the day's range (0 at low, 1 at high)
  const normalizedPrice = (price - low) / range;

  if (type === TradeType.Buy) {
    // We want 1 for low (normalizedPrice=0) and -1 for high (normalizedPrice=1)
    return 1 - 2 * normalizedPrice;
  }
  
  if (type === TradeType.Sell) {
    // We want -1 for low (normalizedPrice=0) and 1 for high (normalizedPrice=1)
    return 2 * normalizedPrice - 1;
  }

  return 0; // Should not be reached for valid trade types
};
