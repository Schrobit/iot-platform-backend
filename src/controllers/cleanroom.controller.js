const cleanroomService = require('../services/cleanroom.service')
const gatewayService = require('../services/gateway.service') // Needed for "Cleanroom's gateways"
const { success, fail } = require('../utils/response')

exports.create = async (req, res) => {
  try {
    const data = await cleanroomService.create(req.body)
    success(res, data)
  } catch (err) {
    fail(res, err.message, 40000, 400)
  }
}

exports.list = async (req, res) => {
  try {
    const data = await cleanroomService.getList(req.query)
    success(res, data)
  } catch (err) {
    fail(res, err.message)
  }
}

exports.detail = async (req, res) => {
  try {
    const data = await cleanroomService.getById(req.params.id)
    success(res, data)
  } catch (err) {
    fail(res, err.message, 40400, 404)
  }
}

exports.update = async (req, res) => {
  try {
    await cleanroomService.update(req.params.id, req.body)
    success(res, null)
  } catch (err) {
    fail(res, err.message, 40000, 400)
  }
}

exports.delete = async (req, res) => {
  try {
    await cleanroomService.delete(req.params.id)
    success(res, null)
  } catch (err) {
    fail(res, err.message, 40000, 400)
  }
}

// 4.3.4 查询洁净室可用网关
exports.listGateways = async (req, res) => {
  try {
    const data = await gatewayService.getGatewaysByCleanroom(req.params.id)
    success(res, data)
  } catch (err) {
    fail(res, err.message)
  }
}
