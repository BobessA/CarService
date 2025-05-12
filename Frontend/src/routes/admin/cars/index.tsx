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
import { Vehicle } from "../../../models/Vehicle";
import { useAuth } from "../../../contexts/AuthContext";
import apiClient from "../../../utils/apiClient";
import { VehicleBrands } from "../../../models/VehicleBrands";
import { VehicleModells } from "../../../models/VehicleModells";

interface FuelType {
  id: number;
  name: string;
}

// RouteComponent is declared as a hoisted function so it can be referenced by the Route export.
function RouteComponent() {
  const { user } = useAuth();

  // Data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fuelTypes, setFuelTypes] = useState<FuelType[]>([]);
  const [brands, setBrands] = useState<VehicleBrands[]>([]);
  const [modells, setModells] = useState<VehicleModells[]>([]);

  // Filters
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [fuelFilter, setFuelFilter] = useState<string>("");
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [modelFilter, setModelFilter] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Fetch vehicles
  useEffect(() => {
    
    if (!user) return;
    apiClient
    .get<Vehicle[]>(`/vehicles`, user?.userId)
    .then(setVehicles)
    .catch(err => console.error("Hiba a jármű lekérdezésben:", err));
}, [user, user?.userId]);

  // Fetch fuel types
  useEffect(() => {
    apiClient
    .get<FuelType[]>(`/fueltypes`, user?.userId)
    .then(setFuelTypes)
    .catch(err => console.error("Hiba a üzemanyagtípusok lekérésekor:", err));
}, [user, user?.userId]);

  // gyártók, modellek
  useEffect(() => {
    Promise.all([
      apiClient.get<VehicleBrands[]>("/Vehicles/Brands", user?.userId),
      apiClient.get<VehicleModells[]>("/Vehicles/Modells",user?.userId),
    ])
    .then(([brandsData, modellsData]) => {
        setBrands(brandsData.sort((a, b) => a.brandName.localeCompare(b.brandName)));
        setModells(modellsData.sort((a, b) => a.modellName.localeCompare(b.modellName)));
    })
    .catch(err => console.error("Hiba a gyártók és modellek lekérésekor:", err));
  }, [user, user?.userId]);

  // Update column filters when any filter changes
  useEffect(() => {
    const filters: ColumnFiltersState = [];
    if (fuelFilter) filters.push({ id: "fuelType", value: fuelFilter });
    if (brandFilter) filters.push({ id: "brand", value: brandFilter });
    if (modelFilter) filters.push({ id: "model", value: modelFilter });
    if (yearFilter) filters.push({ id: "yearOfManufacture", value: yearFilter });
    setColumnFilters(filters);
  }, [fuelFilter, brandFilter, modelFilter, yearFilter]);

  const yearOptions = useMemo(() => {
    const counts: Record<number, number> = {};
    vehicles.forEach((v) => {
      counts[v.yearOfManufacture] = (counts[v.yearOfManufacture] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => Number(a.value) - Number(b.value));
  }, [vehicles]);

  const columns = useMemo<ColumnDef<Vehicle>[]>(
    () => [
      { accessorKey: "licensePlate", header: "Rendszám" },
      { accessorKey: "brand", header: "Márka" },
      { accessorKey: "model", header: "Típus" },
      { accessorKey: "yearOfManufacture", header: "Gyártási év", filterFn: 'equalsString' },
      { accessorKey: "vin", header: "Alvázszám" },
      { accessorKey: "engineCode", header: "Motor kód" },
      { accessorKey: "odometer", header: "Kilométeróra" },
      {
        id: "fuelType",
        header: "Üzemanyag",
        accessorKey: "fuelType",
        accessorFn: row => {
          const ft = fuelTypes.find(f => f.id === row.fuelType);
          return ft?.name ?? "";
        },
      },
    ], [fuelTypes]);

  const table = useReactTable({
    data: vehicles,
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
        <select
          className="px-4 py-2 border rounded w-full"
          value={fuelFilter}
          onChange={(e) => setFuelFilter(e.target.value)}
        >
          <option value="">Összes üzemanyag</option>
          {fuelTypes.map((ft) => (
            <option key={ft.id} value={ft.name}>
              {`${ft.name} (${vehicles.filter(v => v.fuelType === ft.id).length})`}
            </option>
          ))}
        </select>
        <select
          className="px-4 py-2 border rounded w-full"
          value={brandFilter}
          onChange={(e) => {
            setBrandFilter(e.target.value);
            setModelFilter("");
          }}
        >
          <option value="">Összes márka</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.brandName}>
              {brand.brandName}
            </option>
          ))}
        </select>
        <select
          className="px-4 py-2 border rounded w-full"
          value={modelFilter}
          onChange={(e) => setModelFilter(e.target.value)}
          disabled={!brandFilter}
        >
          <option value="">Összes típus</option>
          {modells.filter(m => !brandFilter || m.brandId === brands.find(b => b.brandName === brandFilter)?.id).map(modell => (
            <option key={modell.id} value={modell.modellName}>
              {modell.modellName}
            </option>
          ))}
        </select>
        <select
          className="px-4 py-2 border rounded w-full"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        >
          <option value="">Összes év</option>
          {yearOptions.map((opt) => (
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

export const Route = createFileRoute('/admin/cars/')({
  beforeLoad: () => authGuard([1,2,4]),
  component: RouteComponent,
});

export default RouteComponent;
