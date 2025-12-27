const bcrypt = require('bcryptjs')
const userDao = require('../dao/user.dao')

class UserService {
  async createUser(data) {
    const existing = await userDao.findByUsername(data.username)
    if (existing) {
      throw new Error('用户名已存在')
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(data.password, salt)

    const userId = await userDao.create({
      username: data.username,
      password_hash: passwordHash,
      role: data.role || 'staff',
      email: data.email,
      is_active: 1
    })

    return { id: userId, ...data, password: undefined } // Don't return password
  }

  async getUsers(query) {
    const page = parseInt(query.page) || 1
    const pageSize = parseInt(query.page_size) || 20
    const { role, keyword } = query

    const result = await userDao.findAll({ page, pageSize, role, keyword })
    return {
      items: result.items,
      page,
      page_size: pageSize,
      total: result.total
    }
  }

  async updateUser(id, data) {
    const affected = await userDao.update(id, data)
    if (affected === 0) {
      throw new Error('更新失败，用户可能不存在')
    }
    return true
  }

  async resetPassword(id, newPassword) {
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(newPassword, salt)
    
    const affected = await userDao.updatePassword(id, passwordHash)
    if (affected === 0) {
      throw new Error('重置失败，用户可能不存在')
    }
    return true
  }
}

module.exports = new UserService()
