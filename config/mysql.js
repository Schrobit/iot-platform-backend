const mysql = require('mysql2')
require('dotenv').config()

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// 导出 promise 版本的 pool，方便使用 async/await
module.exports = pool.promise()
