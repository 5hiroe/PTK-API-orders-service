import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const orderUrl = process.env.API_ORDER_URL;

export async function getOrderProducts(id) {
  try {
    const response = await axios.get(`${orderUrl}/products/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data.items;
  } catch (error) {
    console.error("Erreur à la récupération des produits", error);
    throw error;
  }
}