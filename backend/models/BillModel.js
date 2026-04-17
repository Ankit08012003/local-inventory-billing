const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    billNumber: { type: String, required: true, unique: true },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, required: true, default: 0 },
    dueAmount: { type: Number, required: true, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Bill', billSchema);
