const express = require('express');
const router = express.Router();
const { getBills, createBill } = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getBills)
    .post(protect, createBill);

module.exports = router;
