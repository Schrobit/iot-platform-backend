const telemetryService = require('../services/telemetry.service')
const deviceService = require('../services/device.service')
const { success, fail } = require('../utils/response')

exports.getDeviceLatest = async (req, res) => {
  try {
    const { id } = req.params
    // 1. Get device info for metadata (unit, type)
    const device = await deviceService.getById(id)
    
    // 2. Get telemetry
    const telemetry = await telemetryService.getDeviceLatest(id)
    
    if (!telemetry) {
      return success(res, { 
        device_id: id, 
        value: null,
        ts: null,
        unit: device.unit,
        type: device.type
      })
    }

    success(res, {
      device_id: id,
      type: device.type,
      value: telemetry.value,
      unit: device.unit,
      ts: telemetry.ts
    })
  } catch (err) {
    fail(res, err.message)
  }
}

exports.getDeviceHistory = async (req, res) => {
  try {
    const { id } = req.params
    const { from, to, agg, interval, limit } = req.query
    
    if (!from || !to) {
      return fail(res, 'from 和 to 是必填项', 40000, 400)
    }

    const data = await telemetryService.getDeviceHistory(id, { from, to, agg, interval, limit })
    success(res, data)
  } catch (err) {
    fail(res, err.message)
  }
}

exports.getCleanroomLatest = async (req, res) => {
  try {
    const { id } = req.params // cleanroom_id
    const { type } = req.query

    // 1. Find all devices in this cleanroom
    const devicesResult = await deviceService.getList({ cleanroom_id: id, page_size: 1000, type })
    const devices = devicesResult.items
    
    if (devices.length === 0) {
      return success(res, [])
    }

    const deviceIds = devices.map(d => d.id)
    const deviceMap = new Map(devices.map(d => [String(d.id), d]))

    // 2. Query InfluxDB for these devices
    const telemetryList = await telemetryService.getLatestByDeviceIds(deviceIds)
    
    // 3. Merge results
    const result = telemetryList.map(t => {
      const device = deviceMap.get(String(t.device_id))
      return {
        device_id: t.device_id,
        name: device ? device.name : '',
        type: device ? device.type : '',
        value: t.value,
        unit: device ? device.unit : '',
        ts: t.ts
      }
    })

    success(res, result)
  } catch (err) {
    fail(res, err.message)
  }
}
