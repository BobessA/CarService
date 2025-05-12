  import { OrderHeadersDTO } from '../../models/OrderHeadersDTO'
  import { OrderItem } from '../../models/OrderItem';
  import { Product } from '../../models/Product';
  import { OrderItemsTable } from "./OrderItemsTable";
  import { OfferDTO } from '../../models/offerDTO';
  import User from "../../models/User";
  import apiClient from "../../utils/apiClient";
  import { useEffect, useState } from "react";

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

      useEffect(() => {
      const loadUserData = async () => {
        const data = await fetchUserData(order.customerId, order.agentId, order.mechanicId, currUserId );
        setUserData(data);
      };

      loadUserData();
    }, [order.customerId, order.agentId, order.mechanicId]);

    return (
      
      <div className="bg-gray-50 border rounded p-3">
          <p>feriakiraj</p>
          <p>Megrendelő:</p>
          <p>
            {userData?.customer ? userData.customer.name : 'N/A'}
          </p>
          <p>Ügyintéző:</p>
          <p>
            {userData?.agent ? userData.agent.name : 'N/A'}
          </p>
          <p>Szerelő:</p>
          <p>
            {userData?.mechanic ? userData.mechanic.name : 'N/A'}
          </p>


          <div className="mt-6 w-full overflow-x-auto">
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
      </div>
    );
  };