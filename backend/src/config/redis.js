const redis = require('redis');
const logger = require('./../utils/logger');
const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) =>logger.error("Redis Error:", err));

const connectRedis = async () => {
    if (!client.isOpen) {
        await client.connect();
    }
};

module.exports = { client, connectRedis };