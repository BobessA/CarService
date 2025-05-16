import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { authGuard } from "../../../utils/authGuard";
import { useAuth } from "../../../contexts/AuthContext";
import apiClient from "../../../utils/apiClient";
import { AddItemModal } from "../../../components/orders/AddItemModal";
import { OrderItemsTable } from "../../../components/orders/OrderItemsTable";

// Modellek/Típusok
import { OrderHeadersDTO } from "../../../models/OrderHeadersDTO";
import { OfferDTO } from "../../../models/offerDTO";
import { OrderItem } from "../../../models/OrderItem";
import { Vehicle } from "../../../models/Vehicle";
import { Status } from "../../../models/status";
import { Product } from "../../../models/Product";
import { format } from "date-fns";

function RouteComponent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderHeadersDTO[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [offers, setOffers] = useState<OfferDTO[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItemsByOrderId, setOrderItemsByOrderId] = useState<Record<number, OrderItem[]>>({});
  const [newItem, setNewItem] = useState<OrderItem>({
    id: 0,
    orderId: 0,
    productId: "0",
    quantity: 1,
    unitPrice: 0,
    netAmount: 0,
    grossAmount: 0,
    comment: "",
  });
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    if (!user?.userId) return;
    const fetchAll = async () => {
      try {
        const [ordersRes, vehiclesRes, statsRes, offersRes, usersRes, productsRes] = await Promise.all([
          apiClient.get<OrderHeadersDTO[]>('/OrdersHeader?statusId=3&statusId=6', user.userId),
          apiClient.get<Vehicle[]>('/vehicles', user.userId),
          apiClient.get<Status[]>('/statuses', user.userId),
          apiClient.get<OfferDTO[]>('/Offers', user.userId),
          apiClient.get<any[]>('/Users', user.userId),
          apiClient.get<Product[]>('/Products', user.userId),
        ]);
        setOrders(ordersRes);
        setVehicles(vehiclesRes);
        setStatuses(statsRes);
        setOffers(offersRes);
        setProducts(productsRes);
        const umap: Record<string, string> = {};
        usersRes.forEach(u => umap[u.userId] = u.name);
        setUsersMap(umap);
        const itemsMap: Record<number, OrderItem[]> = {};
        await Promise.all(
          ordersRes.map(async o => {
            const items = await apiClient.get<OrderItem[]>(`/OrderItems?orderId=${o.id}`, user.userId);
            itemsMap[o.id] = items;
          })
        );
        setOrderItemsByOrderId(itemsMap);
      } catch (e) { console.error(e); }
    };
    fetchAll();
  }, [user?.userId]);

  const statusColor = (statusId: number) => {
    switch (statusId) {
      case 3: return 'border-yellow-500';
      case 6: return 'border-blue-500';
      case 4: return 'border-green-500';
      default: return 'border-gray-200';
    }
  };

  const nextStatus = (current: number) => {
    if (current === 3) return 6;
    if (current === 6) return 4;
    return 4;
  };
  const changeStatus = async (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const newStat = nextStatus(order.statusId);
    try {
      await apiClient.put('/OrdersHeader', { id: orderId, statusId: newStat }, user!.userId);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, statusId: newStat, statusName: statuses.find(s => s.id === newStat)?.name || o.statusName } : o));
    } catch (err) {
      console.error(err);
      alert('Hiba státusz váltásakor');
    }
  };

  const openAddItem = (orderId: number) => {
    setNewItem(prev => ({ ...prev, orderId }));
    setAddModalOpen(true);
  };

  const handleSaveItem = async () => {
    try {
      await apiClient.post('/OrderItems', newItem, user!.userId);
      const items = await apiClient.get<OrderItem[]>(`/OrderItems?orderId=${newItem.orderId}`, user!.userId);
      setOrderItemsByOrderId(prev => ({ ...prev, [newItem.orderId]: items }));
      setAddModalOpen(false);
    } catch (err) { console.error(err); alert('Hiba tétel hozzáadásakor'); }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Munkafolyamatok</h1>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', rowGap: '50px' }}>
        {orders.map(order => {
          const statusColorClass = statusColor(order.statusId);
          const vehicleName = vehicles.find(v => v.id === order.vehicleId)?.licensePlate || '-';
          const offer = offers.find(o => o.id === order.offerId);
          const items = orderItemsByOrderId[order.id] || [];

          return (
            <div
              key={order.id}
              className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${statusColorClass}`} 
              style={{ width: '100%', margin: '0 auto', marginBottom: '50px' }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {order.orderNumber} (#{order.id})
                </h3>
                <span className="text-sm text-gray-500">
                  {format(new Date(order.orderDate), 'yyyy.MM.dd. HH:mm')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 mb-4">
                <div>
                  <p><span className="font-medium">Jármű:</span> {vehicleName}</p>
                  {offer?.issueDescription && (
                    <p className="mt-1"><span className="font-medium">Probléma:</span> {offer.issueDescription}</p>
                  )}
                  <p className="mt-1"><span className="font-medium">Ügyintéző:</span> {usersMap[order.agentId||'']||'-'}</p>
                  <p className="mt-1"><span className="font-medium">Szerelő:</span> {usersMap[order.mechanicId||'']||'-'}</p>
                </div>
                <div>
                  <p><span className="font-medium">Állapot:</span> {order.statusName}</p>
                  {offer?.appointmentDate && (
                    <p className="mt-1"><span className="font-medium">Leadás:</span> {format(new Date(offer.appointmentDate), 'yyyy.MM.dd. HH:mm')}</p>
                  )}
                </div>
              </div>

              {/* Tételek */}
              {items.length !== 0 && <OrderItemsTable orderItems={items.map(it => ({ ...it, product: products.find(p => p.productId === it.productId) }))} />
 }

              <div className="flex space-x-4 mt-4">
                <button
                  onClick={() => openAddItem(order.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >Új tétel hozzáadása</button>
                <button
                  style={order.statusId === 4 ? { display: 'none' } : {}}
                  onClick={() => changeStatus(order.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >Státusz váltása</button>
              </div>
            </div>
          );
        })}
      </div>

      <AddItemModal
        isOpen={addModalOpen}
        newOrderItem={newItem}
        user={user}
        onClose={() => setAddModalOpen(false)}
        onChange={setNewItem}
        onSave={handleSaveItem}
        products={products}
      />
    </div>
  );
}

export const Route = createFileRoute('/admin/work-in-progress/')({
  beforeLoad: () => authGuard([1, 2, 4]),
  component: RouteComponent,
});

export default RouteComponent;
