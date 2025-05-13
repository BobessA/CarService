import { useMemo, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { authGuard } from "../../../utils/authGuard";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
} from "@tanstack/react-table";
import { useAuth } from "../../../contexts/AuthContext";
import apiClient from "../../../utils/apiClient";

import { OrderTable } from "../../../components/orders/OrderTable";
import { AddItemModal } from "../../../components/orders/AddItemModal";
import { Pagination } from "../../../components/orders/Pagination";
import { AddOrderForm } from "../../../components/orders/AddOrderForm";
 
// Modellek/Típusok
import { OrderHeadersDTO } from "../../../models/OrderHeadersDTO";
import { OrderCreateDTO } from "../../../models/OrderCreateDTO";
import { OfferDTO } from "../../../models/offerDTO";
import { OrderItem } from "../../../models/OrderItem";
import { Product } from "../../../models/Product";
import { OrderItemsByOrderId } from "../../../lib/types";


function RouteComponent() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderHeadersDTO[]>([]);
  const [expandedOrderIds, setExpandedOrderIds] = useState<number[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<OfferDTO | null>(null);
  const [orderItemsByOrderId, setOrderItemsByOrderId] = useState<OrderItemsByOrderId>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [newOrderItem, setNewOrderItem] = useState<OrderItem>({
    id: 0,
    orderId: 0,
    productId: "0",
    quantity: 0,
    unitPrice: 0,
    netAmount: 0,
    grossAmount: 0,
    comment: "",
  });

  const handleSaveOrder = async (order: OrderCreateDTO) => {
  try {
    await apiClient.post("/OrdersHeader", order, user?.userId);

    const ordersResponse = await apiClient.get<OrderHeadersDTO[]>('/OrdersHeader', user?.userId);
    setOrders(ordersResponse);

    setIsAddOrderOpen(false);
  } catch (err) {
    console.error("Error adding order:", err);
    alert("Hiba történt a rendelés hozzáadásakor.");
  }
};

  const columns = useMemo<ColumnDef<OrderHeadersDTO>[]>(
    () => [
      { accessorKey: "orderNumber", header: "Rendelés azonosító" },
      { accessorKey: "customerId", header: "Ügyfél azonosító" },
      { accessorKey: "offerId", header: "offerId" },
      { accessorKey: "statusName", header:  "Státusz" },
      { accessorKey: "orderDate", header: "Rendelés dátuma" },


    ], []);

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 25 } },
  });

  useEffect(() => {
    if (!user?.userId) return;
    
    const fetchData = async () => {
      try {
        const [ordersResponse, productsResponse] = await Promise.all([
          apiClient.get<OrderHeadersDTO[]>('/OrdersHeader', user.userId),
          apiClient.get<Product[]>('/Products', user.userId)
        ]);
        setOrders(ordersResponse);
        setProducts(productsResponse);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

  fetchData();
}, [user?.userId]);

  const handleRowClick = async (orderId: number, offerId: number) => {
    if (expandedOrderIds.includes(orderId)) {
      setExpandedOrderIds(prev => prev.filter(id => id !== orderId));
      setSelectedOffer(null);
    } else {
      setExpandedOrderIds(prev => [...prev, orderId]);

      try {
        const [offerRes, itemsRes] = await Promise.all([
          apiClient.get<OfferDTO[]>(`/Offers?offerId=${offerId}`, user?.userId),
          apiClient.get<OrderItem[]>(`/OrderItems?orderId=${orderId}`, user?.userId)
        ]);

        setSelectedOffer(offerRes[0]);

        const enrichedItems = await Promise.all(itemsRes.map(async (item) => {
          const product = await apiClient.get<Product[]>(`/Products?productId=${item.productId}`, user?.userId);
          return {
            ...item,
            product: product[0],
          };
        }));

        setOrderItemsByOrderId(prev => ({
          ...prev,
          [orderId]: enrichedItems
        }));
      } catch (err) {
        console.error("Error fetching order details:", err);
      }
    }
  };

  const handleAddItemClick = (orderId: number) => {
    setNewOrderItem({
      ...newOrderItem,
      orderId
    });
    setIsAddModalOpen(true);
  };

  const handleSaveItem = async () => {

     try {
    await apiClient.post("/OrderItems", newOrderItem, user?.userId);
    
    // Refresh the expanded order's items
    if (newOrderItem.orderId) {
      const itemsRes = await apiClient.get<OrderItem[]>(
        `/OrderItems?orderId=${newOrderItem.orderId}`, 
        user?.userId
      );
      
      const enrichedItems = await Promise.all(itemsRes.map(async (item) => {
        const product = await apiClient.get<Product[]>(
          `/Products?productId=${item.productId}`, 
          user?.userId
        );
        return { ...item, product: product[0] };
      }));

      setOrderItemsByOrderId(prev => ({
        ...prev,
        [newOrderItem.orderId]: enrichedItems
      }));
    }

    setIsAddModalOpen(false);
    setNewOrderItem({
      id: 0,
      orderId: 0,
      productId: "0",
      quantity: 1,
      unitPrice: 0,
      netAmount: 0,
      grossAmount: 0,
      comment: "",
    });
    
  } catch (err) {
    console.error("Error adding item:", err);
    alert("Hiba történt a tétel hozzáadásakor.");
  }
  };

return (
  <div className="max-w-full mx-auto p-4 sm:p-6">
    <h1 className="text-2xl font-bold mb-4">Rendelések</h1>

    <div className="mb-4">
      <button
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-green-700"
        onClick={() => setIsAddOrderOpen(prev => !prev)}
      >
        {isAddOrderOpen ? 'Bezárás' : 'Új rendelés hozzáadása'}
      </button>

      {isAddOrderOpen && (
        <AddOrderForm
          onSave={handleSaveOrder}
          onCancel={() => setIsAddOrderOpen(false)}
          currentUserId={user?.userId}
        />
      )}
    </div>


    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <OrderTable 
        table={table}
        columns={columns}
        expandedOrderIds={expandedOrderIds}
        orderItemsByOrderId={orderItemsByOrderId}
        selectedOffer={selectedOffer}
        onRowClick={handleRowClick}
        onAddItemClick={handleAddItemClick}
        currentUserId={user?.userId}
      />
    </div>

    <div className="flex justify-center mt-4 col">
      <button
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        Előző
      </button>
      <button
        className="px-4 py-1 ml-2 bg-gray-200 rounded disabled:opacity-50"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        Következő
      </button>
    </div>

    <AddItemModal
      isOpen={isAddModalOpen}
      newOrderItem={newOrderItem}
      user={user}
      onClose={() => setIsAddModalOpen(false)}
      onChange={setNewOrderItem}
      onSave={handleSaveItem}
      products={products}
    />
  </div>
);}

export const Route = createFileRoute('/admin/orders/')({
  beforeLoad: () => authGuard([1,2,4]),
  component: RouteComponent,
});

export default RouteComponent;