const deviceDao = require('../dao/device.dao')

class DeviceService {
  async create(data) {
    const id = await deviceDao.create(data)
    return { id, ...data }
  }

  async getList(query) {
    const page = parseInt(query.page) || 1
    const pageSize = parseInt(query.page_size) || 20
    const result = await deviceDao.findAll(query)
    return {
      items: result.items,
      page,
      page_size: pageSize,
      total: result.total
    }
  }

  async getById(id) {
    const item = await deviceDao.findById(id)
    if (!item) throw new Error('设备不存在')
    return item
  }

  async update(id, data) {
    const affected = await deviceDao.update(id, data)
    if (affected === 0) throw new Error('更新失败')
    return true
  }

  async delete(id) {
    const affected = await deviceDao.delete(id)
    if (affected === 0) throw new Error('删除失败')
    return true
  }
}

module.exports = new DeviceService()
