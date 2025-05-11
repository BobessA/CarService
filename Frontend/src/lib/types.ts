import { Product } from '../models/Product';
import { OrderItem } from '../models/OrderItem'

export type OrderItemsByOrderId = Record<number, Array<OrderItem & { product?: Product }>>;