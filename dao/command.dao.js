const db = require('../config/mysql')

class CommandDao {
  async create(data) {
    const { device_id, issued_by, command_name, payload } = data
    const [result] = await db.query(
      'INSERT INTO command_log (device_id, issued_by, command_name, payload) VALUES (?, ?, ?, ?)',
      [device_id, issued_by, command_name, JSON.stringify(payload)]
    )
    return result.insertId
  }

  async findAll({ page, pageSize, device_id, issued_by, from, to }) {
    let sql = 'SELECT * FROM command_log WHERE 1=1'
    const params = []

    if (device_id) {
      sql += ' AND device_id = ?'
      params.push(device_id)
    }
    if (issued_by) {
      sql += ' AND issued_by = ?'
      params.push(issued_by)
    }
    if (from) {
      sql += ' AND created_at >= ?'
      params.push(new Date(from))
    }
    if (to) {
      sql += ' AND created_at <= ?'
      params.push(new Date(to))
    }

    // Sort by latest first
    sql += ' ORDER BY created_at DESC'

    const [countRows] = await db.query(sql.replace('SELECT *', 'SELECT COUNT(*) as total').replace(' ORDER BY created_at DESC', ''), params)
    const total = countRows[0].total

    sql += ' LIMIT ? OFFSET ?'
    params.push(parseInt(pageSize), (page - 1) * pageSize)

    const [rows] = await db.query(sql, params)
    return { items: rows, total }
  }

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM command_log WHERE id = ?', [id])
    return rows[0]
  }
}

module.exports = new CommandDao()
