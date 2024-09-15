import Joi from 'joi'

export const order = Joi.object({
    date: Joi.date().required(),
    status: Joi.string().max(100).required(),
    totalAmount: Joi.number().required(),
    items: Joi.array().items(Joi.object({
        product_id: Joi.string().max(100).required(),
        quantity: Joi.number().required(),
    })).required()
})