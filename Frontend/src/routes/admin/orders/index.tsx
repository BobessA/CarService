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
  ColumnFiltersState,
} from "@tanstack/react-table";
import { OrderHeadersDTO } from "../../../models/OrderHeadersDTO";
import { useAuth } from "../../../contexts/AuthContext";
import apiClient from "../../../utils/apiClient";

interface FuelType {
  id: number;
  name: string;
}

// RouteComponent is declared as a hoisted function so it can be referenced by the Route export.
function RouteComponent() {
  const { user } = useAuth();

  // Data
  const [orders , setOrders] = useState< OrderHeadersDTO[]>([]);

  // Fetch vehicles
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
              <tr key={row.id} className="even:bg-gray-50 hover:bg-gray-100 transition">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
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
