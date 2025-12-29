const authService = require('../services/auth.service')
const { success, fail } = require('../utils/response')

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return fail(res, '用户名和密码必填', 40000, 400)
    }
    const data = await authService.login(username, password)
    success(res, data)
  } catch (err) {
    fail(res, err.message, 40100, 401)
  }
}

exports.refresh = async (req, res, next) => {
  try {
    const { refresh_token } = req.body
    if (!refresh_token) {
      return fail(res, 'refresh_token 必填', 40000, 400)
    }
    const data = await authService.refreshToken(refresh_token)
    success(res, data)
  } catch (err) {
    fail(res, err.message, 40100, 401)
  }
}

exports.me = (req, res) => {
  success(res, req.user)
}
