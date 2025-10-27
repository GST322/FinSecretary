import { Account, Budget, Transaction } from '../types';
import { API_BASE_URL } from './apiService'; 

interface FinancialContext {
    accounts: Account[];
    budget: Budget;
    transactions: Transaction[];
}

export interface HealthScoreData {
    score: number;
    summary: string;
}

/**
 * Sends a query to the backend AI service for financial advice.
 * The backend handles the interaction with the actual AI model.
 * @param userQuery The user's question.
 * @param context The current financial state (accounts, budget, transactions).
 * @param mode The mode of operation: 'chat' for analysis, 'search' for web search.
 * @returns An object containing the AI's response text and any sources used.
 */
export async function getFinancialAdvice(
    userQuery: string, 
    context: FinancialContext,
    mode: 'chat' | 'search'
): Promise<{ text: string; sources: { title: string; uri: string }[] }> {
    try {
        const response = await fetch(`${API_BASE_URL}/ai-advice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userQuery, context, mode }),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error("Backend AI service error:", errorBody);
            throw new Error(`Backend request failed with status ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Error fetching financial advice from backend:", error);
        // Return a user-friendly error message
        return { 
            text: "Не удалось связаться с AI-ассистентом на вашем сервере. Убедитесь, что сервер запущен, в файле .env указан DEEPSEEK_API_KEY и проверьте консоль на наличие ошибок.", 
            sources: [] 
        };
    }
}

/**
 * Fetches the financial health score from the backend.
 * @returns A promise that resolves to the health score data or null on error.
 */
export async function getFinancialHealth(): Promise<HealthScoreData | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/financial-health`);
        if (!response.ok) {
            const errorBody = await response.text();
            console.error("API Client Error: Failed to fetch financial health. Server responded with:", errorBody);
            throw new Error('Failed to fetch financial health');
        }
        return response.json();
    } catch (error) {
        console.error("Error fetching financial health from backend:", error);
        return null; // Return null on error so the UI can handle it gracefully
    }
}