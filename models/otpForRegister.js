const mongoose = require("mongoose");
const { SendMail } = require("../utils/mailSender");

const otpSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 300, // 5 minutes in seconds
    },
});

otpSchema.pre("save", async function(next) {
    try {
        await SendMail({
            to: this.email, 
            subject: "Email Verification Mail",
            body: `Your One Time Password is: ${this.otp}`,
        });
        next(); 
    } catch (err) {
        console.log("Error Occurred while sending mail", err);
    }
});


module.exports = mongoose.model("OTP", otpSchema);
