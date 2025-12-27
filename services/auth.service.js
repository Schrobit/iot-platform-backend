const bcrypt = require('bcryptjs')
const userDao = require('../dao/user.dao')
const { signToken, verifyToken } = require('../utils/token')

class AuthService {
  async login(username, password) {
    const user = await userDao.findByUsername(username)
    if (!user) {
      throw new Error('用户名或密码错误')
    }

    if (!user.is_active) {
      throw new Error('用户已被禁用')
    }

    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      throw new Error('用户名或密码错误')
    }

    const payload = { userId: user.id, role: user.role }
    const accessToken = signToken(payload)
    // 简单起见 refresh token 也可以用 jwt，或者存数据库
    // 这里为了演示复用 signToken，实际生产中 refresh token 应该有更长的过期时间和单独的存储
    const refreshToken = signToken({ ...payload, type: 'refresh' }) 

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 7200, // 2h
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email
      }
    }
  }

  async refreshToken(token) {
    try {
      const decoded = verifyToken(token)
      const user = await userDao.findById(decoded.userId)
      if (!user) throw new Error('用户不存在')
      
      const payload = { userId: user.id, role: user.role }
      const accessToken = signToken(payload)
      
      return {
        access_token: accessToken,
        expires_in: 7200
      }
    } catch (err) {
      throw new Error('Refresh Token 无效')
    }
  }
}

module.exports = new AuthService()
