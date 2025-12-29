exports.success = (res, data = null) => {
  res.status(200).json({
    code: 0,
    message: 'ok',
    data: data || {}
  })
}

exports.fail = (res, message = 'Error', code = 50000, status = 500) => {
  res.status(status).json({
    code,
    message,
    data: null
  })
}
