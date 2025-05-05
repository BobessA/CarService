import React from "react";
import { ProductData } from "../../models/ProductData";

interface Props {
  product: ProductData;
  isEditing: boolean;
  onChange: (updatedProduct: Partial<ProductData>) => void;
  validationErrors: Record<string, string>;
}

const ProductDetails: React.FC<Props> = (props) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Termék adatok</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Cikkszám</label>
          <input type="text" className="w-full p-2 border rounded" 
            readOnly 
            value={props.product.productId}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Típus</label>
          <input type="text" className="w-full p-2 border rounded"
            readOnly
            value={props.product.productType === "P" ? "Termék" : "Szolgáltatás"}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Megnevezés</label>
          <input type="text" className="w-full p-2 border rounded"
            readOnly={!props.isEditing}
            value={props.product.name}
            onChange={(e) => props.onChange({ name: e.target.value })}
          />
          {props.validationErrors.name && <p className="text-red-500 text-sm mt-1">{props.validationErrors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Gyártó</label>
          <input type="text" className="w-full p-2 border rounded"
            readOnly={!props.isEditing}
            value={props.product.brand ?? ""}
            onChange={(e) => props.onChange({ brand: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Beszerzési ár</label>
          <input type="number" className="w-full p-2 border rounded"
            readOnly={!props.isEditing}
            value={props.product.purchasePrice ?? ""}
            onChange={(e) => props.onChange({ purchasePrice: parseFloat(e.target.value) || 0 })}
          />
          {props.validationErrors.purchasePrice && <p className="text-red-500 text-sm mt-1">{props.validationErrors.purchasePrice}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Eladási ár</label>
          <input type="number" className="w-full p-2 border rounded"
            readOnly={!props.isEditing}
            value={props.product.sellingPrice}
            onChange={(e) =>props.onChange({ sellingPrice: parseFloat(e.target.value) || 0 })}
          />
          {props.validationErrors.sellingPrice && <p className="text-red-500 text-sm mt-1">{props.validationErrors.sellingPrice}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Készleten</label>
          <input type="number" className="w-full p-2 border rounded"
            readOnly={!props.isEditing}
            value={props.product.stockQuantity ?? ""}
            onChange={(e) =>props.onChange({ stockQuantity: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-600 mb-1">Leírás</label>
          <textarea className="w-full p-4 border rounded bg-gray-50 whitespace-pre-line max-h-96 overflow-auto" rows={6}
            readOnly={!props.isEditing}
            value={props.product.description ?? ""}
            onChange={(e) => props.onChange({ description: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
