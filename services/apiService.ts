import { Account, Budget, Transaction } from '../types';

// Сервер теперь отдает и фронтенд, поэтому все API-запросы могут быть относительными.
// Это решает проблемы с CORS и необходимостью вручную указывать URL.
export const API_BASE_URL = '/api';

// --- API-КЛИЕНТ ---

export const getAccounts = async (): Promise<Account[]> => {
    console.log(`API Client: Fetching accounts from ${API_BASE_URL}...`);
    const response = await fetch(`${API_BASE_URL}/accounts`);
    if (!response.ok) {
        const errorBody = await response.text();
        console.error("API Client Error: Failed to fetch accounts. Server responded with:", errorBody);
        throw new Error('Failed to fetch accounts');
    }
    return response.json();
};

export const getBudget = async (): Promise<Budget> => {
    console.log(`API Client: Fetching budget from ${API_BASE_URL}...`);
    const response = await fetch(`${API_BASE_URL}/budget`);
    if (!response.ok) {
        const errorBody = await response.text();
        console.error("API Client Error: Failed to fetch budget. Server responded with:", errorBody);
        throw new Error('Failed to fetch budget');
    }
    return response.json();
};

export const getTransactions = async (): Promise<Transaction[]> => {
    console.log(`API Client: Fetching transactions from ${API_BASE_URL}...`);
    const response = await fetch(`${API_BASE_URL}/transactions`);
    if (!response.ok) {
        const errorBody = await response.text();
        console.error("API Client Error: Failed to fetch transactions. Server responded with:", errorBody);
        throw new Error('Failed to fetch transactions');
    }
    return response.json();
};

export const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> => {
    console.log(`API Client: Adding transaction to ${API_BASE_URL}...`, transactionData);
    
    const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Failed to add transaction. Server responded with:", errorBody);
        throw new Error('Failed to add transaction');
    }
    return response.json();
};

export const updateTransaction = async (id: number, transactionData: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> => {
    console.log(`API Client: Updating transaction ${id} at ${API_BASE_URL}...`, transactionData);
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Failed to update transaction. Server responded with:", errorBody);
        throw new Error('Failed to update transaction');
    }
    return response.json();
};

export const deleteTransaction = async (id: number): Promise<void> => {
    console.log(`API Client: Deleting transaction ${id} from ${API_BASE_URL}...`);
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Failed to delete transaction. Server responded with:", errorBody);
        throw new Error('Failed to delete transaction');
    }
};
