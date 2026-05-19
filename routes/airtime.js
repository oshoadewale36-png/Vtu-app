const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const axios = require("axios");

const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

// BUY AIRTIME
router.post("/buy", async (req, res) => {
    try {
        const { userId, phone, amount, network } = req.body;
        
        // FIND USER WALLET
        const wallet = await Wallet.findOne({ userId });
        if (!wallet ) {
            return res.json({ message: "Wallet not found" });
        }
        
        //CHECK BALANCE
        if (wallet.balance < amount) {
            return res.json({ message: "Insufficient balance" });
        }

        // DEDUCT AMOUNT
        wallet.balance -= amount;
        await wallet.save();

        // CALL VTU API
        const response = await axios.post(
            "https://vtu.ng/wp-json//airtime",
             { 
                phone,
                amount,
                network
                },
               {
                headers: {
                    Authorization: `Bearer b08280a68dc7dede275d7e66ba76308ac4ce43733ee865a13e1b776af174ee1b`
                },
            }
        );
        await Transaction.create({
            userId,
            type: "airtime",
            amount,
            status: "success",
            phone,
            network
        });

        res.json({
            message: "Airtime purchase successful",
            apiResponse: response.data,
            balance: wallet.balance
        });
    } catch (error) {
        res.status(500).json({ error: error.message 
        });
    }
});

module.exports = router;