import React from "react";
import { ProductCategoryTreeData } from "../../models/ProductCategoryTreeData";

interface Props {
  categoryTree: ProductCategoryTreeData[];
  selectedCategories: number[];
  isEditing: boolean;
  onCategoryToggle: (categoryId: number) => void;
}

const ProductCategories: React.FC<Props> = ({categoryTree, selectedCategories, isEditing, onCategoryToggle}) => {
  const handleCategoryClick = (categoryId: number) => {
    if (!isEditing) return;
    onCategoryToggle(categoryId);
  };

  const buildCategoryTreeElements = (
    categories: ProductCategoryTreeData[],
    parentId: number | null = null,
    level: number = 0
  ): React.ReactNode => {
    return categories
      .filter((cat) => cat.parentId === parentId)
      .map((cat) => {
        const isSelected = selectedCategories.includes(cat.categoryId);
        const children = buildCategoryTreeElements(
          categories,
          cat.categoryId,
          level + 1
        );

        return (
          <div key={cat.categoryId} className="ml-1">
            <div
              className={`cursor-pointer inline-block p-1 ${
                isSelected ? "text-green-600 font-semibold" : ""
              } ${!isEditing ? "opacity-50 cursor-default" : ""}`}
              onClick={() => handleCategoryClick(cat.categoryId)}
              style={{ marginLeft: `${level * 1}rem` }} >
              - {cat.categoryName}
            </div>
            {children}
          </div>
        );
      });
  };

  const buildFilteredCategoryTreeElements = (
    categories: ProductCategoryTreeData[],
    targetCategoryIds: number[],
    parentId: number | null = null,
    level: number = 0
  ): React.ReactNode => {
    return categories
      .filter(
        (cat) =>
          cat.parentId === parentId &&
          targetCategoryIds.includes(cat.categoryId)
      )
      .map((cat) => {
        const children = buildFilteredCategoryTreeElements(
          categories,
          targetCategoryIds,
          cat.categoryId,
          level + 1
        );

        return (
          <div key={cat.categoryId} className="ml-1">
            <div
              className="inline-block p-1 text-green-600 font-semibold"
              style={{ marginLeft: `${level * 1}rem` }} >
              - {cat.categoryName}
            </div>
            {children}
          </div>
        );
      });
  };

  const buildFilteredCategoryTreeText = (
    categories: ProductCategoryTreeData[],
    targetCategoryIds: number[],
    parentId: number | null = null,
    level: number = 0
  ): string => {
    return categories
      .filter((cat) => cat.parentId === parentId)
      .map((cat) => {
        const children = buildFilteredCategoryTreeText(
          categories,
          targetCategoryIds,
          cat.categoryId,
          level + 1
        );
        const isInTarget = targetCategoryIds.includes(cat.categoryId);

        if (isInTarget || children.trim() !== "") {
          const indent = "   ".repeat(level);
          return `${indent}- ${cat.categoryName}\n${children}`;
        }
        return "";
      })
      .join("");
  };

  //const productCategoryIds = selectedCategories
  //    .filter(assign => assign.productId === productId)
  //    .map(assign => assign.categoryId);

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Termékkategóriák</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Teljes kategóriafa
          </label>
          <div
            className="w-full h-96 p-2 border rounded bg-gray-50 font-mono text-sm overflow-y-auto"
            style={{ whiteSpace: "pre" }} >
            {buildCategoryTreeElements(categoryTree)}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Jelenlegi besorolások
          </label>
          <div
            className="w-full h-96 p-2 border rounded bg-gray-50 font-mono text-sm overflow-y-auto"
            style={{ whiteSpace: "pre" }} >
            {buildFilteredCategoryTreeElements(
              categoryTree,
              selectedCategories
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCategories;
