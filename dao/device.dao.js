const db = require('../config/mysql')

class DeviceDao {
  async create(data) {
    const { name, sn, type, gateway_id, cleanroom_id, unit, meta, is_active } = data
    const [result] = await db.query(
      `INSERT INTO device 
       (name, sn, type, gateway_id, cleanroom_id, unit, meta, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, sn, type, gateway_id, cleanroom_id, unit, JSON.stringify(meta), is_active !== undefined ? is_active : 1]
    )
    return result.insertId
  }

  async findAll({ page, pageSize, type, gateway_id, cleanroom_id, keyword }) {
    let sql = 'SELECT * FROM device WHERE 1=1'
    const params = []

    if (type) {
      sql += ' AND type = ?'
      params.push(type)
    }
    if (gateway_id) {
      sql += ' AND gateway_id = ?'
      params.push(gateway_id)
    }
    if (cleanroom_id) {
      sql += ' AND cleanroom_id = ?'
      params.push(cleanroom_id)
    }
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
    const [rows] = await db.query('SELECT * FROM device WHERE id = ?', [id])
    return rows[0]
  }

  async findByCleanroomId(cleanroomId) {
      const [rows] = await db.query('SELECT * FROM device WHERE cleanroom_id = ?', [cleanroomId])
      return rows
  }

  async update(id, data) {
    const fields = []
    const params = []

    const validFields = ['name', 'sn', 'type', 'gateway_id', 'cleanroom_id', 'unit', 'is_active']
    validFields.forEach(field => {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`)
        params.push(data[field])
      }
    })

    if (data.meta) {
      fields.push('meta = ?')
      params.push(JSON.stringify(data.meta))
    }

    if (fields.length === 0) return 0

    const sql = `UPDATE device SET ${fields.join(', ')} WHERE id = ?`
    params.push(id)

    const [result] = await db.query(sql, params)
    return result.affectedRows
  }

  async delete(id) {
    const [result] = await db.query('UPDATE device SET is_active = 0 WHERE id = ?', [id])
    return result.affectedRows
  }
}

module.exports = new DeviceDao()
