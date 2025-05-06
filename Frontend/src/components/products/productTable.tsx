import React, { useState } from "react";
import { eventAuthGuard } from '../../utils/authGuard'
import { ProductData } from "../../models/ProductData";
import { ProductCatAssignmentData } from "../../models/ProductCatAssignmentData";
import { ProductCategoryTreeData } from "../../models/ProductCategoryTreeData";
import ProductDetails from "../../components/products/productDetails";
import ProductCategories from "../../components/products/productCategories";
import { validateProductData } from "../../validations/productDataValidation";

interface Props {
  products: ProductData[];
  categoryTree: ProductCategoryTreeData[];
  catAssignments: ProductCatAssignmentData[];
  onSaveProduct: (productId: string, product: ProductData, currentAssignments: number[]) => void;
  onDeleteProduct: (productId: string) => void;
}

const ProductTable: React.FC<Props> = (props) => {

  const [activeTabs, setActiveTabs] = useState<Record<string, "product" | "categories">>({});
  const [tempProducts, setTempProducts] = useState<{[key: string]: ProductData;}>({});
  const [tempCategoryAssignments, setTempCategoryAssignments] = useState<{[productId: string]: number[];}>({});
  const [editingStates, setEditingStates] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const toggleExpand = (id: string) => {
    setErrors({});
    setExpanded((prev) => {
      const nxt = new Set<string>();

      if (prev.has(id)) {
        setTempProducts((prevTemp) => {
          const newTemp = { ...prevTemp };
          delete newTemp[id];
          return newTemp;
        });

        setTempCategoryAssignments((prevTemp) => {
          const newTemp = { ...prevTemp };
          delete newTemp[id];
          return newTemp;
        });

        toggleEditing(id, false);

        return nxt;
      } else {
        prev.forEach((openId) => {
          setTempProducts((prevTemp) => {
            const newTemp = { ...prevTemp };
            delete newTemp[openId];
            return newTemp;
          });
          setTempCategoryAssignments((prevTemp) => {
            const newTemp = { ...prevTemp };
            delete newTemp[openId];
            return newTemp;
          });
          toggleEditing(openId, false);
        });

        nxt.add(id);

        setTempProducts((prevTemp) => {
          if (!prevTemp[id]) {
            const found = props.products.find((p) => p.productId === id);
            if (found) {
              return { ...prevTemp, [id]: found };
            }
          }
          return prevTemp;
        });

        setTempCategoryAssignments((prevTemp) => {
          if (!prevTemp[id]) {
            const categoryIds = props.catAssignments
              .filter((assign) => assign.productId === id)
              .map((assign) => assign.categoryId);
            return { ...prevTemp, [id]: categoryIds };
          }
          return prevTemp;
        });

        return nxt;
      }
    });
  };

  const handleTabChange = (
    productId: string,
    tab: "product" | "categories"
  ) => {
    setActiveTabs((prev) => ({ ...prev, [productId]: tab }));
  };

  const toggleEditing = (productId: string, isEditing: boolean) => {
    setEditingStates((prev) => ({ ...prev, [productId]: isEditing }));
  };

  const handleCategoryToggle = (productId: string, categoryId: number) => {
    setTempCategoryAssignments((prev) => {
      const current = prev[productId] || [];
      const isSelected = current.includes(categoryId);
      let updated: number[];

      if (isSelected) {
        updated = current.filter((id) => id !== categoryId);
      } else {
        updated = [...current, categoryId];
      }

      return { ...prev, [productId]: updated };
    });
  };

  const handleSubmit = (tempProducts: ProductData) => {
    const validationErrors = validateProductData(tempProducts);
    const currentAssignments = tempCategoryAssignments[tempProducts.productId] || [];

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    toggleEditing(tempProducts.productId, false);
    setErrors({});
    props.onSaveProduct(tempProducts.productId, tempProducts, currentAssignments);
  }

  const handleClick = (errorMessage: string) => {
      const hasPermission = eventAuthGuard([2, 4]);
      if (hasPermission) {
        setErrors({});
      } else {
        setErrors({'permission' : errorMessage});
      }
      return hasPermission;
  }

  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-6">Termékkezelés</h2>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-2" />
                <th className="px-4 py-2">Cikkszám</th>
                <th className="px-4 py-2">Megnevezés</th>
                <th className="px-4 py-2">Típus</th>
                <th className="px-4 py-2">Gyártó</th>
                <th className="px-4 py-2">Eladási ár (Ft)</th>
                <th className="px-4 py-2">Készleten (db)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {props.products.map((product) => (
                <React.Fragment key={product.productId}>
                  <tr
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleExpand(product.productId)} >
                    <td className="px-2 py-2 text-center"><span>{expanded.has(product.productId) ? "−" : "+"}</span></td>
                    <td className="px-4 py-2">{product.productId}</td>
                    <td className="px-4 py-2">{product.name}</td>
                    <td className="px-4 py-2">{product.productType == "P" ? "Termék" : "Szolgáltatás"}</td>
                    <td className="px-4 py-2">{product.brand}</td>
                    <td className="px-4 py-2">{product.sellingPrice}</td>
                    <td className="px-4 py-2">{product.stockQuantity}</td>
                  </tr>
                  {expanded.has(product.productId) && (
                    <tr className="bg-gray-50">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="text-gray-700">
                          <div className="flex border-b mb-4 justify-between items-center">
                            <div>
                              <button
                                className={`px-4 py-2 text-sm font-medium ${
                                  (activeTabs[product.productId] ??
                                    "product") === "product"
                                    ? "border-b-2 border-blue-500 text-blue-500"
                                    : "text-gray-500"
                                }`} onClick={() =>
                                  handleTabChange(product.productId, "product")
                                } >
                                Cikk adatok
                              </button>
                              <button
                                className={`px-4 py-2 text-sm font-medium ${
                                  activeTabs[product.productId] === "categories"
                                    ? "border-b-2 border-blue-500 text-blue-500"
                                    : "text-gray-500"
                                }`} onClick={() =>
                                  handleTabChange(product.productId, "categories")
                                } >
                                Termékkategóriák
                              </button>
                            </div>
                            <div className="flex gap-2">
                              {!editingStates[product.productId] ? (
                                <>
                                  <button
                                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                                    onClick={() => {
                                      const hasPermission = handleClick('Nincs jogod termékek szerkesztéséhez!');
                                      if (!hasPermission) return;
                                      toggleEditing(product.productId, true);
                                    }} >
                                    Szerkesztés
                                  </button>
                                  <button
                                    className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                                    onClick={() => {
                                      const hasPermission = handleClick('Nincs jogod termékek törléséhez!');
                                      if (!hasPermission) return;
                                      props.onDeleteProduct(product.productId);
                                    }} >
                                    Törlés
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
                                    onClick={() => {
                                      const updatedProduct = tempProducts[product.productId];
                                      const hasPermission = handleClick('Nincs jogod termékek szerkesztéséhez!');
                                      if (!hasPermission) return;
                                      handleSubmit(updatedProduct);
                                    }} >
                                    Mentés
                                  </button>
                                  <button
                                    className="bg-amber-600 text-white px-3 py-1 rounded-md hover:bg-amber-700"
                                    onClick={() => {
                                      setTempProducts((prevTemp) => {
                                        const { [product.productId]: _, ...rest } = prevTemp;
                                        return rest;
                                      });
                                      const originalAssignments = props.catAssignments
                                        .filter(
                                          (assign) =>
                                            assign.productId ===
                                            product.productId
                                        )
                                        .map((assign) => assign.categoryId);

                                      setTempCategoryAssignments((prevTemp) => ({
                                          ...prevTemp,
                                          [product.productId]:
                                            originalAssignments,
                                        })
                                      );
                                      toggleEditing(product.productId, false);
                                    }} >
                                    Elvetés
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          {errors.permission && <p className="text-red-500 text-sm mt-1">{errors.permission}</p>}
                          {(activeTabs[product.productId] ?? "product") ===
                          "product" ? (
                            <ProductDetails
                              product={
                                tempProducts[product.productId] ?? product
                              }
                              isEditing={editingStates[product.productId]}
                              onChange={(changes) => {
                                setTempProducts((prev) => ({
                                  ...prev,[product.productId]: {
                                    ...prev[product.productId],
                                    ...changes,
                                  },
                                }));
                              }} 
                              validationErrors={errors}/>
                          ) : (
                            <ProductCategories
                              categoryTree={props.categoryTree}
                              selectedCategories={tempCategoryAssignments[product.productId] ?? []}
                              isEditing={editingStates[product.productId]}
                              onCategoryToggle={(categoryId) =>
                                handleCategoryToggle(
                                  product.productId,
                                  categoryId
                                )
                              } />
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default ProductTable;