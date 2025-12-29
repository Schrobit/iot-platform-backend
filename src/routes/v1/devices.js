const express = require('express')
const router = express.Router()
const deviceController = require('../../controllers/device.controller')
const telemetryController = require('../../controllers/telemetry.controller')
const commandController = require('../../controllers/command.controller')
const auth = require('../../middlewares/auth')
const { adminOnly } = require('../../middlewares/permission')

/**
 * @swagger
 * tags:
 *   name: Devices
 *   description: Device Management
 */

router.use(auth)

/**
 * @swagger
 * /devices:
 *   post:
 *     summary: Create Device (Admin Only)
 *     tags: [Devices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               sn:
 *                 type: string
 *               type:
 *                 type: string
 *               gateway_id:
 *                 type: integer
 *               cleanroom_id:
 *                 type: integer
 *               unit:
 *                 type: string
 *               meta:
 *                 type: object
 *               is_active:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Device created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Device'
 */
router.post('/', adminOnly, deviceController.create)

/**
 * @swagger
 * /devices:
 *   get:
 *     summary: List Devices
 *     tags: [Devices]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: gateway_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: cleanroom_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Device list
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
 *                         items:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Device'
 *                         total:
 *                           type: integer
 */
router.get('/', deviceController.list)

/**
 * @swagger
 * /devices/{id}:
 *   get:
 *     summary: Get Device Detail
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Device detail
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Device'
 */
router.get('/:id', deviceController.detail)

/**
 * @swagger
 * /devices/{id}:
 *   patch:
 *     summary: Update Device (Admin Only)
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               sn:
 *                 type: string
 *               type:
 *                 type: string
 *               gateway_id:
 *                 type: integer
 *               cleanroom_id:
 *                 type: integer
 *               unit:
 *                 type: string
 *               meta:
 *                 type: object
 *               is_active:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Device updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.patch('/:id', adminOnly, deviceController.update)

/**
 * @swagger
 * /devices/{id}:
 *   delete:
 *     summary: Delete Device (Admin Only)
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Device deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.delete('/:id', adminOnly, deviceController.delete)

/**
 * @swagger
 * /devices/{id}/commands:
 *   post:
 *     summary: Send Command to Device (Admin Only)
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - command_name
 *             properties:
 *               command_name:
 *                 type: string
 *               payload:
 *                 type: object
 *     responses:
 *       200:
 *         description: Command sent
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
 *                         command_id:
 *                           type: integer
 *                         device_id:
 *                           type: integer
 *                         enqueued_at:
 *                           type: string
 */
router.post('/:id/commands', adminOnly, commandController.sendCommand)

/**
 * @swagger
 * /devices/{id}/telemetry/latest:
 *   get:
 *     summary: Get Latest Telemetry for Device
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Latest telemetry
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Telemetry'
 */
router.get('/:id/telemetry/latest', telemetryController.getDeviceLatest)

/**
 * @swagger
 * /devices/{id}/telemetry:
 *   get:
 *     summary: Get Telemetry History for Device
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: agg
 *         schema:
 *           type: string
 *           enum: [raw, mean, min, max, last]
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Telemetry history
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
 *                         device_id:
 *                           type: integer
 *                         points:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               ts:
 *                                 type: string
 *                               value:
 *                                 type: number
 */
router.get('/:id/telemetry', telemetryController.getDeviceHistory)

module.exports = router
