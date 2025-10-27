require('dotenv').config(); // Загружает переменные из .env файла
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const aiService = require('./aiService');

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('📦 Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Инициализируем Telegram бота после подключения к БД
require('./telegramBot')();

const app = express();
const PORT = 3001;

// Настройка CORS для работы с frontend
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

// Check if DB exists, if not, prompt user to initialize it
const dbPath = path.resolve(__dirname, 'financial_app.db');
if (!fs.existsSync(dbPath)) {
    console.error('\x1b[31m%s\x1b[0m', 'DATABASE NOT FOUND!');
    console.error('Please run "npm run db:init" to create and seed the database.');
    process.exit(1);
}

// Middlewares
app.use(cors());
app.use(express.json());

// --- API Endpoints ---

app.get('/api/accounts', async (req, res) => {
    console.log(`[${new Date().toLocaleTimeString()}] GET /api/accounts`);
    try {
        res.json(await db.getAccounts());
    } catch (error) {
        console.error(`[ERROR] GET /api/accounts:`, error);
        res.status(500).json({ error: 'Internal server error while fetching accounts.' });
    }
});

app.get('/api/budget', async (req, res) => {
    console.log(`[${new Date().toLocaleTimeString()}] GET /api/budget`);
    try {
        res.json(await db.getBudget());
    } catch (error) {
        console.error(`[ERROR] GET /api/budget:`, error);
        res.status(500).json({ error: 'Internal server error while fetching budget.' });
    }
});

app.get('/api/transactions', async (req, res) => {
    console.log(`[${new Date().toLocaleTimeString()}] GET /api/transactions`);
    try {
        res.json(await db.getTransactions());
    } catch (error) {
        console.error(`[ERROR] GET /api/transactions:`, error);
        res.status(500).json({ error: 'Internal server error while fetching transactions.' });
    }
});

app.post('/api/transactions', async (req, res) => {
    const transactionData = req.body;
    console.log(`[${new Date().toLocaleTimeString()}] POST /api/transactions`, transactionData);

    if (!transactionData || typeof transactionData.amount !== 'number' || !transactionData.description) {
        return res.status(400).json({ error: 'Invalid transaction data' });
    }

    try {
        const newTransaction = await db.addTransaction(transactionData);
        res.status(201).json(newTransaction);
    } catch (error) {
        console.error(`[ERROR] POST /api/transactions:`, error);
        res.status(500).json({ error: 'Internal server error while adding transaction.' });
    }
});

app.put('/api/transactions/:id', async (req, res) => {
    const { id } = req.params;
    const transactionData = req.body;
    console.log(`[${new Date().toLocaleTimeString()}] PUT /api/transactions/${id}`, transactionData);
     if (!transactionData || typeof transactionData.amount !== 'number' || !transactionData.description) {
        return res.status(400).json({ error: 'Invalid transaction data' });
    }
    try {
        const updatedTransaction = await db.updateTransaction(id, transactionData);
        res.json(updatedTransaction);
    } catch (error) {
        console.error(`[ERROR] PUT /api/transactions/${id}:`, error);
        res.status(500).json({ error: 'Internal server error while updating transaction.' });
    }
});

app.delete('/api/transactions/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`[${new Date().toLocaleTimeString()}] DELETE /api/transactions/${id}`);
    try {
        await db.deleteTransaction(id);
        res.status(204).send(); // No Content
    } catch (error) {
        console.error(`[ERROR] DELETE /api/transactions/${id}:`, error);
        res.status(500).json({ error: 'Internal server error while deleting transaction.' });
    }
});

// --- AI Endpoints ---

app.get('/api/financial-health', async (req, res) => {
    console.log(`[${new Date().toLocaleTimeString()}] GET /api/financial-health`);
    try {
        const [accounts, budget, transactions] = await Promise.all([
            db.getAccounts(),
            db.getBudget(),
            db.getTransactions(),
        ]);
        const context = { accounts, budget, transactions };
        const scoreData = await aiService.getFinancialHealthScore(context);
        res.json(scoreData);
    } catch (error) {
        console.error(`[ERROR] GET /api/financial-health:`, error.message);
        res.status(500).json({ error: 'Failed to calculate financial health score.' });
    }
});

app.post('/api/ai-advice', async (req, res) => {
    const { userQuery, context, mode } = req.body;
    console.log(`[${new Date().toLocaleTimeString()}] POST /api/ai-advice in mode: ${mode}`);
    if (!userQuery || !context || !mode) {
        return res.status(400).json({ error: 'Missing userQuery, context, or mode in request body' });
    }
    try {
        const advice = await aiService.getAIAdvice(userQuery, context, mode);
        res.json(advice);
    } catch (error) {
        console.error(`[ERROR] POST /api/ai-advice:`, error.message);
        res.status(500).json({ error: 'Internal server error while getting AI advice.' });
    }
});


// --- Serve Frontend ---
// Этот блок должен быть ПОСЛЕ всех API-маршрутов.
const rootPath = path.resolve(__dirname, '..');

// 1. Отдаем статические файлы из корневой директории (например, index.html, index.tsx).
app.use(express.static(rootPath));

// 2. Все API-маршруты определены выше. Если запрос начинается с /api и не был обработан, это 404.
// Это предотвращает "падение" ненайденных API-запросов на главную страницу приложения (index.html).
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: `Конечная точка API не найдена: ${req.method} ${req.originalUrl}` });
});

// 3. Для любого другого GET-запроса, который не является файлом и не является API-маршрутом,
// отправляем index.html. Это основной механизм для одностраничных приложений (SPA).
app.get('*', (req, res) => {
    res.sendFile(path.join(rootPath, 'index.html'), (err) => {
        if (err) {
            console.error("Ошибка при отправке index.html для SPA:", err);
            res.status(500).send(err);
        }
    });
});


app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log('Ready to accept requests from the frontend app.');
    if (!process.env.DEEPSEEK_API_KEY) {
        console.warn('⚠️ WARNING: DEEPSEEK_API_KEY is not set in your .env file. The AI assistant will not work.');
    }
    if (!process.env.TAVILY_API_KEY) {
        console.warn('⚠️ WARNING: TAVILY_API_KEY is not set in your .env file. The AI search functionality will not work.');
    }
    if (!process.env.TELEGRAM_BOT_TOKEN) {
        console.warn('⚠️ WARNING: TELEGRAM_BOT_TOKEN is not set. The Telegram Bot will not work.');
    }
});