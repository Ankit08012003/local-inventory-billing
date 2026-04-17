const Customer = require('../models/CustomerModel');

const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find({ userId: req.user._id });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createCustomer = async (req, res) => {
    try {
        const { name, mobile, address } = req.body;
        const customer = await Customer.create({
            name, mobile, address, userId: req.user._id
        });
        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCustomer = async (req, res) => {
    try {
        const { name, mobile, address } = req.body;
        const customer = await Customer.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { name, mobile, address },
            { new: true }
        );
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findOne({ _id: req.params.id, userId: req.user._id });
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        
        if (customer.totalDue !== 0) {
            return res.status(400).json({ message: 'Cannot delete customer with non-zero total due' });
        }

        await customer.deleteOne();
        res.json({ message: 'Customer deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCustomers, createCustomer, updateCustomer, deleteCustomer };
