import apiClient from "./apiClient";
import { Product } from '../models/Product';

export const createProductLoader = (userId: string) => async (inputValue: string) => {
  if (!inputValue) return [];

  try {
    const response = await apiClient.get<Product[]>(
      `/Products?name=${encodeURIComponent(inputValue)}`,
      userId
    );
    return response.map(product => ({
      value: product.productId,
      label: `${product.name} (${product.brand}) - ${product.sellingPrice} Ft`,
      sellingPrice: product.sellingPrice,
    }));
  } catch (error) {
    console.error('Failed to load products:', error);
    return [];
  }
};