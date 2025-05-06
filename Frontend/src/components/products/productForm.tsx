import React, { useState, useEffect } from "react";
import { eventAuthGuard } from '../../utils/authGuard'
import { ProductData } from "../../models/ProductData";
import { ProductCategoryTreeData } from "../../models/ProductCategoryTreeData";
import { validateProductData } from "../../validations/productDataValidation";

interface Props {
  categoryTree: ProductCategoryTreeData[];
  onCreateProduct: (product: ProductData) => void;
}

const ProductForm: React.FC<Props> = (props) => {
  const initialProduct: ProductData = {
    productId: '',
    name: '',
    brand: '',
    purchasePrice: 0,
    sellingPrice: 0,
    stockQuantity: 0,
    description: '',
    productType: 'P',
    categoryAssignments: []
  }
  
  const [newProduct, setNewProduct] = useState<ProductData>(initialProduct);
  const [showForm, setShowForm] = React.useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateProductData(newProduct);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    props.onCreateProduct(newProduct);
    setNewProduct(initialProduct);
    setShowForm(false);
    setErrors({});
  }

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setNewProduct(initialProduct);
    setShowForm(false);
    setErrors({});
  }

  const handleClick = () => {
    const hasPermission = eventAuthGuard([2, 4]);
    if (hasPermission) {
      setErrors({});
    } else {
      setErrors({'permission' : 'Nincs jogod új termék rögzítéséhez!'});
    }
    return hasPermission;
  }

  return (
    <section className="px-2 py-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-xl font-bold mb-4">Új termék Rögzítése</h3>
        {!showForm ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={() => {
                  const hasPermission = handleClick();
                  if (!hasPermission) return;
                  setShowForm(true);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
              >
                Termék hozzáadása
              </button>
            </div>
            {errors.permission && <p className="text-red-500 text-sm mt-1">{errors.permission}</p>}
          </div>
        ) : (   
        <form 
          onSubmit={(e) => { handleSubmit(e); }} 
          onReset={(e) => { handleReset(e); }}
          className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Cikkszám</label>
            <input type="text" className="w-full p-2 border rounded" 
              value={newProduct.productId}
              onChange={(e) => setNewProduct({ ...newProduct, productId: e.target.value })}
              required
            />
            {errors.productId && <p className="text-red-500 text-sm mt-1">{errors.productId}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Megnevezés</label>
            <input type="text" className="w-full p-2 border rounded"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              required
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Típus</label>
            <select
              className="w-full p-2 border rounded"
              value={newProduct.productType}
              onChange={(e) => setNewProduct({ ...newProduct, productType: e.target.value as 'P' | 'S' })}
              required
            >
              <option value="P">Termék</option>
              <option value="S">Szolgáltatás</option>
            </select>
            {errors.productType && <p className="text-red-500 text-sm mt-1">{errors.productType}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Gyártó</label>
            <input type="text" className="w-full p-2 border rounded"
              value={newProduct.brand ?? ""}
              onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Beszerzési ár</label>
            <input type="number" className="w-full p-2 border rounded"
              value={newProduct.purchasePrice ?? ""}
              onChange={(e) => setNewProduct({ ...newProduct, purchasePrice: parseFloat(e.target.value) || 0 })}
            />
            {errors.purchasePrice && <p className="text-red-500 text-sm mt-1">{errors.purchasePrice}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Eladási ár</label>
            <input type="number" className="w-full p-2 border rounded"
              value={newProduct.sellingPrice}
              onChange={(e) =>setNewProduct({ ...newProduct, sellingPrice: parseFloat(e.target.value) || 0 })}
              required
            />
            {errors.sellingPrice && <p className="text-red-500 text-sm mt-1">{errors.sellingPrice}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Készleten</label>
            <input type="number" className="w-full p-2 border rounded"
              value={newProduct.stockQuantity ?? ""}
              onChange={(e) =>setNewProduct({ ...newProduct, stockQuantity: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-600 mb-1">Leírás</label>
            <textarea className="w-full p-4 border rounded bg-gray-50 whitespace-pre-line max-h-96 overflow-auto" rows={6}
              value={newProduct.description ?? ""}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <button
              className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
              type="submit"
              >
              Mentés
            </button>
            <button
              className="bg-amber-600 text-white px-3 py-1 rounded-md hover:bg-amber-700"
              type="reset"
              >
              Elvetés
            </button>
          </div>
        </form>
        )}
      </div>
    </section>
  );
}

export default ProductForm