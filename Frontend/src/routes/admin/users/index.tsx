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
import { RoleData } from "../../../models/RoleData";
import VehicleManager from "../../../components/user/vehiclemanager";

function RouteComponent() {
  const { user } = useAuth();

  // Data
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<RoleData[]>([]);

  // Filters
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [emailFilter, setEmailFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [phoneFilter, setPhoneFilter] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Vehicle form state
  const [vehicleOwner, setVehicleOwner] = useState<User | null>(null);

  // User registration state
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDiscount, setNewDiscount] = useState(0);
  const [newRole, setNewRole] = useState<string>("");
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Fetch users
  const loadUsers = () => {
    if (!user) return;
    apiClient
      .get<User[]>(`/users`, user.userId)
      .then(setUsers)
      .catch((err) =>
        console.error("Hiba a felhasználók lekérdezésében: ", err)
      );
    apiClient
      .get<RoleData[]>(`/roles`, user.userId)
      .then(setRoles)
      .catch((err) =>
        console.error("Hiba a jogok lekérdezésében: ", err)
      );
  };

  useEffect(() => {
    loadUsers();
  }, [user]);

  // Update filters
  useEffect(() => {
    const filters: ColumnFiltersState = [];
    if (phoneFilter) filters.push({ id: "phone", value: phoneFilter });
    if (roleFilter) filters.push({ id: "roleId", value: roleFilter });
    if (emailFilter) filters.push({ id: "email", value: emailFilter });
    setColumnFilters(filters);
  }, [phoneFilter, roleFilter, emailFilter]);

  // Role options count
  // const roleOptions = useMemo(() => {
  //   const counts: Record<string, number> = {};
  //   users.forEach((u) => {
  //     counts[String(u.roleId)] = (counts[String(u.roleId)] || 0) + 1;
  //   });
  //   return Object.entries(counts).map(([value, count]) => ({
  //     value,
  //     count,
  //   }));
  // }, [users]);

  // Table columns
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      { accessorKey: "name", header: "Név" },
      { accessorKey: "email", header: "E-mail cím" },
      { accessorKey: "phone", header: "Telefonszám" },
      { 
        id: "roleId", 
        accessorKey: "roleId",
        header: "Jogosultság", 
        cell: ({ row }) => {
          const roleId = row.original.roleId;
          const role = roles.find((r) => r.id === roleId);
          return role ? role.name : "Ismeretlen jogosultság";
        },
        filterFn: (row, id, filterValue) => {
          const rowValue = String(row.getValue(id)); 
          const filterNumber = String(filterValue); 
          return rowValue === filterNumber;
        },
      },
      { accessorKey: "discount", header: "Kedvezmény %" },
      {
        id: "vehicles",
        header: "Jármű regisztrálása",
        cell: ({ row }) => (
          <button
            className="text-blue-600 hover:underline"
            onClick={() => setVehicleOwner(row.original)}
          >
            Új jármű
          </button>
        ),
      },
    ],
    [roles]
  );

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

  // Handle user registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setRegistering(true);
    setRegisterError(null);
    try {
      console.log(newName, newEmail, newPhone, newRole);
      await apiClient.post(
        "/users",
        {
          name: newName,
          email: newEmail,
          phone: newPhone,
          roleId: newRole,
          discount: newDiscount
        },
        user.userId
      );
      setShowRegisterForm(false);
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      setNewRole("");
      setNewDiscount(0);
      loadUsers();
    } catch (err: any) {
      setRegisterError(err.message || "Hiba a regisztrálás során");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="max-w-full mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Felhasználók</h1>
        <button
          onClick={() => setShowRegisterForm(prev => !prev)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showRegisterForm ? 'Űrlap elrejtése' : 'Új felhasználó'}
        </button>
      </div>

      {/* Registration Form */}
      {showRegisterForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {registerError && <p className="text-red-600 mb-2">{registerError}</p>}
          <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Név"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
              className="px-4 py-2 border rounded w-full"
              disabled={registering}
            />
            <input
              type="email"
              placeholder="E-mail cím"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              required
              className="px-4 py-2 border rounded w-full"
              disabled={registering}
            />
            <input
              type="text"
              placeholder="Telefonszám"
              value={newPhone}
              onChange={e => setNewPhone(e.target.value)}
              className="px-4 py-2 border rounded w-full"
              disabled={registering}
            />
            <input
              type="number"
              placeholder="Kedvezmény százalék"
              value={newDiscount === 0 ? '' : newDiscount}
              onChange={e => setNewDiscount(parseInt(e.target.value))}
              className="px-4 py-2 border rounded w-full"
              disabled={registering}
            />
            <select
              value={newRole}
              onChange={e => setNewRole(e.target.value)}
              required
              className="px-4 py-2 border rounded w-full"
              disabled={registering}
            >
              <option value="">Jogosultság kiválasztása</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
            <div className="sm:col-span-2 flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={() => setShowRegisterForm(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
                disabled={registering}
              >Mégse</button>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                disabled={registering}
              >Regisztrálás</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <input
          type="text"
          placeholder="Globális keresés..."
          className="px-4 py-2 border rounded w-full"
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Email keresés..."
          className="px-4 py-2 border rounded w-full"
          value={emailFilter}
          onChange={e => setEmailFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Telefonszám keresés..."
          className="px-4 py-2 border rounded w-full"
          value={phoneFilter}
          onChange={e => setPhoneFilter(e.target.value)}
        />
        <select
          className="px-4 py-2 border rounded w-full"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        >
          <option value="">Összes jogosultság</option>
          {roles.map(role => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {roles.length > 0 ? (
      <div className="overflow-x-auto bg-white rounded-lg shadow mb-6">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-3 font-medium cursor-pointer select-none"
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <div className="flex items-center">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: ' 🔼', desc: ' 🔽'}[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="text-gray-800">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="even:bg-gray-50 hover:bg-gray-100">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-2 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      ) : (
        <div>Betöltés...</div>
      )};
      {/* Vehicle registration section */}
      {vehicleOwner && (
        <VehicleManager
          key={vehicleOwner.userId}
          ownerId={vehicleOwner.userId}
        />
      )}
    </div>
  );
}

export const Route = createFileRoute('/admin/users/')({
  beforeLoad: () => authGuard([1, 2, 4]),
  component: RouteComponent,
});

export default RouteComponent;