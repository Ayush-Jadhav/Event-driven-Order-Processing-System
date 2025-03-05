const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    require : true,
  },
  price: {
    type: Number,
    require: true,
  },
  stock:{
    type: Number,
    require: true,
  }, 
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Product", productSchema);
