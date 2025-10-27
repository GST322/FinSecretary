const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const TelegramUser = require('./models/TelegramUser');
const Account = require('./models/Account');
const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget');
const aiService = require('./aiService');

const initializeBot = () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.log('Telegram Bot token not provided. Skipping bot initialization.');
        return;
    }

    const bot = new TelegramBot(token, { polling: true });
    console.log('🤖 Telegram Bot is running...');

    // --- Command Handlers ---

    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const response = `
👋 *Здравствуйте!* Я ваш личный финансовый секретарь.

Я могу отвечать на ваши вопросы о финансах или помочь с поиском информации.

*Примеры команд:*
/summary - Показать сводку по вашим счетам и бюджету.
/add \`<сумма>\` \`<описание>\` - Быстро добавить расход (например, \`/add 550 Обед\`).
        `;
        bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
    });

    bot.onText(/\/summary/, async (msg) => {
        const chatId = msg.chat.id;
        try {
            bot.sendChatAction(chatId, 'typing');
            const accounts = await db.getAccounts();
            const budget = await db.getBudget();

            const totalBalance = accounts
                .filter(acc => acc.currency === 'RUB')
                .reduce((sum, acc) => sum + acc.balance, 0);
            
            const totalSpent = Object.values(budget.currentMonthSpending.spent)
                .reduce((sum, amount) => sum + amount, 0);

            const response = `
*📈 Ваша финансовая сводка:*

💰 *Общий баланс (RUB):* \`${totalBalance.toLocaleString('ru-RU')} ₽\`

🧾 *Бюджет на месяц:*
- *Запланировано:* \`${budget.currentMonthSpending.total.toLocaleString('ru-RU')} ₽\`
- *Потрачено:* \`${totalSpent.toLocaleString('ru-RU')} ₽\`
            `;
            bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });

        } catch (error) {
            console.error("Error fetching summary for Telegram:", error);
            bot.sendMessage(chatId, "Произошла ошибка при получении данных. Попробуйте позже.");
        }
    });
    
    bot.onText(/\/add (\d+(\.\d+)?) (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const amount = parseFloat(match[1]);
        const description = match[3];

        try {
            await db.addTransaction({
                amount,
                description,
                type: 'Расход', // Defaulting to expense for quick adds
                category: 'Прочее', // Default category
            });
            bot.sendMessage(chatId, `✅ Расход на сумму \`${amount} ₽\` с описанием "${description}" успешно добавлен.`);
        } catch (error) {
            console.error("Error adding transaction from Telegram:", error);
            bot.sendMessage(chatId, "Не удалось добавить транзакцию. Попробуйте снова.");
        }
    });

    // --- General Message Handler for AI ---
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        // Ignore commands and empty messages
        if (!text || text.startsWith('/')) {
            return;
        }

        try {
            bot.sendChatAction(chatId, 'typing');

            // Fetch full context for the AI
            const [accounts, budget, transactions] = await Promise.all([
                db.getAccounts(),
                db.getBudget(),
                db.getTransactions(),
            ]);
            const context = { accounts, budget, transactions };
            
            // Use 'chat' mode for contextual analysis of financial data
            const response = await aiService.getAIAdvice(text, context, 'chat');
            
            // Telegram has limitations on Markdown parsing, so we keep it simple
            bot.sendMessage(chatId, response.text);

        } catch (error) {
            console.error("Error handling message in Telegram Bot:", error);
            bot.sendMessage(chatId, "Произошла ошибка при обработке вашего запроса с помощью AI. Попробуйте позже.");
        }
    });

};

module.exports = initializeBot;