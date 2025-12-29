const express = require('express')
const router = express.Router()
const commandController = require('../../controllers/command.controller')
const auth = require('../../middlewares/auth')

/**
 * @swagger
 * tags:
 *   name: Commands
 *   description: Command History
 */

router.use(auth)

/**
 * @swagger
 * /commands:
 *   get:
 *     summary: List Command History
 *     tags: [Commands]
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
 *         name: device_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: issued_by
 *         schema:
 *           type: integer
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Command list
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
 *                             $ref: '#/components/schemas/CommandLog'
 *                         total:
 *                           type: integer
 */
router.get('/', commandController.list)

/**
 * @swagger
 * /commands/{id}:
 *   get:
 *     summary: Get Command Detail
 *     tags: [Commands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Command detail
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CommandLog'
 */
router.get('/:id', commandController.detail)

module.exports = router
