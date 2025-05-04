import React from "react";
import { ProductData } from "../../models/ProductData";

interface Props {
  product: ProductData;
  isEditing: boolean;
  onChange: (updatedProduct: Partial<ProductData>) => void;
}

const ProductDetails: React.FC<Props> = ({ product, isEditing, onChange }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Termék adatok</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Cikkszám</label>
          <input type="text" className="w-full p-2 border rounded" 
            readOnly 
            value={product.productId}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Típus</label>
          <input type="text" className="w-full p-2 border rounded"
            readOnly
            value={product.productType === "P" ? "Termék" : "Szolgáltatás"}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Megnevezés</label>
          <input type="text" className="w-full p-2 border rounded"
            readOnly={!isEditing}
            value={product.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Gyártó</label>
          <input type="text" className="w-full p-2 border rounded"
            readOnly={!isEditing}
            value={product.brand ?? ""}
            onChange={(e) => onChange({ brand: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Beszerzési ár</label>
          <input type="number" className="w-full p-2 border rounded"
            readOnly={!isEditing}
            value={product.purchasePrice ?? ""}
            onChange={(e) => onChange({ purchasePrice: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Eladási ár</label>
          <input type="number" className="w-full p-2 border rounded"
            readOnly={!isEditing}
            value={product.sellingPrice}
            onChange={(e) =>onChange({ sellingPrice: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Készleten</label>
          <input type="number" className="w-full p-2 border rounded"
            readOnly={!isEditing}
            value={product.stockQuantity ?? ""}
            onChange={(e) =>onChange({ stockQuantity: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-600 mb-1">Leírás</label>
          <textarea className="w-full p-4 border rounded bg-gray-50 whitespace-pre-line max-h-96 overflow-auto" rows={6}
            readOnly={!isEditing}
            value={product.description ?? ""}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
