import { useMemo, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { authGuard } from "../../../utils/authGuard";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { OrderHeadersDTO } from "../../../models/OrderHeadersDTO";
import { OfferDTO } from '../../../models/offerDTO';
import { OrderItem } from '../../../models/OrderItem';
import { Product } from '../../../models/Product';
import { useAuth } from "../../../contexts/AuthContext";
import apiClient from "../../../utils/apiClient";
import AsyncSelect from 'react-select/async';

type OrderItemsByOrderId = Record<number, Array<OrderItem & { product?: Product }>>;

const createProductLoader = (userId: string) => async (inputValue: string) => {
  if (!inputValue) return [];

  try {
    const response = await apiClient.get<Product[]>(
      `/Products?name=${encodeURIComponent(inputValue)}`,
      userId
    );
    return response.map(product => ({
      value: product.productId,
      label: `${product.name} (${product.brand}) - ${product.sellingPrice} Ft`,
      sellingPrice: product.sellingPrice,
    }));
  } catch (error) {
    console.error('Failed to load products:', error);
    return [];
  }
};



const OrderTable = ({ 
  table, 
  columns,
  expandedOrderIds,
  orderItemsByOrderId,
  selectedOffer,
  user,
  onRowClick,
  onAddItemClick
}: {
  table: ReturnType<typeof useReactTable<OrderHeadersDTO>>;
  columns: ColumnDef<OrderHeadersDTO>[];
  expandedOrderIds: number[];
  orderItemsByOrderId: OrderItemsByOrderId;
  selectedOffer: OfferDTO | null;
  user: any;
  onRowClick: (orderId: number, offerId: number) => void;
  onAddItemClick: (orderId: number) => void;
}) => {
  return (
    <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
      <thead className="bg-gray-100 text-gray-700">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className="px-4 py-3 font-medium cursor-pointer select-none"
                onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
              >
                <div className="flex items-center">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{ asc: " 🔼", desc: " 🔽" }[header.column.getIsSorted() as string] ?? null}
                </div>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="text-gray-800">
        {table.getRowModel().rows.map((row) => (
          <>
            <tr
              key={row.id}
              className="even:bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
              onClick={() => onRowClick(row.original.id, row.original.offerId)}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
            {expandedOrderIds.includes(row.original.id) && (
              <OrderDetails 
                order={row.original} 
                selectedOffer={selectedOffer} 
                orderItems={orderItemsByOrderId[row.original.id]} 
                onAddItemClick={onAddItemClick}
              />
            )}
          </>
        ))}
        {table.getRowModel().rows.length === 0 && (
          <tr>
            <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-500">
              Nincs találat.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

const OrderDetails = ({ 
  order, 
  selectedOffer, 
  orderItems, 
  onAddItemClick 
}: {
  order: OrderHeadersDTO;
  selectedOffer: OfferDTO | null;
  orderItems?: Array<OrderItem & { product?: Product }>;
  onAddItemClick: (orderId: number) => void;
}) => {
  return (
    <tr className="bg-gray-50">
      <td colSpan={Object.keys(order).length} className="px-4 py-4">
        <div className="grid sm:grid-cols-1 gap-x-8 gap-y-2 w-full">
          <p><strong>ID:</strong> {order.id}</p>
          <p><strong>Customer ID:</strong> {order.customerId}</p>
          <p><strong>Vehicle ID:</strong> {order.vehicleId}</p>
          <p><strong>Order Number:</strong> {order.orderNumber}</p>
          <p><strong>Offer ID:</strong> {order.offerId}</p>
          <p><strong>Agent ID:</strong> {order.agentId}</p>
          <p><strong>Mechanic ID:</strong> {order.mechanicId}</p>
          <p><strong>Status ID:</strong> {order.statusId}</p>
          <p><strong>Status:</strong> {order.statusName}</p>
          <p><strong>Comment:</strong> {order.comment}</p>
          <p><strong>Net Amount:</strong> {order.netAmount} Ft</p>
          <p><strong>Gross Amount:</strong> {order.grossAmount} Ft</p>
          <p><strong>Order Date:</strong> {order.orderDate}</p>

          {selectedOffer?.imagePaths && selectedOffer.imagePaths.length > 0 && (
            <div className="sm:col-span-2 mt-4">
              <p className="font-semibold mb-2">Kapcsolódó képek:</p>
              <div className="flex flex-wrap gap-4">
                {selectedOffer.imagePaths.map((path, index) => (
                  <img
                    key={index}
                    src={encodeURI(path)}
                    alt={`Offer image ${index + 1}`}
                    className="w-40 h-40 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          )}
          
          {orderItems?.length > 0 && (
            <OrderItemsTable orderItems={orderItems} />
          )}

          <div></div>

          <div className="mt-4">
            <button
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              onClick={() => onAddItemClick(order.id)}
            >
              Új tétel hozzáadása
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
};

const OrderItemsTable = ({ orderItems }: { orderItems: Array<OrderItem & { product?: Product }> }) => {
  return (
    <div className="mt-6 w-full overflow-x-auto">
      <p className="font-semibold mb-2">Tételek:</p>
      <table className="min-w-full text-sm text-left border">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 border">Termék ID</th>
            <th className="px-4 py-2 border">Név</th>
            <th className="px-4 py-2 border">Márka</th>
            <th className="px-4 py-2 border">Mennyiség</th>
            <th className="px-4 py-2 border">Egységár</th>
            <th className="px-4 py-2 border">Nettó</th>
            <th className="px-4 py-2 border">Bruttó</th>
            <th className="px-4 py-2 border">Megjegyzés</th>
          </tr>
        </thead>
        <tbody>
          {orderItems.map((item, idx) => (
            <tr key={idx} className="even:bg-gray-100">
              <td className="px-4 py-2 border">{item.productId}</td>
              <td className="px-4 py-2 border">{item.product?.name || "-"}</td>
              <td className="px-4 py-2 border">{item.product?.brand || "-"}</td>
              <td className="px-4 py-2 border">{item.quantity}</td>
              <td className="px-4 py-2 border">{item.unitPrice} Ft</td>
              <td className="px-4 py-2 border">{item.netAmount} Ft</td>
              <td className="px-4 py-2 border">{item.grossAmount} Ft</td>
              <td className="px-4 py-2 border">{item.comment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AddItemModal = ({ 
  isOpen, 
  newOrderItem, 
  user,
  onClose, 
  onChange,
  onSave,
  products,
}: {
  isOpen: boolean;
  newOrderItem: OrderItem;
  user: any;
  products: Product[];
  onClose: () => void;
  onChange: (item: OrderItem) => void;
  onSave: () => void;
  
}) => {
  if (!isOpen) return null;

  const handleChange = (updates: Partial<OrderItem>) => {
    const updatedItem = { ...newOrderItem, ...updates };
    
    // Calculate amounts when quantity or unitPrice changes
    if ('quantity' in updates || 'unitPrice' in updates) {
      updatedItem.netAmount = parseFloat((updatedItem.unitPrice * updatedItem.quantity).toFixed(2));
      updatedItem.grossAmount = parseFloat((updatedItem.netAmount * 1.27).toFixed(2));
    }

    onChange(updatedItem);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Új rendelési tétel hozzáadása</h2>
        
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rendelés ID
          </label>
          <input
            type="number"
            className="w-full border px-3 py-2 rounded bg-gray-100 cursor-not-allowed"
            value={newOrderItem.orderId}
            readOnly
          />



            <label className="block text-sm font-medium text-gray-700 mb-1">
              Termék
            </label>
              <AsyncSelect
                cacheOptions
                loadOptions={createProductLoader(user.userId)}
                defaultOptions
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    handleChange({
                      productId: selectedOption.value,
                      unitPrice: selectedOption.sellingPrice // Add this line
                    });
                  }
                }}
                placeholder="Keresés terméknévre..."
              />
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mennyiség
          </label>
          <input
            type="number" 
            placeholder="Mennyiség"
            className="w-full border px-3 py-2 rounded"
            value={newOrderItem.quantity}
            onChange={e => handleChange({ quantity: Number(e.target.value) })}
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Egységár
          </label>
            <input
              type="number"
              placeholder="Egységár"
              className="w-full border px-3 py-2 rounded"
              value={newOrderItem.unitPrice}
              onChange={e => handleChange({ unitPrice: Number(e.target.value) })}
            />
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nettó összeg
          </label>
          <input
            type="number"
            className="w-full border px-3 py-2 rounded bg-gray-100 cursor-not-allowed"
            value={newOrderItem.netAmount || 0}
            readOnly
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bruttó összeg (27% ÁFA)
          </label>
          <input
            type="number"
            className="w-full border px-3 py-2 rounded bg-gray-100 cursor-not-allowed"
            value={newOrderItem.grossAmount || 0}
            readOnly
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Megjegyzés
          </label>
          <input
            type="text"
            placeholder="Megjegyzés"
            className="w-full border px-3 py-2 rounded"
            value={newOrderItem.comment}
            onChange={e => onChange({...newOrderItem, comment: e.target.value})}
          />
        </div>

        <div className="flex justify-end mt-6 gap-2">
          <button
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={onClose}
          >
            Mégse
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={onSave}
          >
            Mentés
          </button>
        </div>
      </div>
    </div>
  );
};

const Pagination = ({ table }: { table: ReturnType<typeof useReactTable<OrderHeadersDTO>> }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4">
      <div className="mb-2 sm:mb-0">
        Oldal {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
      </div>
      <div className="space-x-2">
        <button
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Előző
        </button>
        <button
          className="px-4 py-1 bg-gray-200 rounded disabled:opacity-50"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Következő
        </button>
      </div>
    </div>
  );
};

function RouteComponent() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderHeadersDTO[]>([]);
  const [expandedOrderIds, setExpandedOrderIds] = useState<number[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<OfferDTO | null>(null);
  const [orderItemsByOrderId, setOrderItemsByOrderId] = useState<OrderItemsByOrderId>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  const columns = useMemo<ColumnDef<OrderHeadersDTO>[]>(
    () => [
      { accessorKey: "id", header: "id" },
      { accessorKey: "customerId", header: "customerId" },
      { accessorKey: "orderNumber", header: "orderNumber" },
      { accessorKey: "offerId", header: "offerId" },
      { accessorKey: "statusId", header:  "statusId" },
      { accessorKey: "comment", header: "comment" },
      { accessorKey: "orderDate", header: "orderDate" },
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

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <OrderTable 
          table={table}
          columns={columns}
          expandedOrderIds={expandedOrderIds}
          orderItemsByOrderId={orderItemsByOrderId}
          selectedOffer={selectedOffer}
          user={user}
          onRowClick={handleRowClick}
          onAddItemClick={handleAddItemClick}
        />
      </div>

      <Pagination table={table} />

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
  );
}

export const Route = createFileRoute('/admin/orders/')({
  beforeLoad: () => authGuard([1,2,4]),
  component: RouteComponent,
});

export default RouteComponent;