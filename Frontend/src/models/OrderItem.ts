export type OrderItem = {
  id: number;
  orderId: number;
  productId: string;
  quantity: number;
  unitPrice: number;
  netAmount: number;
  grossAmount: number;
  comment?: string;
};