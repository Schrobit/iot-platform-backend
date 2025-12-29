const express = require('express')
const router = express.Router()
const systemController = require('../../controllers/system.controller')

/**
 * @swagger
 * tags:
 *   name: System
 *   description: System Maintenance
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: System status
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         service:
 *                           type: string
 *                           example: up
 *                         mysql:
 *                           type: string
 *                           example: up
 *                         influxdb:
 *                           type: string
 *                           example: up
 *                         rabbitmq:
 *                           type: string
 *                           example: up
 */
router.get('/', systemController.health)

module.exports = router
