import { generateOrderPdf } from '../utils/pdfUtils';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import apiClient from '../utils/apiClient';
import User from '../models/User';
import { ProductData } from '../models/ProductData';
import { OrderPdfData } from "../models/OrderPdfData";

pdfMake.vfs = (pdfFonts as any).pdfMake?.vfs ?? (pdfFonts as any).vfs;

export async function generateAndOpenOrderPdf(orderId: number, userId: string) {
  const defaultUser: User = {
    userId: '',
    name: '',
    roleId: 3,
    phone: '',
    email: '',
    discount: 0,
  };

  if (!userId) return;

  const [orderRes, usersRes, productsRes] = await Promise.all([
    apiClient.get<OrderPdfData>(`/OrdersHeader/FullOrder/${orderId}`, userId),
    apiClient.get<User[]>("/Users", userId),
    apiClient.get<ProductData[]>("/Products", userId),
  ]);

  const customer = usersRes.find(u => u.userId === orderRes.customerId) ?? defaultUser;
  const administrator = usersRes.find(u => u.userId === orderRes.agentId) ?? defaultUser;
  const mechanicer = usersRes.find(u => u.userId === orderRes.mechanicId) ?? defaultUser;
  const usedProducts = productsRes.filter(p => orderRes.items.some(i => i.productId === p.productId));

  const docDefinition = generateOrderPdf(orderRes, customer, administrator, mechanicer, usedProducts);

  pdfMake.createPdf(docDefinition).open();
}
