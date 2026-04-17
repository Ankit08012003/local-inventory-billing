const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionId: { type: String, required: true, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Card', 'System'], required: true },
    note: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
