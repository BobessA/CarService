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
import User from "../../../models/User";
import { useAuth } from "../../../contexts/AuthContext";
import apiClient from "../../../utils/apiClient";

// RouteComponent is declared as a hoisted function so it can be referenced by the Route export.
function RouteComponent() {
  const { user } = useAuth();

  // Data
  const [users, setUsers] = useState<User[]>([]);

  // Filters
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [emailFilter, setEmailFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [phoneFilter, setPhoneFilter] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Fetch users
  useEffect(() => {
    
    if (!user) return;
    apiClient
    .get<User[]>(`/users`, user?.userId)
    .then(setUsers)
    .catch(err => console.error("Hiba a felhasználók lekérdezésében: ", err));
}, [user, user?.userId]);


  // Update column filters when any filter changes
  useEffect(() => {
    const filters: ColumnFiltersState = [];
    if (phoneFilter) filters.push({ id: "phone", value: phoneFilter });
    if (roleFilter) filters.push({ id: "role", value: roleFilter });
    if (emailFilter) filters.push({ id: "email", value: emailFilter });
    setColumnFilters(filters);
  }, [phoneFilter,roleFilter,emailFilter]);

  // Derive options with counts
  const roleOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach((u) => {
      counts[u.roleId] = (counts[u.roleId] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, users);

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      { accessorKey: "name", header: "Név" },
      { accessorKey: "email", header: "E-mail cím" },
      { accessorKey: "phone", header: "Telefonszám" },
      { accessorKey: "roleId", header: "Jogosultság" },
    ],[users]);

  const table = useReactTable({
    data: users,
    columns,
    state: { globalFilter, columnFilters },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 25 } },
  });

  return (
    <div className="max-w-full mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-4">Járművek</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <input
          type="text"
          placeholder="Globális keresés..."
          className="px-4 py-2 border rounded w-full"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />

        <input
          type="text"
          placeholder="Email keresés..."
          className="px-4 py-2 border rounded w-full"
          value={emailFilter}
          onChange={(e) => setEmailFilter(e.target.value)}
        />

        <input
          type="text"
          placeholder="Telefonszám keresés..."
          className="px-4 py-2 border rounded w-full"
          value={phoneFilter}
          onChange={(e) => setPhoneFilter(e.target.value)}
        />

        <select
          className="px-4 py-2 border rounded w-full"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">Összes jogosultság</option>
          {roleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {`${opt.value} (${opt.count})`}
            </option>
          ))}
        </select>
      </div>

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

export const Route = createFileRoute('/admin/users/')({
  beforeLoad: () => authGuard([1,2,4]),
  component: RouteComponent,
});

export default RouteComponent;
