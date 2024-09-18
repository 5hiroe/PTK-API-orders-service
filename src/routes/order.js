import express from 'express'
import * as orders from '../controllers/orders.js'

const router = express.Router()

router.get('/', orders.getAllOrders)
router.get('/:orderId', orders.getOrder)
router.post('/', orders.createOrder)
router.put('/:orderId', orders.updateOrder)
router.delete('/:orderId', orders.removeOrder)

export default router