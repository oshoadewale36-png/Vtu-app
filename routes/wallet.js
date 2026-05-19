const express = require("express");
const mongoos = require("mongoose");
const router = express.Router();

const Wallet = require("../models/Wallet");

// Create Wallet
router.post("/", async (req, res) => {
    try {
        const { userId } = req.body;

        const existing = await Wallet.findOne({ userId });
        if (existing) {
            return res.json({
                message: "Wallet already exists"
            });
        }
        const wallet = new Wallet({ userId });
        await wallet.save();
        res.json({
            message: "Wallet created", wallet });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Fund WALLET
router.post("/fund", async (req, res )=> {
    try { 
      const {userId, amount } = req.body;
      const wallet = await Wallet.findOne({ userId });
      if (!wallet) return res.json({ message: "Wallet not found"});

      wallet.balance += amount;
      await wallet.save();

      res.json({
        message: "Wallet funded successfully",
        balance: wallet.balance,
      });
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
});

//GET BALANCE
router.get("/balance/:userId", async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ userId });

        if (!wallet) {
            return res.json({ message: "Wallet not found" });
        }

        res.json({ balance: wallet.balance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;