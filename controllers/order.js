const Order = require("../models/orderSchema");
const Product = require("../models/product");
const User = require("../models/user");
const { v4: uuidv4 } = require("uuid");
const { sendMessageToSQS } = require("../utils/sqsHelper");
const redisClient = require("../config/redisConfig");

exports.createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;

    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Missing required fields or empty items array" });
    }

    let totalAmount = 0;

    // Validate products & check stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) 
        return res.status(404).json({ 
            success: false, 
            message: `Product ${item.productId} not found` 
        });

      if (item.quantity > product.stock) 
        return res.status(400).json({ 
            success: false, 
            message: `Insufficient stock for ${product.name}` 
        });

      totalAmount += product.price * item.quantity;
    }

    // Deduct stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId, 
        { $inc: { stock: -item.quantity } }, 
        { new: true });
    }

    // Create order with "Pending" status
    const newOrder = await Order.create({
      orderId: uuidv4(),
      userId,
      items,
      totalAmount,
      status: "Pending"
    });


    await sendMessageToSQS({ orderId: newOrder.orderId, userId, items });

    await User.findByIdAndUpdate(
        userId,
        { $push: { orderHistory: newOrder._id } }, 
        { new: true }
    );

    return res.status(201).json({
      success: true,
      order: newOrder,
      message: "Order placed successfully and sent to queue"
    });

  } catch (err) {
    console.error("Error creating order:", err);
    return res.status(500).json({ 
        success: false,
        message: "Internal server error" 
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
  

