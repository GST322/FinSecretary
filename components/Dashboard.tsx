import React from 'react';
import { Account, Budget, Transaction } from '../types';
import { SummaryCard } from './SummaryCard';
import { BudgetChart } from './BudgetChart';
import { PortfolioChart } from './PortfolioChart';
import { HealthScore } from './HealthScore';
import { HealthScoreData } from '../services/aiService';

interface DashboardProps {
    accounts: Account[];
    budget: Budget;
    transactions: Transaction[];
    healthScore: HealthScoreData | null;
    onEditTransaction: (transaction: Transaction) => void;
    onDeleteTransaction: (id: number) => void;
}

// FIX: Changed from React.FC to a standard function component for better type inference and modern practices.
const TransactionIcon = ({ type }: { type: 'Доход' | 'Расход' }) => {
    const isIncome = type === 'Доход';
    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isIncome ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
            {isIncome ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
            )}
        </div>
    );
};

// FIX: Refactored to use React.FC for stricter type checking and to resolve a potential type inference error.
const EditIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

// FIX: Refactored to use React.FC for stricter type checking and to resolve a potential type inference error.
const DeleteIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);


export const Dashboard: React.FC<DashboardProps> = ({ accounts, budget, transactions, healthScore, onEditTransaction, onDeleteTransaction }) => {
    const totalBalance = accounts.reduce((sum, acc) => {
        // Simple sum for now, ignores currency conversion for non-RUB
        if (acc.currency === 'RUB') {
            return sum + acc.balance;
        }
        return sum;
    }, 0);

    const totalSpent = Object.values(budget.currentMonthSpending.spent).reduce((sum: number, amount: number) => sum + amount, 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard title="Общий баланс" value={`${totalBalance.toLocaleString('ru-RU')} ₽`} />
                <SummaryCard title="Бюджет на месяц" value={`${budget.currentMonthSpending.total.toLocaleString('ru-RU')} ₽`} />
                <SummaryCard title="Потрачено в этом месяце" value={`${totalSpent.toLocaleString('ru-RU')} ₽`} isNegative={totalSpent > budget.currentMonthSpending.total} />
            </div>

            <HealthScore scoreData={healthScore} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-gray-800/50 rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Распределение портфеля</h3>
                    <PortfolioChart accounts={accounts} />
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Категории расходов</h3>
                    <BudgetChart budget={budget} />
                </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Последние операции</h3>
                <div className="space-y-1 max-h-80 overflow-y-auto pr-2">
                    {transactions.map(t => (
                        <div key={t.id} className="flex items-center justify-between p-2 rounded-md group hover:bg-gray-700/50">
                            <div className="flex items-center space-x-4">
                                <TransactionIcon type={t.type} />
                                <div>
                                    <p className="font-medium text-gray-200">{t.description}</p>
                                    <p className="text-sm text-gray-400">{new Date(t.date).toLocaleDateString('ru-RU')}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <p className={`font-semibold ${t.type === 'Доход' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {t.type === 'Доход' ? '+' : '-'}{t.amount.toLocaleString('ru-RU')} ₽
                                </p>
                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => onEditTransaction(t)} className="p-1 rounded-md text-gray-400 hover:bg-gray-600 hover:text-white">
                                        <EditIcon />
                                    </button>
                                    <button onClick={() => onDeleteTransaction(t.id)} className="p-1 rounded-md text-gray-400 hover:bg-red-500/50 hover:text-red-400">
                                        <DeleteIcon />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};