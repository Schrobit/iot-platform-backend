const express = require('express')
const router = express.Router()

const authRoutes = require('./auth')
const userRoutes = require('./users')
const cleanroomRoutes = require('./cleanrooms')
const gatewayRoutes = require('./gateways')
const deviceRoutes = require('./devices')
const commandRoutes = require('./commands')
const systemRoutes = require('./system')

// Mount routes
router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/cleanrooms', cleanroomRoutes)
router.use('/gateways', gatewayRoutes)
router.use('/devices', deviceRoutes)
router.use('/commands', commandRoutes)
router.use('/health', systemRoutes)

module.exports = router
