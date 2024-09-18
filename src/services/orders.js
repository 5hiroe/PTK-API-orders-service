import OrderModel from '../models/order.js';
import { NotFound } from '../globals/errors.js';
import amqp from 'amqplib';

export default class OrderService {
    constructor () {
        if (OrderService.instance instanceof OrderService) {
            return OrderService.instance;
        }

        this.rabbitmqChannel = null; // Stocker le canal RabbitMQ ici
        this.initRabbitMQ(); // Initialiser RabbitMQ

        OrderService.instance = this;
    }

    // Fonction pour se connecter à RabbitMQ et créer un canal
    async initRabbitMQ() {
        try {
            const connection = await amqp.connect('amqp://localhost'); // Connexion à RabbitMQ
            this.rabbitmqChannel = await connection.createChannel(); // Création d'un canal
            console.log('Connected to RabbitMQ');
        } catch (error) {
            console.error('Error connecting to RabbitMQ:', error);
        }
    }

    // Fonction pour envoyer un message à une file RabbitMQ
    async sendToQueue(queue, message) {
        if (!this.rabbitmqChannel) {
            console.error('RabbitMQ channel is not available');
            return;
        }
        await this.rabbitmqChannel.assertQueue(queue, { durable: true });
        this.rabbitmqChannel.sendToQueue(queue, Buffer.from(message));
        console.log(`Message sent to ${queue}: ${message}`);
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
        await this.sendToQueue('orderQueue', message);

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
        await this.sendToQueue('orderQueue', message);

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
        await this.sendToQueue('orderQueue', message);

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
        await this.sendToQueue('orderQueue', message);

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
        await this.sendToQueue('orderQueue', message);
    }
}
