const commandDao = require('../dao/command.dao')
const deviceDao = require('../dao/device.dao')
const { getChannel } = require('../config/rabbitmq')

class CommandService {
  async sendCommand(deviceId, commandName, payload, issuedBy) {
    // 1. Verify device exists
    const device = await deviceDao.findById(deviceId)
    if (!device) throw new Error('设备不存在')

    // 2. Log to MySQL
    const commandId = await commandDao.create({
      device_id: deviceId,
      issued_by: issuedBy,
      command_name: commandName,
      payload
    })

    // 3. Push to RabbitMQ
    const channel = getChannel()
    const enqueuedAt = new Date().toISOString()
    
    if (channel) {
      const message = {
        command_id: commandId,
        device_id: deviceId,
        command_name: commandName,
        payload,
        ts: Date.now()
      }
      
      // Routing Key: downlink.queue (as per docs)
      // Note: In a real MQTT setup, we might use a topic like "downlink/device_id"
      // But docs say "RabbitMQ downlink.queue"
      const queueName = 'downlink.queue'
      channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)))
    } else {
      console.warn('⚠️ RabbitMQ channel not available, command logged but not sent')
      // You might want to throw error or just log warning depending on consistency requirements
    }

    return {
      command_id: commandId,
      device_id: deviceId,
      enqueued_at: enqueuedAt
    }
  }

  async getList(query) {
    const page = parseInt(query.page) || 1
    const pageSize = parseInt(query.page_size) || 20
    const result = await commandDao.findAll({ ...query, page, pageSize })
    return {
      items: result.items,
      page,
      page_size: pageSize,
      total: result.total
    }
  }

  async getById(id) {
    const item = await commandDao.findById(id)
    if (!item) throw new Error('命令记录不存在')
    return item
  }
}

module.exports = new CommandService()
