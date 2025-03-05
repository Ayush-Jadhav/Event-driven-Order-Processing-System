const AWS = require("aws-sdk");
const Order = require("../models/orderSchema");
const {sqs} = require("../config/awsSqsConfig");
const {SendMail} = require("../utils/mailSender");

const processOrder = async (orderData) => {
  try {
    const order = await Order.findOne({ orderId: orderData.orderId })
                    .populate("userId", "email")
                    .populate("items.productId", "name");

    if (!order) {
      console.error(`Order not found: ${orderData.orderId}`);
      return;
    }

    // condition to check if order can be processed
    let hasError = false;

    for (const item of order.items) {
      if (!item.productId || !item.productId.name) {
        console.error(`Product ID ${item.productId} not found in database`);
        hasError = true;
      }
    }

    if (hasError) {
      order.status = "Failed"; 
      await order.save();

      console.error(`Order ${orderData.orderId} failed due to missing product details.`);

      const failureEmailBody = `Your order with ID ${order.orderId} has <strong>failed</strong> due to missing product.`;
      
      await SendMail({
        to: order.userId.email,
        subject: `Order #${order.orderId} Failed`,
        body: failureEmailBody
      });

      return;
    }

    // mark order as Processed
    order.status = "Processed";
    await order.save();

    console.log(`Order ${orderData.orderId} processed successfully`);

    // Send success email
    const emailBody = `Your order with ID ${order.orderId} has been processed.<br><br>
    <strong>Items:</strong><br>${order.items
      .map(item => `- ${item.productId.name}: ${item.quantity}`)
      .join("<br>")}`;

    await SendMail({
      to: order.userId.email,
      subject: `Order #${order.orderId} Processed Successfully`,
      body: emailBody
    });

    console.log(`Email sent to ${order.userId.email} for Order ID: ${order.orderId}`);

  } catch (err) {
    console.error(`Error processing order ${orderData.orderId}:`, err);

    try {
      //  Update order status to "Failed" if an error occurs
      const order = await Order.findOne({ orderId: orderData.orderId });
      if (order) {
        order.status = "Failed";
        await order.save();
        
        // Send failure email
        await SendMail({
          to: order.userId.email,
          subject: `Order #${orderData.orderId} Failed`,
          body: `Your order with ID ${order.orderId} has <strong>failed</strong> due to a processing error. Please try again later.`
        });

        console.error(` Failure email sent to ${order.userId.email}`);
      }
    } 
    catch (emailError) {
      console.error(`Error sending failure email:`, emailError);
    }
  }
};


const pollQueue = async () => {
  while (true) {
    try {
      const params = {
        QueueUrl: process.env.AWS_SQS_QUEUE_URL,
        MaxNumberOfMessages: 5,
        WaitTimeSeconds: 10
      };

      const {Messages} = await sqs.receiveMessage(params).promise();

      if (!Messages || Messages.length === 0) continue;

      for (const message of Messages) {
        const orderData = JSON.parse(message.Body);
        await processOrder(orderData);

        // Delete message after processing
        await sqs.deleteMessage({
          QueueUrl: process.env.AWS_SQS_QUEUE_URL,
          ReceiptHandle: message.ReceiptHandle
        }).promise();
      }
    } 
    catch (err) {
      console.error("Error polling SQS:", err);
    }
  }
};

exports.startWorker = () => {
    console.log("Order processor started...");
    pollQueue();
};
