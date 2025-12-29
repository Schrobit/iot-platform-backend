const { InfluxDB } = require('@influxdata/influxdb-client')
require('dotenv').config()

const url = process.env.INFLUX_URL || 'http://localhost:8086'
const token = process.env.INFLUX_TOKEN || 'my-token'
const org = process.env.INFLUX_ORG || 'my-org'
const bucket = process.env.INFLUX_BUCKET || 'my-bucket'

const client = new InfluxDB({ url, token })
const queryApi = client.getQueryApi(org)
const writeApi = client.getWriteApi(org, bucket)

module.exports = {
  client,
  queryApi,
  writeApi,
  org,
  bucket
}
