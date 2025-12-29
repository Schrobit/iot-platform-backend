const commandService = require('../services/command.service')
const { success, fail } = require('../utils/response')

exports.sendCommand = async (req, res) => {
  try {
    const { id } = req.params // device_id
    const { command_name, payload } = req.body
    const issuedBy = req.user.id

    if (!command_name) {
      return fail(res, 'command_name 必填', 40000, 400)
    }

    const data = await commandService.sendCommand(id, command_name, payload, issuedBy)
    success(res, data)
  } catch (err) {
    fail(res, err.message, 50000, 500)
  }
}

exports.list = async (req, res) => {
  try {
    const data = await commandService.getList(req.query)
    success(res, data)
  } catch (err) {
    fail(res, err.message)
  }
}

exports.detail = async (req, res) => {
  try {
    const data = await commandService.getById(req.params.id)
    success(res, data)
  } catch (err) {
    fail(res, err.message, 40400, 404)
  }
}
