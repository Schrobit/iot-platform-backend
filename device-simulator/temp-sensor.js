const amqp = require('amqplib')

/**
 * 模拟一个温度传感器，周期性向 RabbitMQ uplink.queue 上报遥测数据
 */
async function main() {
  const url = process.env.RABBITMQ_URL || 'amqp://localhost'
  const deviceId = process.env.DEVICE_ID || '2'
  const intervalMs = parseInt(process.env.INTERVAL_MS || '3000', 10)

  const connection = await amqp.connect(url)
  const channel = await connection.createChannel()

  const queueName = 'uplink.queue'
  await channel.assertQueue(queueName, { durable: true })

  console.log(`🚀 温度传感器模拟器启动，device_id=${deviceId}，每 ${intervalMs}ms 上报一次`)

  setInterval(() => {
    const now = new Date()
    const value = 22 + (Math.random() * 2 - 1)
    const message = {
      msg_type: 'telemetry',
      device_id: deviceId,
      timestamp: now.toISOString(),
      payload: {
        value,
        unit: '°C'
      }
    }

    const body = Buffer.from(JSON.stringify(message))
    channel.sendToQueue(queueName, body, { persistent: true })
    console.log(`[${now.toISOString()}] Sent telemetry:`, message)
  }, intervalMs)
}

main().catch((err) => {
  console.error('Simulator error:', err)
  process.exit(1)
})

