import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const productUrl = process.env.API_PRODUCT_URL;

export async function getProductInfo(id, name, description, price, stock_quantity) {
  try {
    const response = await axios.get(`${productUrl}/products/${id}`, {
      headers: {
        "Content-Type": "application/json",
      }
    });
    return response.data;
  } catch (error) {
    console.error("Erreur dans la mise a jour de la quantité produit", error);
    throw error;
  }
}

export async function updateProductQuantity(id, name, description, price, stock_quantity) {
  try {
    const data = { 
      name: name, 
      description: description, 
      price: price, 
      stock_quantity: stock_quantity 
    };

    await axios.put(`${productUrl}/products/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Erreur dans la mise a jour de la quantité produit", error);
    throw error;
  }
}