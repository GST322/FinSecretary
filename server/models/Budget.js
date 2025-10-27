const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    categories: [{
        name: { type: String, required: true },
        planned: { type: Number, required: true },
        spent: { type: Number, default: 0 }
    }],
    savings: {
        goal: { type: Number },
        current: { type: Number, default: 0 }
    },
    metadata: { type: Object }
});

// Составной индекс для year+month
budgetSchema.index({ year: 1, month: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);
module.exports = Budget;