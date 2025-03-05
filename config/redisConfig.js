const redis = require("redis");
require("dotenv").config(); 

const redisClient = redis.createClient({
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err));

(async () => {
    try{
        await redisClient.connect();
        console.log("Connected to Redis Cloud");
    } 
    catch (error) {
        console.error("Redis Connection Failed:", error);
    }
})();

module.exports = redisClient; 
