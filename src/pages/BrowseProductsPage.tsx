import { useState } from "react";
import "react-loading-skeleton/dist/skeleton.css";
import CategorySelector from "../components/CategorySelector";
import ProductsTable from "../components/ProductTable";

function BrowseProducts() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >();

  return (
    <div>
      <h1>Products</h1>
      <div className="max-w-xs">
        <CategorySelector
          onChange={(categoryId) => setSelectedCategoryId(categoryId)}
        />
      </div>
      <ProductsTable selectedCategoryId={selectedCategoryId} />
    </div>
  );
}

export default BrowseProducts;
