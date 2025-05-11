export type SupplierOrderItem = {
  id: number;
  productId: string;
  agentId: string | null;
  agentName?: string | null;
  quantity: number;
  orderedDate: string;
  statusId: number;
}