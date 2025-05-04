import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import apiClient from "../../../utils/apiClient";
import { ProductData } from "../../../models/ProductData";
import { ProductCatAssignmentData } from "../../../models/ProductCatAssignmentData";
import { ProductCategoryTreeData } from "../../../models/ProductCategoryTreeData";
import ProductDetails from "../../../components/products/productDetails";
import ProductCategories from "../../../components/products/productCategories";

export const Route = createFileRoute("/admin/products/")({component: RouteComponent,});

function RouteComponent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTabs, setActiveTabs] = useState<Record<string, "product" | "categories">>({});
  const [products, setProducts] = useState<ProductData[]>([]);
  const [tempProducts, setTempProducts] = useState<{[key: string]: ProductData;}>({});
  const [catAssignments, setCategoriesAssignments] = useState<ProductCatAssignmentData[]>([]);
  const [tempCategoryAssignments, setTempCategoryAssignments] = useState<{[productId: string]: number[];}>({});
  const [categoryTree, setCategoryTree] = useState<ProductCategoryTreeData[]>([]);
  const [editingStates, setEditingStates] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      apiClient.get<ProductData[]>("/Products", user?.userId),
      apiClient.get<ProductCategoryTreeData[]>(
        "/ProductCategories/CategoryTree",
        user?.userId
      ),
      apiClient.get<ProductCatAssignmentData[]>(
        "/ProductCategories/Assignments",
        user?.userId
      ),
    ])
      .then(([productData, categoryTree, ProductCatAssignmentData]) => {
        setProducts(productData.sort((a, b) => a.name.localeCompare(b.name)));
        setCategoryTree(categoryTree);
        setCategoriesAssignments(ProductCatAssignmentData);
      })
      .catch(() => setError("Hiba az adatok betöltésekor"))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <p className="p-8 text-center">Betöltés...</p>;
  if (error) return <p className="p-8 text-center text-red-600">{error}</p>;

  const toggleExpand = (id: string) => {
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
            const found = products.find((p) => p.productId === id);
            if (found) {
              return { ...prevTemp, [id]: found };
            }
          }
          return prevTemp;
        });

        setTempCategoryAssignments((prevTemp) => {
          if (!prevTemp[id]) {
            const categoryIds = catAssignments
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

  const saveProductChanges = async (productId: string) => {
    const product = tempProducts[productId];

    if (!product) return;

    const apiPayloadProducts = {
      productId: product.productId,
      name: product.name,
      brand: product.brand,
      purchasePrice: product.purchasePrice ?? 0,
      sellingPrice: product.sellingPrice ?? 0,
      stockQuantity: product.stockQuantity,
      description: product.description,
    };

    try {
      await apiClient.put("/Products", apiPayloadProducts, user?.userId);
      saveCategoryAssignments(productId);
      console.log("Termék sikeresen mentve:", productId);
    } catch (error) {
      console.error("Hiba történt a termék mentésekor", error);
    }
  };

  const saveCategoryAssignments = async (productId: string) => {
    const currentAssignments = tempCategoryAssignments[productId] || [];
    const originalAssignments = catAssignments
      .filter((assign) => assign.productId === productId)
      .map((assign) => assign.categoryId);

    const newAssignments = currentAssignments.filter(
      (categoryId) => !originalAssignments.includes(categoryId)
    );

    if (newAssignments.length === 0) {
      console.log("Nincs mit menteni.");
      return;
    }

    const apiPayloadCatAssignments = newAssignments.map((categoryId) => ({
      productId,
      categoryId,
    }));

    try {
      await apiClient.post(
        "/ProductCategories/Assignments",
        apiPayloadCatAssignments,
        user?.userId
      );
      console.log(
        "Kategóriabesorolások sikeresen mentve:",
        apiPayloadCatAssignments
      );
    } catch (error) {
      console.error("Hiba történt a kategóriabesorolások mentésekor", error);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!productId) return;

    const confirmDelete = window.confirm(
      `Biztosan törölni szeretnéd a(z) "${productId}" terméket?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await apiClient.delete(`/Products/${productId}`, user?.userId);
      setProducts((prev) => prev.filter((p) => p.productId !== productId));
      console.log("Termék törölve", productId);
    } catch (error) {
      console.error("Hiba történt a termék törlésekor", error);
    }
  };

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
              {products.map((product) => (
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
                                  handleTabChange(
                                    product.productId,
                                    "categories"
                                  )
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
                                      console.log(
                                        "Szerkesztés gomb megnyomva a",
                                        product.productId
                                      );
                                      toggleEditing(product.productId, true);
                                    }} >
                                    Szerkesztés
                                  </button>
                                  <button
                                    className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                                    onClick={() => {
                                      console.log(
                                        "Törlés gomb megnyomva a",
                                        product.productId
                                      );
                                      deleteProduct(product.productId);
                                    }} >
                                    Törlés
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
                                    onClick={() => {
                                      console.log(
                                        "Mentés gomb megnyomva a",
                                        product.productId
                                      );
                                      const updatedProduct =
                                        tempProducts[product.productId];
                                      setProducts((prev) =>
                                        prev.map((p) =>
                                          p.productId === product.productId
                                            ? updatedProduct
                                            : p
                                        )
                                      );
                                      saveProductChanges(product.productId);
                                      toggleEditing(product.productId, false);
                                    }} >
                                    Mentés
                                  </button>
                                  <button
                                    className="bg-amber-600 text-white px-3 py-1 rounded-md hover:bg-amber-700"
                                    onClick={() => {
                                      console.log(
                                        "Elvetés gomb megnyomva a",
                                        product.productId
                                      );
                                      setTempProducts((prevTemp) => {
                                        const {
                                          [product.productId]: _,
                                          ...rest
                                        } = prevTemp;
                                        return rest;
                                      });
                                      const originalAssignments = catAssignments
                                        .filter(
                                          (assign) =>
                                            assign.productId ===
                                            product.productId
                                        )
                                        .map((assign) => assign.categoryId);

                                      setTempCategoryAssignments(
                                        (prevTemp) => ({
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
                              }} />
                          ) : (
                            <ProductCategories
                              categoryTree={categoryTree}
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
