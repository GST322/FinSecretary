
import { Account, Budget, Transaction, AccountType, TransactionType } from './types';

export const INITIAL_ACCOUNTS: Account[] = [
    { id: 'acc1', name: 'Накопительный счет', type: AccountType.SAVINGS, balance: 150000, currency: 'RUB' },
    { id: 'acc2', name: 'Брокерский счет', type: AccountType.BROKERAGE, balance: 350000, currency: 'RUB', details: { 'stocks': ['SBER', 'GAZP'], 'bonds': ['SU26238RMFS4'] } },
    { id: 'acc3', name: 'ОМС Золото', type: AccountType.METALS, balance: 50, currency: 'GOLD_GRAM', details: { 'metal': 'gold' } },
];

export const INITIAL_BUDGET: Budget = {
    allocation: {
        spending: 50,
        savings: 50,
    },
    currentMonthSpending: {
        total: 50000,
        spent: {
            'Продукты': 15000,
            'Транспорт': 5000,
            'Аренда': 20000,
            'Развлечения': 3000,
        },
    },
};

// FIX: Changed transaction IDs from strings to numbers to match the Transaction type which expects id to be a number.
export const INITIAL_TRANSACTIONS: Transaction[] = [
    { id: 1, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), description: 'Зарплата', amount: 100000, type: TransactionType.INCOME },
    { id: 2, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), description: 'Супермаркет "Лента"', amount: 4500, type: TransactionType.EXPENSE, category: 'Продукты' },
    { id: 3, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), description: 'Пополнение брокерского счета', amount: 25000, type: TransactionType.EXPENSE, category: 'Инвестиции' },
];