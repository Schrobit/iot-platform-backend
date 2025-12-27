const express = require('express')
const router = express.Router()
const cleanroomController = require('../../controllers/cleanroom.controller')
const telemetryController = require('../../controllers/telemetry.controller')
const auth = require('../../middlewares/auth')
const { adminOnly } = require('../../middlewares/permission')

/**
 * @swagger
 * tags:
 *   name: Cleanrooms
 *   description: Cleanroom Management
 */

router.use(auth)

/**
 * @swagger
 * /cleanrooms:
 *   post:
 *     summary: Create Cleanroom (Admin Only)
 *     tags: [Cleanrooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               meta:
 *                 type: object
 *               is_active:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cleanroom created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Cleanroom'
 */
router.post('/', adminOnly, cleanroomController.create)

/**
 * @swagger
 * /cleanrooms:
 *   get:
 *     summary: List Cleanrooms
 *     tags: [Cleanrooms]
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
 *         name: keyword
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cleanroom list
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
 *                             $ref: '#/components/schemas/Cleanroom'
 *                         total:
 *                           type: integer
 */
router.get('/', cleanroomController.list)

/**
 * @swagger
 * /cleanrooms/{id}:
 *   get:
 *     summary: Get Cleanroom Detail
 *     tags: [Cleanrooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cleanroom detail
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Cleanroom'
 */
router.get('/:id', cleanroomController.detail)

/**
 * @swagger
 * /cleanrooms/{id}:
 *   patch:
 *     summary: Update Cleanroom (Admin Only)
 *     tags: [Cleanrooms]
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
 *               meta:
 *                 type: object
 *               is_active:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cleanroom updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.patch('/:id', adminOnly, cleanroomController.update)

/**
 * @swagger
 * /cleanrooms/{id}:
 *   delete:
 *     summary: Delete Cleanroom (Admin Only)
 *     tags: [Cleanrooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cleanroom deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.delete('/:id', adminOnly, cleanroomController.delete)

/**
 * @swagger
 * /cleanrooms/{id}/gateways:
 *   get:
 *     summary: List Available Gateways for Cleanroom
 *     tags: [Cleanrooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of gateways
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Gateway'
 */
router.get('/:id/gateways', cleanroomController.listGateways)

/**
 * @swagger
 * /cleanrooms/{id}/telemetry/latest:
 *   get:
 *     summary: Get Latest Telemetry for all devices in Cleanroom
 *     tags: [Cleanrooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Latest telemetry data
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           device_id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           type:
 *                             type: string
 *                           value:
 *                             type: number
 *                           unit:
 *                             type: string
 *                           ts:
 *                             type: string
 */
router.get('/:id/telemetry/latest', telemetryController.getCleanroomLatest)

module.exports = router
