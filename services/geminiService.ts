
import { GoogleGenAI, Type } from "@google/genai";
import type { TradeSuggestionData } from '../types';

// This check is to prevent crashes in environments where process.env is not defined.
const apiKey = typeof process !== 'undefined' && process.env && process.env.API_KEY
  ? process.env.API_KEY
  : "YOUR_API_KEY"; // Fallback, though the environment variable is expected.

const ai = new GoogleGenAI({ apiKey });

export const getDailySuggestion = async (): Promise<TradeSuggestionData> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a single stock trade suggestion for today. Base it on fictional market sentiment or a technical indicator. If the suggested action is 'Buy', you must also include a stop-loss price. The prices should be realistic numbers.`,
        config: {
            temperature: 0.7,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    ticker: { type: Type.STRING, description: 'The stock ticker symbol, e.g., AAPL' },
                    action: { type: Type.STRING, enum: ['Buy', 'Sell'], description: 'The suggested action.' },
                    targetPrice: { type: Type.NUMBER, description: 'The suggested target price for the trade.' },
                    stopLossPrice: { type: Type.NUMBER, description: 'The suggested stop-loss price. This is required for "Buy" actions.' },
                    rationale: { type: Type.STRING, description: 'A brief, 2-sentence rationale for the suggestion.' }
                },
                required: ['ticker', 'action', 'targetPrice', 'rationale']
            }
        }
    });
    const suggestion = JSON.parse(response.text);
    return suggestion;
  } catch (error) {
    console.error("Gemini API call failed for daily suggestion:", error);
    throw new Error("Failed to fetch suggestion from Gemini API.");
  }
};

export const getTickerSuggestion = async (ticker: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Provide a very brief, one-sentence analysis for the stock ticker ${ticker}. Should I consider buying or selling it today? Base your suggestion on fictional, general market sentiment. Do not give financial advice.`,
            config: {
                temperature: 0.5,
                maxOutputTokens: 60,
            }
        });
        return response.text;
    } catch (error) {
        console.error(`Gemini API call failed for ticker ${ticker}:`, error);
        throw new Error("Failed to fetch ticker analysis from Gemini API.");
    }
};
