import { OrderItem } from '../../models/OrderItem';
import { Product } from '../../models/Product';
import AsyncSelect from "react-select/async";
import { createProductLoader } from "../../utils/createProductLoader";

export const AddItemModal = ({ 
  isOpen, 
  newOrderItem, 
  user,
  onClose, 
  onChange,
  onSave,
}: {
  isOpen: boolean;
  newOrderItem: OrderItem;
  user: any;
  products: Product[];
  onClose: () => void;
  onChange: (item: OrderItem) => void;
  onSave: () => void;
  
}) => {
  if (!isOpen) return null;

  const handleChange = (updates: Partial<OrderItem>) => {
    const updatedItem = { ...newOrderItem, ...updates };
    
    // Calculate amounts when quantity or unitPrice changes
    if ('quantity' in updates || 'unitPrice' in updates) {
      updatedItem.netAmount = parseFloat((updatedItem.unitPrice * updatedItem.quantity).toFixed(2));
      updatedItem.grossAmount = parseFloat((updatedItem.netAmount * 1.27).toFixed(2));
    }

    onChange(updatedItem);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Új rendelési tétel hozzáadása</h2>
        
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rendelés ID
          </label>
          <input
            type="number"
            className="w-full border px-3 py-2 rounded bg-gray-100 cursor-not-allowed"
            value={newOrderItem.orderId}
            readOnly
          />



            <label className="block text-sm font-medium text-gray-700 mb-1">
              Termék
            </label>
              <AsyncSelect
                cacheOptions
                loadOptions={createProductLoader(user.userId)}
                defaultOptions
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    handleChange({
                      productId: selectedOption.value,
                      unitPrice: selectedOption.sellingPrice // Add this line
                    });
                  }
                }}
                placeholder="Keresés terméknévre..."
              />
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mennyiség
          </label>
          <input
            type="number" 
            placeholder="Mennyiség"
            className="w-full border px-3 py-2 rounded"
            value={newOrderItem.quantity}
            onChange={e => handleChange({ quantity: Number(e.target.value) })}
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Egységár
          </label>
            <input
              type="number"
              placeholder="Egységár"
              className="w-full border px-3 py-2 rounded"
              value={newOrderItem.unitPrice}
              onChange={e => handleChange({ unitPrice: Number(e.target.value) })}
            />
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nettó összeg
          </label>
          <input
            type="number"
            className="w-full border px-3 py-2 rounded bg-gray-100 cursor-not-allowed"
            value={newOrderItem.netAmount || 0}
            readOnly
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bruttó összeg (27% ÁFA)
          </label>
          <input
            type="number"
            className="w-full border px-3 py-2 rounded bg-gray-100 cursor-not-allowed"
            value={newOrderItem.grossAmount || 0}
            readOnly
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Megjegyzés
          </label>
          <input
            type="text"
            placeholder="Megjegyzés"
            className="w-full border px-3 py-2 rounded"
            value={newOrderItem.comment}
            onChange={e => onChange({...newOrderItem, comment: e.target.value})}
          />
        </div>

        <div className="flex justify-end mt-6 gap-2">
          <button
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={onClose}
          >
            Mégse
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={onSave}
          >
            Mentés
          </button>
        </div>
      </div>
    </div>
  );
};