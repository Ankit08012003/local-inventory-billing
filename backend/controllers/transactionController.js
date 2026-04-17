const mongoose = require('mongoose');
const Transaction = require('../models/TransactionModel');
const Customer = require('../models/CustomerModel');

const getTransactions = async (req, res) => {
    try {
        const { customerId } = req.query;
        let query = { userId: req.user._id };
        if (customerId) query.customerId = customerId;
        
        const transactions = await Transaction.find(query).sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTransaction = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { customerId, amount, paymentMethod, note } = req.body;
        const userId = req.user._id;

        const customer = await Customer.findOne({ _id: customerId, userId }).session(session);
        if (!customer) throw new Error('Customer not found');

        customer.totalDue -= amount;
        await customer.save({ session });

        const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const transaction = await Transaction.create([{
            transactionId,
            customerId,
            type: 'DEBIT',
            amount,
            paymentMethod,
            note,
            userId
        }], { session });

        await session.commitTransaction();
        session.endSession();
        res.status(201).json(transaction[0]);

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getTransactions, createTransaction };
