const mongoose = require('mongoose');

const telegramUserSchema = new mongoose.Schema({
    telegramId: { 
        type: Number, 
        required: true, 
        unique: true 
    },
    chatId: { 
        type: Number, 
        required: true 
    },
    firstName: String,
    lastName: String,
    username: String,
    language: {
        type: String,
        default: 'ru'
    },
    settings: {
        notifications: {
            type: Boolean,
            default: true
        },
        reportSchedule: {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
            default: 'daily'
        },
        categories: [{
            name: String,
            type: {
                type: String,
                enum: ['income', 'expense']
            },
            budget: Number
        }]
    },
    state: {
        lastCommand: String,
        awaitingResponse: Boolean,
        context: mongoose.Schema.Types.Mixed
    },
    accounts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
});

// Обновляем lastActive при каждом взаимодействии
telegramUserSchema.methods.updateActivity = function() {
    this.lastActive = Date.now();
    return this.save();
};

// Добавляем категорию для пользователя
telegramUserSchema.methods.addCategory = function(name, type, budget = 0) {
    if (!this.settings.categories) {
        this.settings.categories = [];
    }
    this.settings.categories.push({ name, type, budget });
    return this.save();
};

// Получаем бюджет по категории
telegramUserSchema.methods.getCategoryBudget = function(categoryName) {
    const category = this.settings.categories.find(c => c.name === categoryName);
    return category ? category.budget : 0;
};

const TelegramUser = mongoose.model('TelegramUser', telegramUserSchema);
module.exports = TelegramUser;