const express = require('express')
const router = express.Router()
const gatewayController = require('../../controllers/gateway.controller')
const auth = require('../../middlewares/auth')
const { adminOnly } = require('../../middlewares/permission')

/**
 * @swagger
 * tags:
 *   name: Gateways
 *   description: Gateway Management
 */

router.use(auth)

/**
 * @swagger
 * /gateways:
 *   post:
 *     summary: Create Gateway (Admin Only)
 *     tags: [Gateways]
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
 *               sn:
 *                 type: string
 *               meta:
 *                 type: object
 *               is_active:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Gateway created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Gateway'
 */
router.post('/', adminOnly, gatewayController.create)

/**
 * @swagger
 * /gateways:
 *   get:
 *     summary: List Gateways
 *     tags: [Gateways]
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
 *         description: Gateway list
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
 *                             $ref: '#/components/schemas/Gateway'
 *                         total:
 *                           type: integer
 */
router.get('/', gatewayController.list)

/**
 * @swagger
 * /gateways/{id}:
 *   get:
 *     summary: Get Gateway Detail
 *     tags: [Gateways]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gateway detail
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Gateway'
 */
router.get('/:id', gatewayController.detail)

/**
 * @swagger
 * /gateways/{id}:
 *   patch:
 *     summary: Update Gateway (Admin Only)
 *     tags: [Gateways]
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
 *               meta:
 *                 type: object
 *               is_active:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Gateway updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.patch('/:id', adminOnly, gatewayController.update)

/**
 * @swagger
 * /gateways/{id}:
 *   delete:
 *     summary: Delete Gateway (Admin Only)
 *     tags: [Gateways]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gateway deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.delete('/:id', adminOnly, gatewayController.delete)

/**
 * @swagger
 * /gateways/{id}/cleanrooms:
 *   post:
 *     summary: Add Cleanroom to Gateway (Admin Only)
 *     tags: [Gateways]
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
 *               - cleanroom_id
 *             properties:
 *               cleanroom_id:
 *                 type: integer
 *               meta:
 *                 type: object
 *     responses:
 *       200:
 *         description: Cleanroom added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/:id/cleanrooms', adminOnly, gatewayController.addCleanroom)

/**
 * @swagger
 * /gateways/{id}/cleanrooms/{cleanroom_id}:
 *   delete:
 *     summary: Remove Cleanroom from Gateway (Admin Only)
 *     tags: [Gateways]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: cleanroom_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cleanroom removed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.delete('/:id/cleanrooms/:cleanroom_id', adminOnly, gatewayController.removeCleanroom)

/**
 * @swagger
 * /gateways/{id}/cleanrooms:
 *   get:
 *     summary: List Cleanrooms for Gateway
 *     tags: [Gateways]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of cleanrooms
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
 *                         $ref: '#/components/schemas/Cleanroom'
 */
router.get('/:id/cleanrooms', gatewayController.listCleanrooms)

module.exports = router
