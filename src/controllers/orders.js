import OrderService from '../services/orders.js'
import OrderValidator from '../validators/order.js'
const OrderServiceInstance = new OrderService()
const OrderValidatorInstance = new OrderValidator()

export async function getAllOrders (req, res) {
    const orders = await OrderServiceInstance.getAll()
    return res.status(200).json({ orders })
}

export async function getOrder (req, res) {
    const { params } = req
    OrderValidatorInstance.validate(params, OrderValidatorInstance.getOrder)
    const { orderId } = req.params
    const order = await OrderServiceInstance.get({ orderId })
    return res.status(200).json({ order })
}

export async function createOrder (req, res) {
    const { body } = req
    OrderValidatorInstance.validate(body, OrderValidatorInstance.createOrder)
    const { fields } = req.body
    const order = await OrderServiceInstance.create({ fields })
    return res.status(200).json({ order })
}

export async function updateOrder (req, res) {
    const { body, params } = req
    OrderValidatorInstance.validate(body, OrderValidatorInstance.updateOrder)
    OrderValidatorInstance.validate(params, OrderValidatorInstance.updateOrderId)
    const { orderId } = req.params
    const { fields } = req.body
    const order = await OrderServiceInstance.update({ orderId, fields })
    return res.status(200).json({ order })
}

export async function removeOrder (req, res) {
    const { params } = req
    OrderValidatorInstance.validate(params, OrderValidatorInstance.removeOrder)
    const { orderId } = req.params
    await OrderServiceInstance.remove({ orderId })
    return res.status(200).json({ message: 'Order supprimé.' })
}