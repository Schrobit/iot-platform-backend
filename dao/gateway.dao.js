const db = require('../config/mysql')

class GatewayDao {
  async create(data) {
    const { name, sn, meta, is_active } = data
    const [result] = await db.query(
      'INSERT INTO gateway (name, sn, meta, is_active) VALUES (?, ?, ?, ?)',
      [name, sn, JSON.stringify(meta), is_active !== undefined ? is_active : 1]
    )
    return result.insertId
  }

  async findAll({ page, pageSize, keyword }) {
    let sql = 'SELECT * FROM gateway WHERE 1=1'
    const params = []

    if (keyword) {
      sql += ' AND (name LIKE ? OR sn LIKE ?)'
      params.push(`%${keyword}%`, `%${keyword}%`)
    }

    const [countRows] = await db.query(sql.replace('SELECT *', 'SELECT COUNT(*) as total'), params)
    const total = countRows[0].total

    sql += ' LIMIT ? OFFSET ?'
    params.push(parseInt(pageSize), (page - 1) * pageSize)

    const [rows] = await db.query(sql, params)
    return { items: rows, total }
  }

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM gateway WHERE id = ?', [id])
    return rows[0]
  }

  async update(id, data) {
    const fields = []
    const params = []

    if (data.name) {
      fields.push('name = ?')
      params.push(data.name)
    }
    if (data.sn) {
      fields.push('sn = ?')
      params.push(data.sn)
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

    const sql = `UPDATE gateway SET ${fields.join(', ')} WHERE id = ?`
    params.push(id)

    const [result] = await db.query(sql, params)
    return result.affectedRows
  }

  async delete(id) {
    const [result] = await db.query('UPDATE gateway SET is_active = 0 WHERE id = ?', [id])
    return result.affectedRows
  }

  // Relations
  async addCleanroom(gatewayId, cleanroomId, meta) {
    const [result] = await db.query(
      'INSERT INTO gateway_cleanroom (gateway_id, cleanroom_id, meta) VALUES (?, ?, ?)',
      [gatewayId, cleanroomId, JSON.stringify(meta)]
    )
    return result.insertId
  }

  async removeCleanroom(gatewayId, cleanroomId) {
    const [result] = await db.query(
      'DELETE FROM gateway_cleanroom WHERE gateway_id = ? AND cleanroom_id = ?',
      [gatewayId, cleanroomId]
    )
    return result.affectedRows
  }

  async findCleanroomsByGateway(gatewayId) {
    const sql = `
      SELECT c.*, gc.meta as relation_meta
      FROM cleanroom c
      JOIN gateway_cleanroom gc ON c.id = gc.cleanroom_id
      WHERE gc.gateway_id = ?
    `
    const [rows] = await db.query(sql, [gatewayId])
    return rows
  }

  async findGatewaysByCleanroom(cleanroomId) {
    const sql = `
      SELECT g.*, gc.meta as relation_meta
      FROM gateway g
      JOIN gateway_cleanroom gc ON g.id = gc.gateway_id
      WHERE gc.cleanroom_id = ?
    `
    const [rows] = await db.query(sql, [cleanroomId])
    return rows
  }
}

module.exports = new GatewayDao()
