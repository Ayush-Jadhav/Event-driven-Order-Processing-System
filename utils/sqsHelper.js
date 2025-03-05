const { sqs } = require("../config/awsSqsConfig");

exports.sendMessageToSQS = async (messageBody) => {
  try {
    const params = {
      MessageBody: JSON.stringify(messageBody),
      QueueUrl: process.env.AWS_SQS_QUEUE_URL
    };

    const result = await sqs.sendMessage(params).promise();
    console.log(`Message sent to SQS: ${result.MessageId}`);
    return result;
  } catch (error) {
    console.error("Error sending message to SQS:", error);
    throw error;
  }
};
