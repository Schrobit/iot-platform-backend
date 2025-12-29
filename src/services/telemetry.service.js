const { InfluxDB, Point } = require('@influxdata/influxdb-client')
const { queryApi, bucket, org, writeApi } = require('../config/influxdb')
const deviceDao = require('../dao/device.dao')

class TelemetryService {
  /**
   * 消费上行队列中的遥测消息并写入 InfluxDB 与更新设备状态
   */
  async handleUplinkMessage(message) {
    if (!message || typeof message !== 'object') {
      return
    }

    const { msg_type, device_id, timestamp, payload } = message

    if (msg_type === 'telemetry') {
      if (!payload || typeof payload.value !== 'number') {
        return
      }

      const value = payload.value
      const unit = payload.unit
      const ts = timestamp ? new Date(timestamp) : new Date()

      const point = new Point('telemetry')
        .tag('device_id', String(device_id))
        .floatField('value', value)
        .timestamp(ts)

      if (unit) {
        point.tag('unit', String(unit))
      }

      writeApi.writePoint(point)

      try {
        await deviceDao.touchLastSeenAt(device_id, ts)
      } catch (err) {
        // 忽略 last_seen_at 更新失败，避免影响写入链路
      }
    } else if (msg_type === 'status') {
      const ts = timestamp ? new Date(timestamp) : new Date()
      try {
        await deviceDao.touchLastSeenAt(device_id, ts)
      } catch (err) {
        // 忽略 last_seen_at 更新失败
      }
    }
  }

  async getDeviceLatest(deviceId) {
    // 假设 measurement 为 'telemetry'，tag 为 device_id
    // 查询最近 30 天的最新一条数据（如果没有数据则返回空）
    const fluxQuery = `
      from(bucket: "${bucket}")
        |> range(start: -30d)
        |> filter(fn: (r) => r._measurement == "telemetry")
        |> filter(fn: (r) => r.device_id == "${deviceId}")
        |> last()
    `
    
    // 解析 InfluxDB 结果
    const rows = []
    for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
      const o = tableMeta.toObject(values)
      rows.push(o)
    }

    if (rows.length === 0) return null

    // 假设我们只关心 _value 和 _time，以及 _field (如果有多个指标)
    // 根据文档，单设备=单变量，所以通常只有一条记录
    const record = rows[0]
    return {
      device_id: deviceId, // string or int depends on storage
      value: record._value,
      ts: record._time
      // type/unit usually comes from MySQL device metadata, but can be passed here if needed or merged in controller
    }
  }

  async getDeviceHistory(deviceId, { from, to, agg, interval, limit }) {
    let aggregate = ''
    if (agg && agg !== 'raw' && interval) {
      aggregate = `|> aggregateWindow(every: ${interval}, fn: ${agg}, createEmpty: false)`
    }
    
    const fluxQuery = `
      from(bucket: "${bucket}")
        |> range(start: ${new Date(from).toISOString()}, stop: ${new Date(to).toISOString()})
        |> filter(fn: (r) => r._measurement == "telemetry")
        |> filter(fn: (r) => r.device_id == "${deviceId}")
        ${aggregate}
        |> limit(n: ${limit || 1000})
    `

    const points = []
    for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
      const o = tableMeta.toObject(values)
      points.push({
        ts: o._time,
        value: o._value
      })
    }

    return {
      device_id: deviceId,
      points
    }
  }

  async getCleanroomLatest(cleanroomId, type) {
    // 这需要先知道该 Cleanroom 下有哪些 Device ID
    // 简单做法：
    // 1. 查 MySQL 拿到所有 device_id
    // 2. 构建 InfluxDB 查询 filter (r.device_id == "1" or r.device_id == "2" ...)
    // 或者 InfluxDB 存了 cleanroom_id tag? 
    // 文档没明确 InfluxDB Schema。
    // 假设 InfluxDB 只存 device_id tag。
    // 所以我们需要依赖 DeviceService 来先获取设备列表。
    
    // 这里我们先只定义方法，具体逻辑在 Controller 组装，或者 Service 调用 DAO。
    // 为了解耦，建议 Service 接收 deviceIds 数组。
    return [] // 占位，将在 Controller 中实现组合逻辑
  }
  
  async getLatestByDeviceIds(deviceIds) {
    if (!deviceIds || deviceIds.length === 0) return []

    const deviceFilter = deviceIds.map(id => `r.device_id == "${id}"`).join(' or ')
    
    const fluxQuery = `
      from(bucket: "${bucket}")
        |> range(start: -30d)
        |> filter(fn: (r) => r._measurement == "telemetry")
        |> filter(fn: (r) => (${deviceFilter}))
        |> last()
    `
    
    const rows = []
    for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
      const o = tableMeta.toObject(values)
      rows.push({
        device_id: o.device_id,
        value: o._value,
        ts: o._time
      })
    }
    return rows
  }
}

module.exports = new TelemetryService()
