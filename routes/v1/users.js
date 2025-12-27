const express = require('express')
const router = express.Router()
const userController = require('../../controllers/user.controller')
const auth = require('../../middlewares/auth')
const { adminOnly } = require('../../middlewares/permission')

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User Management
 */

router.use(auth) // All routes require login

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create User (Admin Only)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, staff]
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 */
router.post('/', adminOnly, userController.create)

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List Users (Admin Only)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User list
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
 *                             $ref: '#/components/schemas/User'
 *                         total:
 *                           type: integer
 */
router.get('/', adminOnly, userController.list)

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update User (Admin Only)
 *     tags: [Users]
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
 *               role:
 *                 type: string
 *               email:
 *                 type: string
 *               is_active:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.patch('/:id', adminOnly, userController.update)

/**
 * @swagger
 * /users/{id}/reset-password:
 *   post:
 *     summary: Reset User Password (Admin Only)
 *     tags: [Users]
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
 *               - new_password
 *             properties:
 *               new_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/:id/reset-password', adminOnly, userController.resetPassword)

module.exports = router
