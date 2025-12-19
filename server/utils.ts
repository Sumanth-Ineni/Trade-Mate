export function convertRecentTradesToPrompt(recentFiveTradeSuggestions: any[], ohlcForRecentTrades: { open: number; high: number; low: number; close: number; ticker: string; date: string }[]) {
    console.log(recentFiveTradeSuggestions, ohlcForRecentTrades);
    return recentFiveTradeSuggestions
        .map((trade, index) => {
            const ohlc = ohlcForRecentTrades.find(ohlc => ohlc.ticker === trade.ticker && ohlc.date === trade.date);
            if (!ohlc || (ohlc.open === 0 && ohlc.high === 0 && ohlc.low === 0 && ohlc.close === 0)) {
                console.warn(`OHLC data not found for ${trade.ticker} on ${trade.date}`);
                return ""; // Return empty string as it will be passed to prompt.
            }
            return `Trade suggestion ${index + 1}: ${trade.ticker} - ${trade.action} at $${trade.targetPrice} with stop loss at $${trade.stopLossPrice} on ${trade.date}. OHLC: Open $${ohlc.open}, High $${ohlc.high}, Low $${ohlc.low}, Close $${ohlc.close}`;
        })
        .join('; ');
}