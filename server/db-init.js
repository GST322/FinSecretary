// This script initializes the SQLite database.
// Run this once with `npm run db:init` before starting the server for the first time.

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'financial_app.db');

// Check if the DB file already exists
if (fs.existsSync(dbPath)) {
    console.log('Database file already exists. Initialization skipped.');
    // Optionally, you could add logic here to drop tables and re-seed
    // if you wanted to reset the database.
    process.exit(0);
}


const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the in-memory SQLite database.');
});

db.serialize(() => {
    console.log('Creating tables...');

    // Accounts Table
    db.run(`
        CREATE TABLE accounts (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            balance REAL NOT NULL,
            currency TEXT NOT NULL,
            details TEXT
        )
    `);

    // Transactions Table
    db.run(`
        CREATE TABLE transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            description TEXT NOT NULL,
            amount REAL NOT NULL,
            type TEXT NOT NULL,
            category TEXT
        )
    `);

    // Budget Table (simplified to a single row)
    db.run(`
        CREATE TABLE budget (
            id INTEGER PRIMARY KEY,
            spending_allocation REAL,
            savings_allocation REAL,
            monthly_spending_total REAL
        )
    `);

    console.log('Tables created. Seeding data...');

    // Seed Accounts
    const stmtAccounts = db.prepare("INSERT INTO accounts VALUES (?, ?, ?, ?, ?, ?)");
    const accounts = [
        { id: 'acc1', name: 'Накопительный счет', type: 'Накопительный счет', balance: 150000, currency: 'RUB', details: null },
        { id: 'acc2', name: 'Брокерский счет', type: 'Брокерский счет', balance: 350000, currency: 'RUB', details: JSON.stringify({ 'stocks': ['SBER', 'GAZP'], 'bonds': ['SU26238RMFS4'] }) },
        { id: 'acc3', name: 'ОМС Золото', type: 'ОМС', balance: 50, currency: 'GOLD_GRAM', details: JSON.stringify({ 'metal': 'gold' }) },
    ];
    accounts.forEach(acc => {
        stmtAccounts.run(acc.id, acc.name, acc.type, acc.balance, acc.currency, acc.details);
    });
    stmtAccounts.finalize();

    // Seed Transactions
    const stmtTransactions = db.prepare("INSERT INTO transactions (date, description, amount, type, category) VALUES (?, ?, ?, ?, ?)");
    const transactions = [
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), description: 'Зарплата', amount: 100000, type: 'Доход', category: null },
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), description: 'Супермаркет "Лента"', amount: 4500, type: 'Расход', category: 'Продукты' },
        { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), description: 'Пополнение брокерского счета', amount: 25000, type: 'Расход', category: 'Инвестиции' },
    ];
    transactions.forEach(t => {
        stmtTransactions.run(t.date, t.description, t.amount, t.type, t.category);
    });
    stmtTransactions.finalize();

    // Seed Budget
    const stmtBudget = db.prepare("INSERT INTO budget VALUES (?, ?, ?, ?)");
    stmtBudget.run(1, 50, 50, 50000);
    stmtBudget.finalize();


    console.log('Data seeded successfully.');
});

db.close((err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Database connection closed.');
});