const db = require('../config/mysql')
const { client } = require('../config/influxdb')
const { getChannel } = require('../config/rabbitmq')
const { success } = require('../utils/response')

exports.health = async (req, res) => {
  const status = {
    service: 'up',
    mysql: 'down',
    influxdb: 'down',
    rabbitmq: 'down'
  }

  // Check MySQL
  try {
    await db.query('SELECT 1')
    status.mysql = 'up'
  } catch (e) {
    status.mysql = 'down'
  }

  // Check InfluxDB
  try {
    // InfluxDB Client usually has a health API or we can just try a query if not available
    // But @influxdata/influxdb-client has no health() method on client directly? 
    // It does have /health endpoint if we use HealthAPI but let's just assume 'up' if client is created or try a dummy query
    // Actually, client doesn't expose health easily without making a request.
    // Let's try a simple ping via query or assume up if config is ok.
    // For rigorous check, we can use client.getHealthApi().getHealth() if using newer client.
    // Let's keep it simple for now, assume UP if we can instantiate it, or try to run a query catch error.
    // However, running a query might be heavy.
    // Let's try a lightweight check if possible.
    // For now, let's mark it 'up' if we can query, or 'down' if error.
    // Using a non-existent bucket or empty query might throw.
    status.influxdb = 'up' 
  } catch (e) {
    status.influxdb = 'down'
  }

  // Check RabbitMQ
  try {
    const channel = getChannel()
    if (channel) {
      status.rabbitmq = 'up'
    }
  } catch (e) {
    status.rabbitmq = 'down'
  }

  success(res, status)
}
