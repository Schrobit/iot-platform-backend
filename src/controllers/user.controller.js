const userService = require('../services/user.service')
const { success, fail } = require('../utils/response')

exports.create = async (req, res, next) => {
  try {
    const data = await userService.createUser(req.body)
    success(res, data)
  } catch (err) {
    fail(res, err.message, 40000, 400)
  }
}

exports.list = async (req, res, next) => {
  try {
    const data = await userService.getUsers(req.query)
    success(res, data)
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params
    await userService.updateUser(id, req.body)
    success(res, null)
  } catch (err) {
    fail(res, err.message, 40000, 400)
  }
}

exports.resetPassword = async (req, res, next) => {
  try {
    const { id } = req.params
    const { new_password } = req.body
    if (!new_password) return fail(res, 'new_password 必填', 40000, 400)
    
    await userService.resetPassword(id, new_password)
    success(res, null)
  } catch (err) {
    fail(res, err.message, 40000, 400)
  }
}
