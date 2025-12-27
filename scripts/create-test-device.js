require('dotenv').config()
const http = require('http')
const https = require('https')

/**
 * 通过 REST API 创建一个用于模拟温度传感器的测试设备
 * 开发环境下建议配合 AUTH_DEV_BYPASS=true 使用，免 Token 访问
 */
async function requestJson(method, url, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data || {})
    const u = new URL(url)
    const isHttps = u.protocol === 'https:'
    const lib = isHttps ? https : http

    const options = {
      method,
      hostname: u.hostname,
      port: u.port || (isHttps ? 443 : 80),
      path: u.pathname + u.search,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...headers
      }
    }

    const req = lib.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => {
        body += chunk
      })
      res.on('end', () => {
        resolve({ status: res.statusCode, body })
      })
    })

    req.on('error', (err) => reject(err))
    req.write(payload)
    req.end()
  })
}

async function main() {
  try {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000/api/v1'
    const apiUrl = baseUrl.replace(/\/$/, '') + '/devices'

    const devicePayload = {
      name: 'CR01-TEMP-API-01',
      sn: 'TEMP-API-TEST-0001',
      type: 'temperature',
      gateway_id: null,
      cleanroom_id: null,
      unit: '°C',
      meta: { point_code: 'CR01-TEMP-API-01', range: '20-26' },
      is_active: 1
    }

    const headers = {}
    if (process.env.API_TOKEN) {
      headers.Authorization = `Bearer ${process.env.API_TOKEN}`
    }

    const { status, body } = await requestJson('POST', apiUrl, devicePayload, headers)

    let json
    try {
      json = JSON.parse(body)
    } catch (e) {
      console.error('Create device response is not valid JSON, status=', status)
      console.error('Raw body:', body)
      process.exit(1)
    }

    console.log('Status:', status)
    console.log('Response:', JSON.stringify(json, null, 2))

    if (status >= 200 && status < 300 && json && json.data && json.data.id) {
      console.log('Created device id:', json.data.id)
      process.exit(0)
    } else {
      console.error('Create device failed')
      process.exit(1)
    }
  } catch (err) {
    console.error('Create test device error:', err)
    process.exit(1)
  }
}

main()
