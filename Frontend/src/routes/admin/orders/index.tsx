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
import { useAuth } from "../../../contexts/AuthContext";
import apiClient from "../../../utils/apiClient";


// RouteComponent is declared as a hoisted function so it can be referenced by the Route export.
function RouteComponent() {
  const { user } = useAuth();

  // Data
  const [orders , setOrders] = useState< OrderHeadersDTO[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<OfferDTO | null>(null);

  // Fetch orders
  useEffect(() => {
    
    if (!user) return;
    apiClient
    .get<OrderHeadersDTO[]>(`/OrdersHeader`, user?.userId)
    .then(setOrders)
    .catch(err => console.error("Hiba a rendelés lekérdezésben:", err));
}, [user, user?.userId]);


const columns = useMemo<ColumnDef<OrderHeadersDTO>[]>(
    () => [
      { accessorKey: "id", header: "id" },
      { accessorKey: "customerId", header: "customerId" },
      { accessorKey: "orderNumber", header: "orderNumber" },
      { accessorKey: "offerId", header: "offerId" },
      { accessorKey: "statusId", header:  "statusId" },
      { accessorKey: "comment", header: "comment" },
      { accessorKey: "orderDate", header: "orderDate" },
    ],[]);




  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 25 } },
  });


  {console.log("Object:", selectedOffer)}

  return (
    <div className="max-w-full mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-4">Rendelések</h1>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
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
           < tr
              key={row.id}
              className="even:bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
              onClick={() => {
                const orderId = row.original.id;
                const offerId = row.original.offerId;

                if (expandedOrderId === orderId) {
                  setExpandedOrderId(null);
                  setSelectedOffer(null);
                } else {
                  setExpandedOrderId(orderId);

                  // Fetch the related offer
                  apiClient
                    .get<OfferDTO[]>(`/Offers?offerId=${offerId}`, user?.userId)
                    .then(response => {
                      const firstOffer = response[0]; // take first item from array
                      setSelectedOffer(firstOffer);
                    })
                    .catch(err => console.error("Failed to fetch offer:", err));
                }
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
              {expandedOrderId === row.original.id && (
                <tr className="bg-gray-50">
                  <td colSpan={columns.length} className="px-4 py-4">
                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                      <p><strong>ID:</strong> {row.original.id}</p>
                      <p><strong>Customer ID:</strong> {row.original.customerId}</p>
                      <p><strong>Vehicle ID:</strong> {row.original.vehicleId}</p>
                      <p><strong>Order Number:</strong> {row.original.orderNumber}</p>
                      <p><strong>Offer ID:</strong> {row.original.offerId}</p>
                      <p><strong>Agent ID:</strong> {row.original.agentId}</p>
                      <p><strong>Mechanic ID:</strong> {row.original.mechanicId}</p>
                      <p><strong>Status ID:</strong> {row.original.statusId}</p>
                      <p><strong>Status:</strong> {row.original.statusName}</p>
                      <p><strong>Comment:</strong> {row.original.comment}</p>
                      <p><strong>Net Amount:</strong> {row.original.netAmount} Ft</p>
                      <p><strong>Gross Amount:</strong> {row.original.grossAmount} Ft</p>
                      <p><strong>Order Date:</strong> {row.original.orderDate}</p>

                      
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
                    </div>
                  </td>
                </tr>
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
        
      </div>

      {/* Pagination */}
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
    </div>
  );
}

export const Route = createFileRoute('/admin/orders/')({
  beforeLoad: () => authGuard([1,2,4]),
  component: RouteComponent,
});

export default RouteComponent;
