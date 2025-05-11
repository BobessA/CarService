
export type OrderPdfData = {
    id: number;
    customerId: string;
    vehicleId: number;
    orderNumber: string;
    offerId: number;
    agentId: string;
    mechanicId: string;
    comment: string;
    netAmount: number;
    grossAmount: number;
    orderDate: string;
    statusName: string;
    offerNumber: string;
    offerIssueDescription: string;
    items: {
      id: number;
      productId: string;
      quantity: number;
      unitPrice: number;
      netAmount: number;
      grossAmount: number;
      comment: string;
    }[];
    vehicle: {
      ownerId: string;
      licensePlate: string;
      brand: string;
      model: string;
      yearOfManufacture: number;
      vin: string;
      engineCode: string;
      odometer: number;
      fuelType: number;
    };
  }