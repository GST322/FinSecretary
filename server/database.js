const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'financial_app.db');
let db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Enable foreign key support
        db.run('PRAGMA foreign_keys = ON;', (err) => {
            if (err) {
                console.error("Could not enable foreign keys", err);
            }
        });
    }
});

const runQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Error running sql: ' + sql);
                console.error(err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

const runSingleQuery = (sql, params = []) => {
     return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                console.error('Error running sql: ' + sql);
                console.error(err);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};


const runExec = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                console.error('Error running sql ' + sql);
                console.error(err);
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
};


const getAccounts = () => runQuery('SELECT * FROM accounts');
const getBudget = async () => {
    // This is a simplified version. A real app would have a more complex budget model.
    // For now, we reconstruct it similarly to the original in-memory object.
    const budgetInfo = await runSingleQuery('SELECT * FROM budget WHERE id = 1');
    const spentByCategory = await runQuery(`
        SELECT category, SUM(amount) as spent 
        FROM transactions 
        WHERE type = 'Расход' AND category IS NOT NULL
        GROUP BY category
    `);

    const spent = spentByCategory.reduce((acc, row) => {
        acc[row.category] = row.spent;
        return acc;
    }, {});

    return {
        allocation: {
            spending: budgetInfo.spending_allocation,
            savings: budgetInfo.savings_allocation,
        },
        currentMonthSpending: {
            total: budgetInfo.monthly_spending_total,
            spent: spent,
        },
    };
};
const getTransactions = () => runQuery('SELECT * FROM transactions ORDER BY date DESC');

const addTransaction = async (transactionData) => {
    const { amount, description, type, category } = transactionData;
    const date = new Date().toISOString();
    const sql = `INSERT INTO transactions (date, description, amount, type, category) VALUES (?, ?, ?, ?, ?)`;
    const result = await runExec(sql, [date, description, amount, type, category]);
    
    // After adding, fetch the newly created transaction to return it
    return runSingleQuery('SELECT * FROM transactions WHERE id = ?', [result.id]);
};

const updateTransaction = async (id, transactionData) => {
    const { amount, description, type, category } = transactionData;
    const sql = `UPDATE transactions SET amount = ?, description = ?, type = ?, category = ? WHERE id = ?`;
    await runExec(sql, [amount, description, type, category, id]);

    return runSingleQuery('SELECT * FROM transactions WHERE id = ?', [id]);
};

const deleteTransaction = (id) => {
    return runExec('DELETE FROM transactions WHERE id = ?', [id]);
};


module.exports = {
    db,
    getAccounts,
    getBudget,
    getTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
};