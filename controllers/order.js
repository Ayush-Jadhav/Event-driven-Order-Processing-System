const Order = require("../models/orderSchema");
const Product = require("../models/product");
const User = require("../models/user");
const { v4: uuidv4 } = require("uuid");
const { sendMessageToSQS } = require("../utils/sqsHelper");
const redisClient = require("../config/redisConfig");
const mongoose = require("mongoose"); 
const { IoTSecureTunneling, TrustedAdvisor } = require("aws-sdk");

exports.createOrder = async (req, res) => {
  // const session = await mongoose.startSession();
  // session.startTransaction();

  try {
    const { items } = req.body;
    const userId = req.user.id;

    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Missing required fields or empty items array" });
    }

    let totalAmount = 0;
    const bulkUpdateOps = [];

    // Fetching all products in one query
    const productIds = items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    // Creating a Map for quick access
    const productMap = new Map(products.map(product => [product._id.toString(), product]));

    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: `Product ${item.productId} not found` 
        });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }

      totalAmount += product.price * item.quantity;

      // Add stock decrement operation for bulk update
      bulkUpdateOps.push({
        updateOne: {
          filter: { _id: product._id, stock: { $gte: item.quantity } },  // Ensure stock is available
          update: { $inc: { stock: -item.quantity } }  // Reduce stock
        }
      });
    }

    // Execute bulk update for stock decrement (Atomic Operation)
    if (bulkUpdateOps.length > 0) {
      const bulkWriteResult = await Product.bulkWrite(bulkUpdateOps);
      if (bulkWriteResult.matchedCount !== items.length) {
        return res.status(400).json({ 
          success: false, 
          message: "Stock update failed due to concurrency issues" 
        });
      }
    }

    // Create the order
    const newOrder = await Order.create({
      orderId: uuidv4(),
      userId,
      items,
      totalAmount,
      status: "Pending"
    });

    // Add order to user's order history
    await User.findByIdAndUpdate(userId, {$push: {orderHistory: newOrder._id}},{new: true});

    // Send order message to SQS for processing
    await sendMessageToSQS({ orderId: newOrder.orderId, userId, items });

    return res.status(201).json({
      success: true,
      order: newOrder,
      message: "Order placed successfully and sent to queue"
    });

  } catch (err) {
    // await session.abortTransaction();
    // session.endSession();
    
    console.error("Error creating order:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error, please try again"
    });
  }
};




exports.getOrderDetails = async (req, res) => {
    try {
      const {id} = req.params;

      // Check if order exists in Redis
      const cachedOrder = await redisClient.get(`order:${id}`);

      if (cachedOrder) {
          console.log(`Order ${id} retrieved from Redis`);
          return res.status(200).json(JSON.parse(cachedOrder));
      }
  
      // Find order by ID
      const order = await Order.findOne({ orderId: id });
  
      if (!order) {
        return res.status(404).json({ 
            success: false, 
            message: "Order not found" 
        });
      }

      // Store in Redis with expiration (10 minutes)
      await redisClient.setEx(`order:${id}`, 600, JSON.stringify(order));
  
      return res.status(200).json({ 
        success: true, 
        order 
    });
    } catch (err) {
      console.error("Error fetching order:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  };
  

