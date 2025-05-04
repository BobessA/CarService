export type ProductData = {
    productId: string;
    productType: string;
    name: string;
    brand: string | null;
    purchasePrice: number | null;
    sellingPrice: number;
    stockQuantity: number | null;
    description: string | null;
  }