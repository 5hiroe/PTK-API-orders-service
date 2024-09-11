import Validator from './validator.js'
import { order } from './model.js'
import Joi from 'joi'

export default class OrderValidator extends Validator {
    getOrder = Joi.object({
        orderId: Joi.string().max(100).required()
    })

    createOrder = Joi.object({
        fields: order.required()
    })

    updateOrder = Joi.object({
        fields: order.required()
    })

    updateOrderId = Joi.object({
        orderId: Joi.string().max(100).required()
    })

    removeOrder = Joi.object({
        orderId: Joi.string().max(100).required()
    })
}