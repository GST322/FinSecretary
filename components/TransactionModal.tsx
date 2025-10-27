import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
    categories: string[];
    transactionToEdit?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSubmit, categories, transactionToEdit }) => {
    const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
    const [amount, setAmount] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [category, setCategory] = useState<string>(categories[0] || '');

    const isEditing = !!transactionToEdit;

    useEffect(() => {
        if (isOpen) {
            if (isEditing) {
                setType(transactionToEdit.type);
                setAmount(String(transactionToEdit.amount));
                setDescription(transactionToEdit.description);
                if (transactionToEdit.category) {
                    setCategory(transactionToEdit.category);
                }
            } else {
                // Reset form for "add" mode
                setType(TransactionType.EXPENSE);
                setAmount('');
                setDescription('');
                setCategory(categories[0] || '');
            }
        }
    }, [isOpen, isEditing, transactionToEdit, categories]);


    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0 || !description) return;

        onSubmit({
            amount: numAmount,
            description,
            type,
            category: type === TransactionType.EXPENSE ? category : undefined,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">{isEditing ? 'Изменить операцию' : 'Добавить операцию'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <div className="flex rounded-md shadow-sm">
                            <button
                                type="button"
                                onClick={() => setType(TransactionType.EXPENSE)}
                                className={`px-4 py-2 rounded-l-md w-1/2 transition-colors ${type === TransactionType.EXPENSE ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                Расход
                            </button>
                            <button
                                type="button"
                                onClick={() => setType(TransactionType.INCOME)}
                                className={`px-4 py-2 rounded-r-md w-1/2 transition-colors ${type === TransactionType.INCOME ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                Доход
                            </button>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">Сумма</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="0.00"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Описание</label>
                        <input
                            type="text"
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Например, продукты в магазине"
                            required
                        />
                    </div>
                    {type === TransactionType.EXPENSE && (
                        <div className="mb-6">
                            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Категория</label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    )}
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500">Отмена</button>
                        <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">{isEditing ? 'Сохранить' : 'Добавить'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};