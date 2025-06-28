require("dotenv").config();
const USE_REDIS_BLACKLIST = process.env.USE_REDIS_BLACKLIST === "true";

let redisClient;
if (USE_REDIS_BLACKLIST) {
  const redis = require("redis");
  redisClient = redis.createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
  });
  redisClient.connect().catch(console.error);
}

const blacklistMemory = new Set();

async function addToken(token, exp) {
  if (USE_REDIS_BLACKLIST) {
    const now = Math.floor(Date.now() / 1000);
    const ttl = exp - now;
    if (ttl > 0) {
      await redisClient.set(token, "blacklisted", { EX: ttl });
    }
  } else {
    blacklistMemory.add(token);
  }
}

async function isBlacklisted(token) {
  if (USE_REDIS_BLACKLIST) {
    const val = await redisClient.get(token);
    return val === "blacklisted";
  } else {
    return blacklistMemory.has(token);
  }
}

module.exports = { addToken, isBlacklisted };
