import OrderModel from '../models/order.js';
import { NotFound } from '../globals/errors.js';
import { sendToQueue } from '../configurations/rabbitmq.js';

export default class OrderService {
    constructor () {
        if (OrderService.instance instanceof OrderService) {
            return OrderService.instance;
        }

        OrderService.instance = this;
    }

    /**
     * Get all orders from db and send message to RabbitMQ.
     */
    async getAll () {
        const orders = await OrderModel.find();
        if (orders.length === 0) {
            throw new NotFound('Aucune commande trouvée.');
        }

        // Envoyer un message à RabbitMQ après avoir récupéré les commandes
        const message = JSON.stringify({ action: 'getAll', orders });
        await sendToQueue('orderQueue', message);

        return orders;
    }

    /**
     * Get an order by its id and send message to RabbitMQ.
     * 
     * @param {ObjectId} orderId
     */
    async get ({ orderId }) {
        const order = await OrderModel.findById(orderId);
        if (!order) {
            throw new NotFound('Commande introuvable.');
        }

        // Envoyer un message à RabbitMQ après avoir récupéré la commande
        const message = JSON.stringify({ action: 'get', orderId, order });
        await sendToQueue('orderQueue', message);

        return order;
    }

    /**
     * Create an order
     * 
     * @param {Object} fields
     */
    async create ({ fields }) {
        const order = new OrderModel(fields);
        await order.save();

        // Envoyer un message à RabbitMQ après la création de la commande
        const message = JSON.stringify({ action: 'create', orderId: order._id, fields });
        await sendToQueue('orderQueue', message);

        return order;
    }

    /**
     * Update an order
     * 
     * @param {ObjectId} orderId
     * @param {Object} fields
     */
    async update ({ orderId, fields }) {
        const order = await OrderModel.findByIdAndUpdate(orderId, fields, { new: true });
        if (!order) {
            throw new NotFound('Commande introuvable.');
        }

        // Envoyer un message à RabbitMQ après la mise à jour de la commande
        const message = JSON.stringify({ action: 'update', orderId, fields });
        await sendToQueue('orderQueue', message);

        return order;
    }

    /**
     * Delete an order
     * 
     * @param {ObjectId} orderId
     */
    async remove ({ orderId }) {
        const order = await OrderModel.findByIdAndDelete(orderId);
        if (!order) {
            throw new NotFound('Commande introuvable.');
        }

        // Envoyer un message à RabbitMQ après la suppression de la commande
        const message = JSON.stringify({ action: 'delete', orderId });
        await sendToQueue('orderQueue', message);
    }
}
