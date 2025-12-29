const cleanroomDao = require('../dao/cleanroom.dao')

class CleanroomService {
  async create(data) {
    const id = await cleanroomDao.create(data)
    return { id, ...data }
  }

  async getList(query) {
    const page = parseInt(query.page) || 1
    const pageSize = parseInt(query.page_size) || 20
    const result = await cleanroomDao.findAll({ page, pageSize, keyword: query.keyword })
    return {
      items: result.items,
      page,
      page_size: pageSize,
      total: result.total
    }
  }

  async getById(id) {
    const item = await cleanroomDao.findById(id)
    if (!item) throw new Error('洁净室不存在')
    return item
  }

  async update(id, data) {
    const affected = await cleanroomDao.update(id, data)
    if (affected === 0) throw new Error('更新失败')
    return true
  }

  async delete(id) {
    const affected = await cleanroomDao.delete(id)
    if (affected === 0) throw new Error('删除失败')
    return true
  }
}

module.exports = new CleanroomService()
