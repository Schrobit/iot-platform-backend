const gatewayService = require('../services/gateway.service')
const { success, fail } = require('../utils/response')

exports.create = async (req, res) => {
  try {
    const data = await gatewayService.create(req.body)
    success(res, data)
  } catch (err) {
    fail(res, err.message, 40000, 400)
  }
}

exports.list = async (req, res) => {
  try {
    const data = await gatewayService.getList(req.query)
    success(res, data)
  } catch (err) {
    fail(res, err.message)
  }
}

exports.detail = async (req, res) => {
  try {
    const data = await gatewayService.getById(req.params.id)
    success(res, data)
  } catch (err) {
    fail(res, err.message, 40400, 404)
  }
}

exports.update = async (req, res) => {
  try {
    await gatewayService.update(req.params.id, req.body)
    success(res, null)
  } catch (err) {
    fail(res, err.message, 40000, 400)
  }
}

exports.delete = async (req, res) => {
  try {
    await gatewayService.delete(req.params.id)
    success(res, null)
  } catch (err) {
    fail(res, err.message, 40000, 400)
  }
}

exports.addCleanroom = async (req, res) => {
  try {
    const { cleanroom_id, meta } = req.body
    await gatewayService.addCleanroom(req.params.id, cleanroom_id, meta)
    success(res, null)
  } catch (err) {
    fail(res, err.message, 40000, 400)
  }
}

exports.removeCleanroom = async (req, res) => {
  try {
    await gatewayService.removeCleanroom(req.params.id, req.params.cleanroom_id)
    success(res, null)
  } catch (err) {
    fail(res, err.message, 40000, 400)
  }
}

exports.listCleanrooms = async (req, res) => {
  try {
    const data = await gatewayService.getCleanrooms(req.params.id)
    success(res, data)
  } catch (err) {
    fail(res, err.message)
  }
}
