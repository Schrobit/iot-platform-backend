const swaggerJsdoc = require('swagger-jsdoc')
const path = require('path')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IoT Platform REST API',
      version: '1.0.0',
      description: 'API documentation for the IoT Platform Backend',
      contact: {
        name: 'Schrobit',
        email: 'admin@tjh666.cn'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'staff'] },
            email: { type: 'string' },
            is_active: { type: 'integer', enum: [0, 1] },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Cleanroom: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            meta: { type: 'object' },
            is_active: { type: 'integer', enum: [0, 1] },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Gateway: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            sn: { type: 'string' },
            meta: { type: 'object' },
            is_active: { type: 'integer', enum: [0, 1] },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Device: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            sn: { type: 'string' },
            type: { type: 'string' },
            gateway_id: { type: 'integer' },
            cleanroom_id: { type: 'integer' },
            unit: { type: 'string' },
            meta: { type: 'object' },
            is_active: { type: 'integer', enum: [0, 1] },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        CommandLog: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            device_id: { type: 'integer' },
            issued_by: { type: 'integer' },
            command_name: { type: 'string' },
            payload: { type: 'object' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Telemetry: {
          type: 'object',
          properties: {
            device_id: { type: 'string' },
            type: { type: 'string' },
            value: { type: 'number' },
            unit: { type: 'string' },
            ts: { type: 'string', format: 'date-time' }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            code: { type: 'integer', example: 0 },
            message: { type: 'string', example: 'ok' },
            data: { type: 'object' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [path.resolve(__dirname, '../routes/v1/*.js')]
}

const specs = swaggerJsdoc(options)
module.exports = specs
