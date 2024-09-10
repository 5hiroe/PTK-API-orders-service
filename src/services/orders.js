import OrderModel from '../models/order.js'
import { NotFound } from '../globals/errors.js'

export default class OrderService {
    constructor () {
        if (OrderService.instance instanceof OrderService) {
            return OrderService.instance
        }
        Object.freeze(this)
        OrderService.instance = this
    }

    /**
     * Get all orders from db.
     */
    async getAll () {
        const orders = await OrderModel.find()
        return orders
    }

    /**
     * Get a order by his id
     * 
     * @param {ObjectId} orderId
     */
    async get ({ orderId }) {
        const order = await OrderModel.findById(orderId)
        return order
    }

    /**
     * Create a custommer
     * 
     * @param {Object} fields
     */
    async create ({ fields }) {
        const order = new OrderModel(fields)
        await order.save()
        return order
    }

    /**
     * Update a order
     * 
     * @param {ObjectId} orderId
     * @param {Object} fields
     */
    async update ({ orderId, fields }) {
        const order = await OrderModel.findByIdAndUpdate(orderId, fields, { new: true })
        if (!order) {
            throw new NotFound('Order introuvable.')
        }
        return order
    }

    /**
     * Delete a order
     * 
     * @param {ObjectId} orderId
     */
    async remove ({ orderId }) {
        const order = await OrderModel.findByIdAndDelete(orderId)
        if (!order) {
            throw new NotFound('Order introuvable.')
        }
    }
}