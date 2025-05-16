  import { OrderHeadersDTO } from '../../models/OrderHeadersDTO'
  import { OrderItem } from '../../models/OrderItem';
  import { Product } from '../../models/Product';
  import { OrderItemsTable } from "./OrderItemsTable";
  import { OfferDTO } from '../../models/offerDTO';
  import User from "../../models/User";
  import apiClient from "../../utils/apiClient";
  import { useEffect, useState } from "react";
  import { Vehicle } from "../../models/Vehicle"

  const fetchUserData = async (customerId: string, agentId: string, mechanicId: string, currentId?:string) => {

  try {

      const promises = [
        apiClient.get<User[]>(`/Users?userId=${customerId}`, currentId),
        apiClient.get<User[]>(`/Users?userId=${agentId}`, currentId),
      ];

      if (mechanicId) {
        promises.push(apiClient.get<User[]>(`/Users?userId=${mechanicId}`, currentId));
      }

      const results = await Promise.allSettled(promises);

      const customerResponse = results[0].status === "fulfilled" ? results[0].value[0] : null;
      const agentResponse = results[1].status === "fulfilled" ? results[1].value[0] : null;
      const mechanicResponse = mechanicId
        ? results[2]?.status === "fulfilled" ? results[2].value[0] : null
        : null;

      return {
        customer: customerResponse,
        agent: agentResponse,
        mechanic: mechanicResponse
      };
    } catch (err) {
      console.error("Unexpected error:", err);
      return null;
    }
  };

const fetchCarData = async (vehicleId: number, currentId?: string): Promise<Vehicle | null> => {
  try {
    const response = await apiClient.get<Vehicle[]>(`/Vehicles?vehicleId=${vehicleId}`, currentId);
    return response[0] || null;
  } catch (err) {
    console.error("Unexpected error while fetching vehicle data:", err);
    return null;
  }
};

  export const OrderDetails = ({ 
    order, 
    selectedOffer, 
    orderItems, 
    onAddItemClick,
    currUserId,
  }: {
    order: OrderHeadersDTO;
    selectedOffer: OfferDTO | null;
    orderItems?: Array<OrderItem & { product?: Product }>;
    onAddItemClick: (orderId: number) => void;
    currUserId?: string;
  }) => {

  const [userData, setUserData] = useState<{
    customer: User | null;
    agent: User | null;
    mechanic: User | null;
  } | null>(null);

  const [vehicleData, setVehicleData] = useState<Vehicle | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const data = await fetchUserData(order.customerId, order.agentId, order.mechanicId, currUserId );
      setUserData(data);
    };
    loadUserData();
  }, [order.customerId, order.agentId, order.mechanicId]);


useEffect(() => {
  const loadCarData = async () => {
    const vdata = await fetchCarData(order.vehicleId, currUserId);
    setVehicleData(vdata);
  };
  loadCarData();
}, [order.vehicleId, currUserId]);

    return (
      
      <div className="bg-gray-50 border rounded p-3">

        <table className="min-w-full text-sm text-left border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Megrendelő</th>
              <th className="px-4 py-2 border">Ügyintéző</th>
              <th className="px-4 py-2 border">Szerelő</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 border">{userData?.customer ? userData.customer.name : 'N/A'}</td>
              <td className="px-4 py-2 border">{userData?.agent ? userData.agent.name : 'N/A'}</td>
              <td className="px-4 py-2 border">{userData?.mechanic ? userData.mechanic.name : 'N/A'}</td>
            </tr>
          </tbody>
        </table>
        

          <div className="mt-6 w-full overflow-x-auto">

            {vehicleData && (
              <div className="mb-3">
                <label className="form-label fw-bold">Autó:  </label>
                <p className="border rounded"> {vehicleData.yearOfManufacture} {vehicleData.brand} {vehicleData.model} ({vehicleData.licensePlate})</p>
              </div>
            )}


            <div className="mb-3">
              <label className="form-label fw-bold">Probléma leírása:</label>
              <input type="text" className="w-full p-2 border rounded" 
              readOnly 
              value={selectedOffer?.issueDescription || '–'}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Adminisztrátor komment:</label>
              <input type="text" className="w-full p-2 border rounded" 
              readOnly 
              value={selectedOffer?.adminComment || '–'}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Rendeléshez tartozó komment:</label>
              <input type="text" className="w-full p-2 border rounded" 
              readOnly 
              value={order.comment || '–'}
              />
            </div>
          </div>
          
          <div className="mt-6 w-full overflow-x-auto">

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
            
            {orderItems && orderItems?.length > 0 && (
              <OrderItemsTable orderItems={orderItems} />
            )}

            <div className="min-w-full text-sm text-left ">
              <table className="min-w-full text-sm text-left border">
                <tr>
                  <th className="border py-2 px-2 bg-green-50">Nettó végösszeg</th>
                  <th className="border py-2 px-2 bg-green-50">Bruttó végösszeg</th>
                </tr>
                <tr>
                  <td className="border py-2 px-2">{order.netAmount} Ft</td>
                  <td className="border py-2 px-2">{order.grossAmount} Ft</td>
                </tr>
              </table>
            </div>

            <div className="mt-4">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={() => onAddItemClick(order.id)}
              >
                Új tétel hozzáadása
              </button>
            </div>

            <div>
            </div>
          </div>
      </div>
    );
  };