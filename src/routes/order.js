import express from 'express';
import logger from '../middlewares/logger.js';
import Order from '../models/order.js';
import { addProductToOrder, removeProductFromOrder } from '../handler/product.js';
import { checkValidObjectId } from '../middlewares/validObjectId.js';
import { isValidPrice } from '../middlewares/validPrice.js';

const router = express.Router();

router.use(logger);

router.get('/', async (req, res) => {
    try {
      const orders = await Order.find();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur', error });
    }
  });

router.get('/:id', checkValidObjectId, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvé' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

router.post('/', isValidPrice, async (req, res) => {
    const { date, status, totalAmount, items } = req.body;
    if (!date || !status || !totalAmount || !items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'La date, le statut, le montant total et la liste des produits sont requis' });
    }

    try {
        await addProductToOrder(items);
        const newOrder = new Order({ date, status, totalAmount, items });
        await newOrder.save();
        res.status(201).json({ message: 'Commande créée', order: newOrder });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création de la commande', error: error.message });
    }
});

router.put('/:id', checkValidObjectId, isValidPrice, async (req, res) => {
    const { date, status, totalAmount, items } = req.body;
    if (!date || !status || !totalAmount || !items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'La date, le status, le montant total et la liste des produits sont requis' });
    }

    try {
        await removeProductFromOrder(req.params.id);
        await addProductToOrder(items);
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { date, status, totalAmount, items },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvé' });
        }
        
        res.status(200).json({ message: 'Commande modifié', order: order });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la modification de la commande', error: error.message  });
    }
});

router.delete('/:id', checkValidObjectId, async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvé' });
        }
        res.json({ message: 'Commande supprimé', customer: customer });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

export default router;