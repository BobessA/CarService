import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../utils/apiClient';
import { format } from 'date-fns';
import { OrderHeadersDTO } from '../../models/OrderHeadersDTO';
import { OfferDTO } from '../../models/offerDTO';
import { Vehicle } from '../../models/Vehicle';
import User from '../../models/User';

export const Route = createFileRoute('/orders/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderHeadersDTO[]>([]);
  const [offers, setOffers] = useState<OfferDTO[]>([]);
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    apiClient.get<Vehicle[]>(`/vehicles?userId=${user.userId}`, user.userId)
      .then(setUserVehicles)
      .catch(() => {});
    apiClient.get<OrderHeadersDTO[]>(`/OrdersHeader?customerId=${user.userId}`, user.userId)
      .then(data => {
        setOrders(data.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
      })
      .catch(() => setError('Hiba a rendelések betöltésekor'))
      .finally(() => setLoading(false));
    apiClient.get<User[]>(`/Users`, user.userId)
      .then(setUsers)
      .catch(() => {});
    apiClient.get<OfferDTO[]>(`/Offers`, user.userId)
      .then(setOffers)
      .catch(() => {});
  }, [user, user?.userId, user?.userId]);

  const vehicleMap = useMemo(() => {
    const map: Record<number, string> = {};
    userVehicles.forEach(v => {
      map[v.id] = `${v.brand} ${v.model} (${v.licensePlate})`;
    });
    return map;
  }, [userVehicles]);

  const statusOptions = useMemo(() => Array.from(new Set(orders.map(o => o.statusName))), [orders]);

  const filteredOrders = useMemo(() => orders.filter(o => {
    const matchesSearch = [o.orderNumber, o.statusName, o.orderDate, vehicleMap[o.vehicleId]]
      .some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter ? o.statusName === statusFilter : true;
    return matchesSearch && matchesStatus;
  }), [orders, searchTerm, statusFilter, vehicleMap]);

  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-800">Megrendeléseim</h2>
        {loading && <p className="text-center mt-6">Betöltés...</p>}
        {error && <p className="text-center text-red-600 mt-6">{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <p className="text-center text-gray-600 mt-6">Még nincs megrendelésed.</p>
        )}

        {orders.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <input
              type="text"
              placeholder="Keresés rendelésszémra, járműre, problémára..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full sm:w-1/2 p-3 border rounded-md focus:ring focus:ring-red-500 focus:border-red-500"
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full sm:w-1/3 p-3 border rounded-md focus:ring focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Összes állapot</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-10 space-y-6">
          {filteredOrders.length > 0 ? filteredOrders.map(order => {
            const statusColor = order.statusName === 'Beérkezett'
              ? 'border-red-500'
              : order.statusName === 'Elfogadott'
              ? 'border-yellow-500'
              : order.statusName === 'Folyamatban'
              ? 'border-red-700'
              : order.statusName === 'Elkészült'
              ? 'border-blue-500'
              : 'border-green-500';

            return (
              <div key={order.id} className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${statusColor}`}>  
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-800">{order.orderNumber} (#{order.id})</h3>
                  <span className="text-sm text-gray-500">{format(new Date(order.orderDate), 'yyyy.MM.dd. HH:mm')}</span>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                  <div>
                    <p><span className="font-medium">Jármű:</span> {vehicleMap[order.vehicleId]}</p>
                    {offers.find(o => o.id === order.offerId)?.issueDescription && <p className="mt-1"><span className="font-medium">Probléma:</span> {offers.find(o => o.id === order.offerId)?.issueDescription}</p>}
                    <p className="mt-1"><span className="font-medium">Ügyintéző:</span> {users.find(a => a.userId === order.agentId)?.name || '-'}</p>
                    <p className="mt-1"><span className="font-medium">Szerelő:</span> {users.find(a => a.userId === order.mechanicId)?.name || '-'}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Állapot:</span> {order.statusName}</p>
                    {order.orderDate && <p className="mt-1"><span className="font-medium">Megrendelés időpontja:</span> {format(new Date(order.orderDate), 'yyyy.MM.dd. HH:mm')}</p>}
                    {offers.find(o => o.id === order.offerId)?.appointmentDate && <p className="mt-1"><span className="font-medium">Jármű leadásának időpontja:</span> {format(new Date(offers.find(o => o.id === order.offerId)?.appointmentDate ?? ""), 'yyyy.MM.dd. HH:mm')}</p>}
                  </div>
                </div>
              </div>
            );
          }) : orders.length > 0 ? (
            <p className="text-center text-gray-600">Nincs találat a szűrésre.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
