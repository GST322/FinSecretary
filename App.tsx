import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ChatInterface } from './components/ChatInterface';
import { TransactionModal } from './components/TransactionModal';
import { Account, Budget, Transaction } from './types';
import * as apiService from './services/apiService';
import * as aiService from './services/aiService';
import { HealthScoreData } from './services/aiService';

const App: React.FC = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [budget, setBudget] = useState<Budget | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [healthScore, setHealthScore] = useState<HealthScoreData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [accs, bud, trans, score] = await Promise.all([
                apiService.getAccounts(),
                apiService.getBudget(),
                apiService.getTransactions(),
                aiService.getFinancialHealth(),
            ]);
            setAccounts(accs);
            setBudget(bud);
            setTransactions(trans);
            setHealthScore(score);

        } catch (error) {
            console.error("Failed to fetch data:", error);
            setError("Не удалось загрузить данные с сервера. Убедитесь, что сервер запущен (командой npm start) и проверьте консоль на наличие ошибок.");
        } finally {
            setIsLoading(false);
        }
    }, []);


    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModalForEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleOpenModalForAdd = () => {
        setEditingTransaction(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    const handleSubmitTransaction = useCallback(async (transactionData: Omit<Transaction, 'id' | 'date'>) => {
        try {
            if (editingTransaction) {
                await apiService.updateTransaction(editingTransaction.id, transactionData);
            } else {
                await apiService.addTransaction(transactionData);
            }
            handleCloseModal();
            // Refetch all data to ensure consistency, including health score
            await fetchData(); 
        } catch (error) {
            console.error("Failed to submit transaction:", error);
            alert("Не удалось сохранить транзакцию. Попробуйте снова.");
        }
    }, [editingTransaction, fetchData]);

    const handleDeleteTransaction = useCallback(async (id: number) => {
        if (window.confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
            try {
                await apiService.deleteTransaction(id);
                // Refetch all data to ensure consistency
                await fetchData(); 
            } catch (error) {
                console.error("Failed to delete transaction:", error);
                alert("Не удалось удалить транзакцию. Попробуйте снова.");
            }
        }
    }, [fetchData]);

    if (isLoading) {
        return (
            <div className="bg-gray-900 min-h-screen flex items-center justify-center text-white">
                Загрузка данных с вашего сервера...
            </div>
        );
    }
    
    if (error) {
        return (
             <div className="bg-gray-900 min-h-screen flex items-center justify-center text-white">
                <div className="bg-red-900/50 border border-red-700 p-8 rounded-lg text-center max-w-lg">
                    <h2 className="text-xl font-bold mb-4">Ошибка подключения к серверу</h2>
                    <p className="text-red-300">{error}</p>
                    <p className="text-gray-400 mt-4 text-sm">Пожалуйста, убедитесь, что вы запустили сервер в терминале с помощью команды <code className="bg-gray-700 px-2 py-1 rounded">npm start</code>.</p>
                    <button 
                        onClick={() => fetchData()}
                        className="mt-6 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                        Попробовать снова
                    </button>
                </div>
            </div>
        )
    }

    if (!budget) {
         return (
            <div className="bg-gray-900 min-h-screen flex items-center justify-center text-white">
                Не удалось загрузить данные бюджета. Проверьте консоль сервера на наличие ошибок.
            </div>
        )
    }

    return (
        <div className="bg-gray-900 min-h-screen text-gray-200">
            <Header />
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Dashboard 
                            accounts={accounts} 
                            budget={budget} 
                            transactions={transactions}
                            healthScore={healthScore}
                            onEditTransaction={handleOpenModalForEdit}
                            onDeleteTransaction={handleDeleteTransaction}
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <ChatInterface 
                            accounts={accounts}
                            budget={budget}
                            transactions={transactions}
                            onAddTransactionClick={handleOpenModalForAdd}
                        />
                    </div>
                </div>
            </main>
            <TransactionModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmitTransaction}
                categories={Object.keys(budget.currentMonthSpending.spent)}
                transactionToEdit={editingTransaction}
            />
        </div>
    );
};

export default App;