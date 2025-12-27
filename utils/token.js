const jwt = require('jsonwebtoken')

/**
 * 生成 JWT
 * payload: 要写进 token 的数据（不要放密码！）
 */
exports.signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '2h'
  })
}

/**
 * 校验 JWT
 * token: 前端传来的 token
 */
exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}
