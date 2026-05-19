const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const axios = require("axios");

const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

//BUY DATA
router.post("/buy", async (req, res) => {
    try {
        const { userId, phone, network, plan, amount } = req.body;

        // FIND WALLET
        const wallet = await Wallet.findOne({ userId });

        if (!wallet) {
            return res.json({ message: "Wallet not found" });
        }

        // CHECK BALANCE
        if (wallet.balance < amount) {
            return res.json({ message: "Insufficient balance" });
        }

        // DEDUCT AMOUNT
        wallet.balance -= amount;
        await wallet.save();

        // CALL DATA API
        const response = await axios.post(
            "https://vtu.ng/wp-json//data",
            {
                phone,
                network,
                plan,
                amount
            },
            {
                headers: {
                    Authorization: `Bearer b08280a68dc7dede275d7e66ba76308ac4ce43733ee865a13e1b776af174ee1b`
                },
            }
        );

        // SAVE TRANSACTION
        await Transaction.create({
            userId,
            type: "data",
            amount,
            status: "success",
            phone,
            network,
        });


        res.json({
            message: "Data purchase successful",
            apiResponse: response.data,
            balance: wallet.balance
        });
    } catch (error) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;