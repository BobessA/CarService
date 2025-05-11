import { OrderItem } from '../../models/OrderItem';
import { Product } from '../../models/Product';

export const OrderItemsTable = ({ orderItems }: { orderItems: Array<OrderItem & { product?: Product }> }) => {
  return (
    <div className="mt-6 w-full overflow-x-auto">
      <p className="font-semibold mb-2">Tételek:</p>
      <table className="min-w-full text-sm text-left border">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 border">Termék ID</th>
            <th className="px-4 py-2 border">Név</th>
            <th className="px-4 py-2 border">Márka</th>
            <th className="px-4 py-2 border">Mennyiség</th>
            <th className="px-4 py-2 border">Egységár</th>
            <th className="px-4 py-2 border">Nettó</th>
            <th className="px-4 py-2 border">Bruttó</th>
            <th className="px-4 py-2 border">Megjegyzés</th>
          </tr>
        </thead>
        <tbody>
          {orderItems.map((item, idx) => (
            <tr key={idx} className="even:bg-gray-100">
              <td className="px-4 py-2 border">{item.productId}</td>
              <td className="px-4 py-2 border">{item.product?.name || "-"}</td>
              <td className="px-4 py-2 border">{item.product?.brand || "-"}</td>
              <td className="px-4 py-2 border">{item.quantity}</td>
              <td className="px-4 py-2 border">{item.unitPrice} Ft</td>
              <td className="px-4 py-2 border">{item.netAmount} Ft</td>
              <td className="px-4 py-2 border">{item.grossAmount} Ft</td>
              <td className="px-4 py-2 border">{item.comment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};