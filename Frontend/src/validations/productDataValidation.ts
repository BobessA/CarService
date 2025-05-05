import { ProductData } from "../models/ProductData";

export const validateProductData = (product: ProductData) => {
  const errors: { [key: string]: string } = {};

  if (!product.productId.trim()) {
    errors.productId = "Cikkszám nélkül nem rögzíthető!";
  }

  if (!product.name.trim()) {
    errors.name = "Üres névvel nem rögzíthető!";
  }

  if (!product.productType.trim()) {
    errors.productType = "A termék típusát kötelező beállítani!";
  }

  if (!product.sellingPrice) {
    errors.sellingPrice = "Az eladási ár megadása kötelező!";
  }

  if (product.sellingPrice < 0.0) {
    errors.sellingPrice = "Az eladási ár nem lehet negatív!";
  }

  if ((product.purchasePrice ?? 0) < 0) {
    errors.purchasePrice = "A beszerzési ár nem lehet negatív!";
  }

  return errors;

};