const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    network: {
        type: String
    },
    plan: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
   
    date: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model("Transaction", transactionSchema);