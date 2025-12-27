const amqp = require('amqplib')
require('dotenv').config()

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost'

let channel = null
let connection = null

/**
 * 建立 RabbitMQ 连接并初始化基础队列
 */
const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(RABBITMQ_URL)
    channel = await connection.createChannel()
    
    // 定义基础队列（下行、上行）
    await channel.assertQueue('downlink.queue', { durable: true })
    await channel.assertQueue('uplink.queue', { durable: true })
    
    console.log('✅ RabbitMQ Connected')
    return channel
  } catch (error) {
    console.error('❌ RabbitMQ Connection Error:', error)
    // 可以在这里做重连逻辑
    return null
  }
}

const getChannel = () => channel

/**
 * 启动上行队列消费并交由业务处理函数处理消息
 */
const startUplinkConsumer = async (onMessage) => {
  if (!channel) {
    console.error('❌ RabbitMQ channel not initialized, cannot start uplink consumer')
    return
  }

  const queueName = 'uplink.queue'
  await channel.assertQueue(queueName, { durable: true })

  channel.consume(queueName, (msg) => {
    if (!msg) {
      return
    }

    const content = msg.content.toString()
    let payload

    try {
      payload = JSON.parse(content)
    } catch (err) {
      console.error('❌ Invalid JSON message from uplink.queue:', err)
      channel.ack(msg)
      return
    }

    ;(async () => {
      try {
        if (onMessage) {
          await onMessage(payload)
        }
        channel.ack(msg)
      } catch (err) {
        console.error('❌ Error handling uplink message:', err)
        channel.ack(msg)
      }
    })()
  })

  console.log('✅ Uplink consumer started on queue:', queueName)
}

module.exports = {
  connectRabbitMQ,
  getChannel,
  startUplinkConsumer
}
