
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
  rating: number; // For V1: -1 to 1
}

export type SortableTradeKeys = keyof Omit<Trade, 'id'>;

export interface SortConfig {
  key: SortableTradeKeys;
  direction: 'ascending' | 'descending';
}
