import { getProductInfo, updateProductQuantity } from '../services/product.js';
import { getOrderProducts } from '../services/order.js';

export async function addProductToOrder(items) {
  for (const item of items) {
    const { product_id, quantity } = item;
    
    try {
      const product = await getProductInfo(product_id);

      if (product.stock_quantity < quantity) {
        throw new Error(`Stock insuffisant pour le produit avec ID ${product_id}`);
      }

      const newQuantity = product.stock_quantity - quantity;
      await updateProductQuantity(product_id, product.name, product.description, product.price, String(newQuantity));
    } catch (error) {
      throw new Error(`Erreur pour le produit avec ID ${product_id}: ${error.message}`);
    }
  }

  return true;
}

export async function removeProductFromOrder(orderId) {
  const items = await getOrderProducts(orderId);
  for (const item of items) {
    const { product_id, quantity } = item;
    
    try {
      const product = await getProductInfo(product_id);

      const newQuantity = product.stock_quantity + quantity;
      await updateProductQuantity(product_id, product.name, product.description, product.price, String(newQuantity));
    } catch (error) {
      throw new Error(`Erreur pour le produit avec ID ${product_id}: ${error.message}`);
    }
  }

  return true;
}