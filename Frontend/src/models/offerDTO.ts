export type OfferDTO = {
    id: number;
    offerNumber: string;
    customerId: string;
    vehicleId: number;
    requestDate: string;
    issueDescription: string;
    statusId: number;
    agentId: string | null;
    appointmentDate: string | null;
    adminComment: string | null;
    statusName: string;
    imagePaths?: string[];
  }