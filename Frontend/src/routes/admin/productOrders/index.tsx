import React, { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { authGuard } from '../../../utils/authGuard';
import { useAuth } from '../../../contexts/AuthContext';
import apiClient from '../../../utils/apiClient';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { Status } from '../../../models/status';
import { Product } from '../../../models/Product';
import { SupplierOrderItem } from '../../../models/SupplierOrderItem';


export const Route = createFileRoute('/admin/productOrders/')({
  beforeLoad: () => authGuard([1, 2, 4]),
  component: ProductOrdersRouteComponent,
});

function ProductOrdersRouteComponent() {
  const { user } = useAuth();
  const [items, setItems] = useState<SupplierOrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [productInput, setProductInput] = useState('');
  const [productId, setProductId] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Load products and statuses
  useEffect(() => {
    if (!user) return;
    apiClient.get<Product[]>('/products', user.userId).then(setProducts).catch(() => {});
    apiClient.get<Status[]>('/statuses', user.userId).then(setStatuses).catch(() => {});
  }, [user]);

  // Load orders
  const loadItems = () => {
    if (!user) return;
    setLoading(true);
    apiClient
      .get<SupplierOrderItem[]>('/supplierorders', user.userId)
      .then(setItems)
      .catch(() => setError('Hiba az adatok betöltésekor'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadItems();
  }, [user]);

  const receiveHandler = async (id: number) => {
    if (!user) return;
    setSubmittingId(id);
    try {
      await apiClient.put('/supplierorders', { id, statusId: 1 }, user.userId);
      loadItems();
    } catch {
      setError('Hiba a rendelés státusz frissítésekor');
    } finally {
      setSubmittingId(null);
    }
  };

  const columns = React.useMemo<ColumnDef<SupplierOrderItem>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      {
        accessorKey: 'agentName',
        header: 'Ügynök',
        cell: ({ getValue }) => getValue<string>() || '-',
      },
      { accessorKey: 'productId', header: 'Termék ID' },
      { accessorKey: 'quantity', header: 'Mennyiség' },
      {
        accessorKey: 'orderedDate',
        header: 'Rendelés dátuma',
        cell: ({ getValue }) => new Date(getValue<string>()).toLocaleString(),
      },
      {
        accessorKey: 'statusId',
        header: 'Státusz',
        cell: ({ getValue }) => {
          const id = getValue<number>();
          const st = statuses.find(s => s.id === id);
          return st ? st.name : id;
        },
      },
      {
        id: 'actions',
        header: 'Művelet',
        cell: ({ row }) => {
          const order = row.original;
          if (order.statusId !== 6) return null;
          const disabled = submittingId === order.id;
          return (
            <button
              onClick={() => receiveHandler(order.id)}
              disabled={disabled}
              className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {disabled ? 'Feldolgozás...' : 'Átvesz'}
            </button>
          );
        },
      },
    ],
    [statuses, submittingId]
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 20 } },
  });

  // Submit new order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || quantity < 1 || !user) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.post('/supplierorders', { productId, quantity }, user.userId);
      setShowForm(false);
      setProductInput('');
      setProductId('');
      setQuantity(1);
      loadItems();
    } catch {
      setError('Hiba a rendelés leadása során');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-full mx-auto p-4">
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <h1 className="text-2xl font-bold mb-4">Szállítói rendelés tételek</h1>
      <button
        onClick={() => setShowForm(prev => !prev)}
        className="mb-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        {showForm ? 'Űrlap elrejtése' : 'Új rendelés'}
      </button>
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Termék</label>
              <input
                list="product-list"
                value={productInput}
                onChange={e => {
                  const val = e.target.value;
                  setProductInput(val);
                  const match = products.find(p => `${p.productId} - ${p.name}` === val);
                  setProductId(match ? match.productId : '');
                }}
                required
                className="mt-1 w-full border rounded p-2"
                disabled={submitting}
              />
              <datalist id="product-list">
                {products.map(p => (
                  <option key={p.productId} value={`${p.productId} - ${p.name}`} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mennyiség</label>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                min={1}
                required
                className="mt-1 w-full border rounded p-2"
                disabled={submitting}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              {submitting ? 'Küldés...' : 'Rendelés leadása'}
            </button>
          </form>
        </div>
      )}
      {loading ? (
        <div className="p-6 text-center">Betöltés...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
            <thead className="bg-gray-100">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-4 py-2 font-medium">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="even:bg-gray-50 hover:bg-gray-100">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-2 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-500">
                    Nincs adat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >Előző</button>
            <span>Oldal {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}</span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >Következő</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductOrdersRouteComponent;
