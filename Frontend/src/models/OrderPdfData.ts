
export type OrderPdfData = {
    id: number;
    customerId: string;
    vehicleId: number;
    orderNumber: string;
    offerId: number;
    comment: string;
    netAmount: number;
    grossAmount: number;
    orderDate: string;
    statusName: string;
    relatedOffer: {
      offerNumber: string;
      comment: string;
    };
    items: {
      orderId: number;
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
    customer: {
      name: string;
      phoneNumber: string;
      email: string;
      discount: number;
    };
    administrator: {
      name: string;
      phoneNumber: string;
      email: string;
    };
    mechanicer: {
      name: string;
    };
  }