const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { connectDB, addAccount, addTransaction, updateBudget } = require('./mongodb');
require('dotenv').config();

const dbPath = path.resolve(__dirname, 'financial_app.db');
const sqliteDb = new sqlite3.Database(dbPath);

const migrateData = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB. Starting migration...');

        // Migrate accounts
        const accounts = await new Promise((resolve, reject) => {
            sqliteDb.all('SELECT * FROM accounts', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });

        for (const account of accounts) {
            await addAccount({
                name: account.name,
                type: account.type,
                balance: account.balance,
                currency: account.currency,
                details: account.details ? JSON.parse(account.details) : {}
            });
        }
        console.log(`✅ Migrated ${accounts.length} accounts`);

        // Migrate transactions
        const transactions = await new Promise((resolve, reject) => {
            sqliteDb.all('SELECT * FROM transactions', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });

        for (const tx of transactions) {
            await addTransaction({
                amount: tx.amount,
                type: tx.type,
                category: tx.category,
                description: tx.description,
                date: new Date(tx.date),
                metadata: tx.metadata ? JSON.parse(tx.metadata) : {}
            });
        }
        console.log(`✅ Migrated ${transactions.length} transactions`);

        // Migrate budget data
        const budget = await new Promise((resolve, reject) => {
            sqliteDb.all('SELECT * FROM budget', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });

        for (const b of budget) {
            await updateBudget({
                year: new Date(b.date).getFullYear(),
                month: new Date(b.date).getMonth() + 1,
                categories: b.categories ? JSON.parse(b.categories) : [],
                savings: b.savings ? JSON.parse(b.savings) : { goal: 0, current: 0 }
            });
        }
        console.log(`✅ Migrated budget data`);

        console.log('🎉 Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateData();