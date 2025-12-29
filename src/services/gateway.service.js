const gatewayDao = require('../dao/gateway.dao')

class GatewayService {
  async create(data) {
    const id = await gatewayDao.create(data)
    return { id, ...data }
  }

  async getList(query) {
    const page = parseInt(query.page) || 1
    const pageSize = parseInt(query.page_size) || 20
    const result = await gatewayDao.findAll({ page, pageSize, keyword: query.keyword })
    return {
      items: result.items,
      page,
      page_size: pageSize,
      total: result.total
    }
  }

  async getById(id) {
    const item = await gatewayDao.findById(id)
    if (!item) throw new Error('网关不存在')
    return item
  }

  async update(id, data) {
    const affected = await gatewayDao.update(id, data)
    if (affected === 0) throw new Error('更新失败')
    return true
  }

  async delete(id) {
    const affected = await gatewayDao.delete(id)
    if (affected === 0) throw new Error('删除失败')
    return true
  }

  async addCleanroom(gatewayId, cleanroomId, meta) {
    try {
      await gatewayDao.addCleanroom(gatewayId, cleanroomId, meta)
      return true
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') throw new Error('该关联已存在')
      throw e
    }
  }

  async removeCleanroom(gatewayId, cleanroomId) {
    const affected = await gatewayDao.removeCleanroom(gatewayId, cleanroomId)
    if (affected === 0) throw new Error('关联不存在')
    return true
  }

  async getCleanrooms(gatewayId) {
    return await gatewayDao.findCleanroomsByGateway(gatewayId)
  }

  async getGatewaysByCleanroom(cleanroomId) {
    return await gatewayDao.findGatewaysByCleanroom(cleanroomId)
  }
}

module.exports = new GatewayService()
