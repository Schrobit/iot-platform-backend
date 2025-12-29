const db = require('../config/mysql')

class UserDao {
  async findByUsername(username) {
    const [rows] = await db.query('SELECT * FROM user WHERE username = ?', [username])
    return rows[0]
  }

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM user WHERE id = ?', [id])
    return rows[0]
  }

  async create(user) {
    const { username, password_hash, role, email, is_active } = user
    const [result] = await db.query(
      'INSERT INTO user (username, password_hash, role, email, is_active) VALUES (?, ?, ?, ?, ?)',
      [username, password_hash, role, email, is_active !== undefined ? is_active : 1]
    )
    return result.insertId
  }

  async findAll({ page, pageSize, role, keyword }) {
    let sql = 'SELECT id, username, role, email, is_active, created_at FROM user WHERE 1=1'
    const params = []

    if (role) {
      sql += ' AND role = ?'
      params.push(role)
    }

    if (keyword) {
      sql += ' AND username LIKE ?'
      params.push(`%${keyword}%`)
    }

    // Count total
    const [countRows] = await db.query(sql.replace('SELECT id, username, role, email, is_active, created_at', 'SELECT COUNT(*) as total'), params)
    const total = countRows[0].total

    // Pagination
    sql += ' LIMIT ? OFFSET ?'
    params.push(parseInt(pageSize), (page - 1) * pageSize)

    const [rows] = await db.query(sql, params)
    return { items: rows, total }
  }

  async update(id, data) {
    const fields = []
    const params = []

    if (data.role) {
      fields.push('role = ?')
      params.push(data.role)
    }
    if (data.email !== undefined) {
      fields.push('email = ?')
      params.push(data.email)
    }
    if (data.is_active !== undefined) {
      fields.push('is_active = ?')
      params.push(data.is_active)
    }

    if (fields.length === 0) return 0

    const sql = `UPDATE user SET ${fields.join(', ')} WHERE id = ?`
    params.push(id)

    const [result] = await db.query(sql, params)
    return result.affectedRows
  }

  async updatePassword(id, passwordHash) {
    const [result] = await db.query('UPDATE user SET password_hash = ? WHERE id = ?', [passwordHash, id])
    return result.affectedRows
  }
}

module.exports = new UserDao()
