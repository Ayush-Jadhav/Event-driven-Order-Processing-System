const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    number: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    orderHistory :[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
    }],
    createdAt: { 
    type: Date, 
    default: Date.now(),
    },
    refreshToken: {
        type: String,
    }
});

module.exports = mongoose.model("User", userSchema);
