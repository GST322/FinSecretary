
export enum AccountType {
    SAVINGS = 'Накопительный счет',
    BROKERAGE = 'Брокерский счет',
    METALS = 'ОМС',
    CASH = 'Наличные'
}

export interface Account {
    id: string;
    name: string;
    type: AccountType;
    balance: number;
    currency: 'RUB' | 'USD' | 'EUR' | 'GOLD_GRAM' | 'SILVER_GRAM';
    details?: Record<string, any>;
}

export enum TransactionType {
    INCOME = 'Доход',
    EXPENSE = 'Расход',
}

export interface Transaction {
    id: number;
    date: string;
    description: string;
    amount: number;
    type: TransactionType;
    category?: string;
}

export interface Budget {
    allocation: {
        spending: number; // percentage
        savings: number; // percentage
    };
    currentMonthSpending: {
        total: number;
        spent: Record<string, number>;
    };
}

export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    sources?: { title: string; uri: string }[];
    mode?: 'chat' | 'search';
}