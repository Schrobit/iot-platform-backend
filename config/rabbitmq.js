const amqp = require('amqplib')
require('dotenv').config()

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost'

let channel = null
let connection = null

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(RABBITMQ_URL)
    channel = await connection.createChannel()
    
    // 定义队列
    await channel.assertQueue('downlink.queue', { durable: true })
    
    console.log('✅ RabbitMQ Connected')
    return channel
  } catch (error) {
    console.error('❌ RabbitMQ Connection Error:', error)
    // 可以在这里做重连逻辑
    return null
  }
}

const getChannel = () => channel

module.exports = {
  connectRabbitMQ,
  getChannel
}
