import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import apiClient from "../../../utils/apiClient";
import { ProductData } from "../../../models/ProductData";
import { ProductCatAssignmentData } from "../../../models/ProductCatAssignmentData";
import { ProductCategoryTreeData } from "../../../models/ProductCategoryTreeData";
import ProductTable from "../../../components/products/productTable";
import ProductForm from "../../../components/products/productForm";

export const Route = createFileRoute("/admin/products/")({component: RouteComponent,});

function RouteComponent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [catAssignments, setCategoriesAssignments] = useState<ProductCatAssignmentData[]>([]);
  const [categoryTree, setCategoryTree] = useState<ProductCategoryTreeData[]>([]);
  const [error, setError] = useState<string | null>(null);
  

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

  const updateFromBackend = async () => {
    try {
      const response = await apiClient.get<ProductCatAssignmentData[]>(
        "/ProductCategories/Assignments",
        user?.userId
      );
      setCategoriesAssignments(response);
    } catch (error) {
      
    }
  };

  const onSaveProductChanges = async (productId: string, updatedProduct: ProductData, currentAssignments: number[] ) => {
    const product = updatedProduct;

    if (!product) return;

    const apiPayloadProducts = {
      productId: product.productId,
      name: product.name,
      brand: product.brand,
      purchasePrice: product.purchasePrice ?? 0,
      sellingPrice: product.sellingPrice ?? 0,
      stockQuantity: product.stockQuantity,
      description: product.description,
      categoryAssignments: currentAssignments
    };
    
    try {
      await apiClient.put("/Products", apiPayloadProducts, user?.userId);
      console.log("Termék sikeresen mentve:", productId);
    } catch (error) {
      console.error("Hiba történt a termék mentésekor", error);
    }
    updateFromBackend();
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

  const createProduct = async (newProduct: ProductData) => {
    const product = newProduct;

    if (!product) return;

    const apiPayloadProducts = {
      productId: product.productId,
      name: product.name,
      productType: product.productType,
      brand: product.brand,
      purchasePrice: product.purchasePrice ?? 0,
      sellingPrice: product.sellingPrice ?? 0,
      stockQuantity: product.stockQuantity,
      description: product.description,
    };

    try {
      await apiClient.post("/Products", apiPayloadProducts, user?.userId);
      setProducts((prev) => [...prev, product]);
      console.log("Termék sikeresen mentve:");
    } catch (error) {
      console.error("Hiba történt a termék mentésekor", error);
    }
  }

  return (
    <div className="flex gap-4 p-4">
      {/* A táblázat */}
      <div className="w-3/4">
        <ProductTable 
          products={products} 
          categoryTree={categoryTree} 
          catAssignments={catAssignments}
          onSaveProduct={(productId, updatedProduct, currentAssignments) =>  {
            setProducts((prev) =>
              prev.map((p) =>
                p.productId === productId ? updatedProduct : p
              )
            );
            onSaveProductChanges(productId, updatedProduct, currentAssignments)}
          }
          onDeleteProduct={(productId) => {
            deleteProduct(productId)}
          }/>
      </div>

      {/* Új cikk form */}
      <div className="w-1/4">
        <ProductForm 
          categoryTree={categoryTree} 
          onCreateProduct={(newProduct) => {
            createProduct(newProduct);
          }}
        />
      </div>
    </div>
  );
}
