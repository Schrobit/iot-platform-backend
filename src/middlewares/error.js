/**
 * 全局错误处理中间件
 * ⚠️ 注意：这是 Express 特殊中间件，必须有 4 个参数
 */
module.exports = (err, req, res, next) => {
  // 1. 打印错误（开发阶段非常重要）
  console.error('❌ Error:', err)

  // 2. 默认状态码和错误信息
  let statusCode = 500
  let message = '服务器内部错误'

  // 3. 如果是我们主动抛出的错误
  if (err instanceof Error) {
    message = err.message
  }

  // 4. 返回统一格式
  res.status(statusCode).json({
    code: statusCode,
    message
  })
}
