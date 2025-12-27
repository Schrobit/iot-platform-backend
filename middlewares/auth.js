const { verifyToken } = require('../utils/token')
const userDao = require('../dao/user.dao')

/**
 * 认证中间件：支持开发环境下的免 Token 模式
 */
module.exports = async (req, res, next) => {
  try {
    const devBypass =
      process.env.AUTH_DEV_BYPASS === 'true' &&
      process.env.NODE_ENV !== 'production'

    if (devBypass) {
      req.user = {
        id: null,
        username: 'dev-admin',
        role: 'admin',
        email: null,
        is_active: 1
      }
      return next()
    }

    const auth = req.headers.authorization
    if (!auth) {
      return res.status(401).json({ code: 401, message: '未登录' })
    }

    const token = auth.split(' ')[1]
    const payload = verifyToken(token)

    // 再查一次数据库，防止用户被删除
    const user = await userDao.findById(payload.userId)
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户不存在' })
    }

    req.user = user
    next()
  } catch (err) {
    res.status(401).json({ code: 401, message: 'token 无效或过期' })
  }
}
