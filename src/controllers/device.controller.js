const deviceService = require('../services/device.service')
const { success, fail } = require('../utils/response')

exports.create = async (req, res) => {
  try {
    const data = await deviceService.create(req.body)
    success(res, data)
  } catch (err) {
    fail(res, err.message, 40000, 400)
  }
}

exports.list = async (req, res) => {
  try {
    const data = await deviceService.getList(req.query)
    success(res, data)
  } catch (err) {
    fail(res, err.message)
  }
}

exports.detail = async (req, res) => {
  try {
    const data = await deviceService.getById(req.params.id)
    success(res, data)
  } catch (err) {
    fail(res, err.message, 40400, 404)
  }
}

exports.update = async (req, res) => {
  try {
    await deviceService.update(req.params.id, req.body)
    success(res, null)
  } catch (err) {
    fail(res, err.message, 40000, 400)
  }
}

exports.delete = async (req, res) => {
  try {
    await deviceService.delete(req.params.id)
    success(res, null)
  } catch (err) {
    fail(res, err.message, 40000, 400)
  }
}
