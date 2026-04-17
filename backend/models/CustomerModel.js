const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    address: { type: String },
    totalDue: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
