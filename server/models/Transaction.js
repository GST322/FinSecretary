const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    type: { type: String, required: true, enum: ['Доход', 'Расход', 'Перевод'] },
    category: { type: String, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    tags: [String],
    metadata: { type: Object }
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;