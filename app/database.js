import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: 'https://stable-dragon-32203.upstash.io',
  token: '********',
})

async function getProducts() {
  try {
    const products = await redis.lrange('your-products-key', 0, -1); // TODO
    return products;
  } catch (error) {
    console.error('Error retrieving products from Upstash:', error);
    throw error;
  } finally {
    redis.quit();
  }
}

export default module.exports = {
  getProducts,
};