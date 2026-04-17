const mongoose = require('mongoose');
const Bill = require('../models/BillModel');
const Product = require('../models/ProductModel');
const Customer = require('../models/CustomerModel');
const Transaction = require('../models/TransactionModel');

const getBills = async (req, res) => {
    try {
        const bills = await Bill.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(bills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createBill = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { items, customerId, totalAmount, paidAmount, dueAmount } = req.body;
        const userId = req.user._id;

        // 1. Validate and 2. Deduct Stock
        for (let item of items) {
            const product = await Product.findOne({ _id: item.productId, userId }).session(session);
            if (!product) throw new Error(`Product not found: ${item.name}`);
            if (product.quantity < item.quantity) {
                throw new Error(`Insufficient stock for ${item.name}`);
            }
            product.quantity -= item.quantity;
            await product.save({ session });
        }

        // 3. Update Customer totalDue if applicable
        if (customerId && dueAmount !== 0) {
            const customer = await Customer.findOne({ _id: customerId, userId }).session(session);
            if (!customer) throw new Error('Customer not found');
            customer.totalDue += dueAmount;
            await customer.save({ session });
        }

        // 4. Save Bill record
        const billNumber = `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const bill = await Bill.create([{
            billNumber,
            items,
            customerId: customerId || undefined,
            totalAmount,
            paidAmount,
            dueAmount,
            userId
        }], { session });

        // 5. Create Transaction record if dueAmount > 0
        if (customerId && dueAmount > 0) {
            const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            await Transaction.create([{
                transactionId,
                customerId,
                type: 'CREDIT',
                amount: dueAmount,
                paymentMethod: 'System',
                note: `Bill generated for ${dueAmount}`,
                userId
            }], { session });
        }

        await session.commitTransaction();
        session.endSession();
        res.status(201).json(bill[0]);

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getBills, createBill };
