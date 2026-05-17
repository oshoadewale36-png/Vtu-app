const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    userId: String,
    type: String,
    amount: Number,
    status: String,
    phone: String,
    network: String
}, { timestamps: true });

    date:
module.exports = mongoose.model("Transaction", transactionSchema);