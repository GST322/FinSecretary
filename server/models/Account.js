const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    balance: { type: Number, required: true },
    currency: { type: String, required: true },
    details: { type: Object },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

accountSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Account = mongoose.model('Account', accountSchema);
module.exports = Account;