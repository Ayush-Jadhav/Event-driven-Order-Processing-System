const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  items: [
    {
      productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product", 
        required: true 
      },
      quantity: { 
        type: Number, 
        required: true 
      },
    }
  ],
  totalAmount: {
    type : Number,
  },
  status: {
    type: String,
    enum: ["Pending", "Processed", "Failed"],
    default: "Pending",
  },
  createdAt: { 
    type: Date, 
    default: Date.now(),
  }
});

module.exports = mongoose.model("Order", orderSchema);
