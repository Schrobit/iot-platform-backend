const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const routes = require('./routes')
const errorHandler = require('./middlewares/error')
const { connectRabbitMQ, startUplinkConsumer } = require('./config/rabbitmq')
const swaggerUi = require('swagger-ui-express')
const swaggerSpecs = require('./config/swagger')
const telemetryService = require('./services/telemetry.service')

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs))
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpecs)
})

// Connect to RabbitMQ and start uplink consumer
connectRabbitMQ().then((channel) => {
  if (channel) {
    startUplinkConsumer((message) => telemetryService.handleUplinkMessage(message))
  }
})

// Routes
app.use('/', routes)

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    code: 40400,
    message: 'Resource Not Found',
    data: null
  })
})

// Global Error Handler
app.use(errorHandler)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})

module.exports = app
