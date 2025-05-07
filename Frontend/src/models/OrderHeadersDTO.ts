export type OrderHeadersDTO = {
    id: number;
    customerId: string;
    vehicleId: number;
    orderNumber: string;
    offerId: number;
    agentId: string;
    mechanicId: string;
    statusId: number;
    comment: string;
    netAmount: number;
    grossAmount: number;
    orderDate: string;
    statusName: string;
  }