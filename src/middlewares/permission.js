exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      code: 40300,
      message: '无权限 (Admin Only)',
      data: null
    })
  }
  next()
}
