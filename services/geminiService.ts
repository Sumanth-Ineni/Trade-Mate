
import { GoogleGenAI } from "@google/genai";

// This check is to prevent crashes in environments where process.env is not defined.
const apiKey = typeof process !== 'undefined' && process.env && process.env.API_KEY
  ? process.env.API_KEY
  : "YOUR_API_KEY"; // Fallback, though the environment variable is expected.

const ai = new GoogleGenAI({ apiKey });

export const getDailySuggestion = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a single, concise stock trade suggestion for today. Include a ticker symbol (e.g., MSFT), a suggested action (Buy/Sell), a target price, and a brief, 2-sentence rationale based on fictional positive market sentiment or a technical indicator. Format it clearly.`,
        config: {
            temperature: 0.7,
            maxOutputTokens: 100,
        }
    });
    return response.text;
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
