const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Transaction = require("../models/Transaction");

router.get("/:userId", async (req, res) => {

    try {
        const transactions = await Transaction.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json({ transactions });

        res.json({ transactions });
    } catch (error) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
