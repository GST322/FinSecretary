const mongoose = require('mongoose');
const Account = require('./models/Account');
const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget');

// Подключение к MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('📦 Connected to MongoDB Atlas');
        
        // Проверка подключения
        await mongoose.connection.db.admin().ping();
        console.log('MongoDB connection verified - Database is responsive');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// API для работы с аккаунтами
const getAccounts = async () => {
    return await Account.find({});
};

const addAccount = async (accountData) => {
    const account = new Account(accountData);
    return await account.save();
};

// API для работы с транзакциями
const getTransactions = async (filter = {}) => {
    return await Transaction.find(filter).populate('account');
};

const addTransaction = async (transactionData) => {
    const transaction = new Transaction(transactionData);
    await transaction.save();
    
    // Обновляем баланс счета, если указан
    if (transaction.account) {
        const account = await Account.findById(transaction.account);
        account.balance += transaction.type === 'Доход' ? transaction.amount : -transaction.amount;
        await account.save();
    }
    
    return transaction;
};

// API для работы с бюджетом
const getBudget = async (year = new Date().getFullYear(), month = new Date().getMonth() + 1) => {
    return await Budget.findOne({ year, month }) || { categories: [], savings: { goal: 0, current: 0 } };
};

const updateBudget = async (budgetData) => {
    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = budgetData;
    return await Budget.findOneAndUpdate(
        { year, month },
        budgetData,
        { upsert: true, new: true }
    );
};

module.exports = {
    connectDB,
    getAccounts,
    addAccount,
    getTransactions,
    addTransaction,
    getBudget,
    updateBudget
};