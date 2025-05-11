import { OrderHeadersDTO } from '../../models/OrderHeadersDTO'
import { OrderItem } from '../../models/OrderItem';
import { Product } from '../../models/Product';
import { OrderItemsTable } from "./OrderItemsTable";
import { OfferDTO } from '../../models/offerDTO';

export const OrderDetails = ({ 
  order, 
  selectedOffer, 
  orderItems, 
  onAddItemClick 
}: {
  order: OrderHeadersDTO;
  selectedOffer: OfferDTO | null;
  orderItems?: Array<OrderItem & { product?: Product }>;
  onAddItemClick: (orderId: number) => void;
}) => {
  return (
    <tr className="bg-gray-50">
      
      <td colSpan={Object.keys(order).length} className="px-4 py-4">

        <div className="mt-6 w-full overflow-x-auto">
          <div className="mb-3">
            <label className="form-label fw-bold">Probléma leírása:</label>
            <textarea
              className="form-control"
              value={selectedOffer?.issueDescription || '–'}
              readOnly
              rows={3}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Adminisztrátor komment:</label>
            <textarea
              className="form-control"
              value={selectedOffer?.adminComment || '–'}
              readOnly
              rows={2}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Rendeléshez tartozó komment:</label>
            <textarea
              className="form-control"
              value={order.comment || '–'}
              readOnly
              rows={2}
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
      </td>
    </tr>
  );
};