const db = require('../config/mysql')

class CleanroomDao {
  async create(data) {
    const { name, meta, is_active } = data
    const [result] = await db.query(
      'INSERT INTO cleanroom (name, meta, is_active) VALUES (?, ?, ?)',
      [name, JSON.stringify(meta), is_active !== undefined ? is_active : 1]
    )
    return result.insertId
  }

  async findAll({ page, pageSize, keyword }) {
    let sql = 'SELECT * FROM cleanroom WHERE 1=1'
    const params = []

    if (keyword) {
      sql += ' AND name LIKE ?'
      params.push(`%${keyword}%`)
    }

    const [countRows] = await db.query(sql.replace('SELECT *', 'SELECT COUNT(*) as total'), params)
    const total = countRows[0].total

    sql += ' LIMIT ? OFFSET ?'
    params.push(parseInt(pageSize), (page - 1) * pageSize)

    const [rows] = await db.query(sql, params)
    return { items: rows, total }
  }

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM cleanroom WHERE id = ?', [id])
    return rows[0]
  }

  async update(id, data) {
    const fields = []
    const params = []

    if (data.name) {
      fields.push('name = ?')
      params.push(data.name)
    }
    if (data.meta) {
      fields.push('meta = ?')
      params.push(JSON.stringify(data.meta))
    }
    if (data.is_active !== undefined) {
      fields.push('is_active = ?')
      params.push(data.is_active)
    }

    if (fields.length === 0) return 0

    const sql = `UPDATE cleanroom SET ${fields.join(', ')} WHERE id = ?`
    params.push(id)

    const [result] = await db.query(sql, params)
    return result.affectedRows
  }

  async delete(id) {
    // Soft delete usually, but doc says DELETE method. Doc also suggests soft delete.
    // I'll stick to physical delete if requested, but doc says "建议后端做“软删除/禁用”".
    // Let's implement physical delete for now as per HTTP DELETE semantics, or update is_active=0 if logic requires.
    // But typically DELETE /api/v1/cleanrooms/{id} maps to a delete action.
    // If I want to follow "suggestion", I should do update is_active=0.
    // However, the `is_active` field exists.
    // Let's do soft delete for safety as suggested.
    const [result] = await db.query('UPDATE cleanroom SET is_active = 0 WHERE id = ?', [id])
    return result.affectedRows
  }
}

module.exports = new CleanroomDao()
