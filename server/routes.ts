// FIX: Changed to `import = require()` for CommonJS compatibility and `export =` for the module export.
import express = require('express');
import { GoogleGenAI, Type } from "@google/genai";
import { getTrades, addTrade, getOhlcDataForTrade, getTradeById } from './data';
import type { SortConfig, Trade } from './data';

const router = express.Router();

// --- Gemini AI Setup ---
// Initialize the AI client. The API key is passed directly from environment variables.
// The SDK will handle errors if the key is missing or invalid when an API call is made.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Trade Routes ---

router.get('/trades', (req, res) => {
    try {
        const { sortKey, sortDirection, page, limit } = req.query;
        
        const sortConfig: SortConfig = {
            key: (sortKey as any) || 'date',
            direction: sortDirection === 'descending' ? 'descending' : 'ascending',
        };
        const pageNum = parseInt(page as string, 10) || 1;
        const limitNum = parseInt(limit as string, 10) || 15;

        const result = getTrades(sortConfig, pageNum, limitNum);
        res.json(result);
    } catch (error) {
        console.error("Error fetching trades:", error);
        res.status(500).json({ error: "Internal server error while fetching trades." });
    }
});

router.post('/trades', (req, res) => {
    try {
        const newTradeData = req.body;
        // Basic validation, would be more robust in a real app (e.g., using Zod)
        if (!newTradeData || !newTradeData.ticker || !newTradeData.price || !newTradeData.quantity) {
            return res.status(400).json({ error: 'Invalid trade data provided.' });
        }
        const newTrade = addTrade(newTradeData);
        res.status(201).json(newTrade);
    } catch (error) {
        console.error("Error adding trade:", error);
        res.status(500).json({ error: "Internal server error while adding trade." });
    }
});

router.get('/ohlc', (req, res) => {
    try {
        const { ticker, date } = req.query;
        if (typeof ticker !== 'string' || typeof date !== 'string') {
            return res.status(400).json({ error: 'Ticker and date query parameters are required.' });
        }
        const ohlc = getOhlcDataForTrade(ticker, date);
        res.json(ohlc);
    } catch (error) {
        console.error("Error fetching OHLC data:", error);
        res.status(500).json({ error: "Internal server error while fetching OHLC data." });
    }
});

// --- Gemini Suggestion & Analysis Routes ---

router.get('/trades/:id/analysis', async (req, res) => {
    try {
        const { id } = req.params;
        const trade = getTradeById(id);

        if (!trade) {
            return res.status(404).json({ error: 'Trade not found.' });
        }

        const prompt = `Given the following stock trade: {ticker: '${trade.ticker}', type: '${trade.type}', price: ${trade.price} on ${trade.date}, which received a quality rating of ${trade.rating.toFixed(2)}}, provide a brief, one or two-sentence analysis of why this might have been a good or bad trade. Base the analysis on fictional market events or technical indicators for that day. Be creative but concise. Do not give financial advice.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.6,
                maxOutputTokens: 100,
            }
        });

        res.json({ analysis: response.text });

    } catch (error) {
        console.error(`Gemini API call failed for trade analysis ${req.params.id}:`, error);
        res.status(500).json({ error: "Failed to fetch trade analysis from Gemini API." });
    }
});


router.get('/suggestions/daily', async (req, res) => {
    try {
        const response = await ai.models.generateContent({
            // FIX: Corrected Gemini model name from 'gem-2.5-flash' to 'gemini-2.5-flash'.
            model: 'gemini-2.5-flash',
            contents: `Generate a single stock trade suggestion for today. Base it on fictional market sentiment or a technical indicator. If the suggested action is 'Buy', you must also include a stop-loss price. The prices should be realistic numbers.`,
            config: {
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        ticker: { type: Type.STRING, description: 'The stock ticker symbol, e.g., AAPL' },
                        // FIX: The `enum` property is not supported for Type.STRING. The constraint has been moved to the description.
                        action: { type: Type.STRING, description: "The suggested action, either 'Buy' or 'Sell'." },
                        targetPrice: { type: Type.NUMBER, description: 'The suggested target price for the trade.' },
                        stopLossPrice: { type: Type.NUMBER, description: 'The suggested stop-loss price. This is required for "Buy" actions.' },
                        rationale: { type: Type.STRING, description: 'A brief, 2-sentence rationale for the suggestion.' }
                    },
                    required: ['ticker', 'action', 'targetPrice', 'rationale']
                }
            }
        });
        const suggestion = JSON.parse(response.text);
        res.json(suggestion);
    } catch (error) {
        console.error("Gemini API call failed for daily suggestion:", error);
        res.status(500).json({ error: "Failed to fetch suggestion from Gemini API." });
    }
});

router.get('/suggestions/ticker', async (req, res) => {
    try {
        const { ticker } = req.query;
        if (typeof ticker !== 'string' || !ticker) {
            return res.status(400).json({ error: 'Ticker query parameter is required.' });
        }
        const response = await ai.models.generateContent({
            // FIX: Corrected Gemini model name from 'gem-2.5-flash' to 'gemini-2.5-flash'.
            model: 'gemini-2.5-flash',
            contents: `Provide a very brief, one-sentence analysis for the stock ticker ${ticker}. Should I consider buying or selling it today? Base your suggestion on fictional, general market sentiment. Do not give financial advice.`,
            config: {
                temperature: 0.5,
                maxOutputTokens: 60,
            }
        });
        res.json({ suggestion: response.text });
    } catch (error) {
        console.error(`Gemini API call failed for ticker ${req.query.ticker}:`, error);
        res.status(500).json({ error: "Failed to fetch ticker analysis from Gemini API." });
    }
});

export = router;
