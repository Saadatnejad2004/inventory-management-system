import { useState, useMemo } from "react";
import { ProductTable } from "../components/products/ProductTable";
import { ProductForm } from "../components/products/ProductForm";
import { StockOperationModal } from "../components/products/StockOperationModal";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { getStockStatus } from "../utils/reports";

export const ProductsPage = ({ inventory, toast }) => {
  // Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [stockOpProduct, setStockOpProduct] = useState(null);
  const [stockOpType, setStockOpType] = useState("IN");

  const [deletingProduct, setDeletingProduct] = useState(null);

  // Filter State
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Derived filtered & sorted list
  const filteredProducts = useMemo(() => {
    let result = inventory.products;
    const term = search.toLowerCase().trim();

    if (term) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.sku.toLowerCase().includes(term)
      );
    }
    if (filterCat) result = result.filter(p => p.categoryId === filterCat);
    if (filterStatus) result = result.filter(p => getStockStatus(p) === filterStatus);

    // Sort
    const sorted = [...result];
    if (sortBy === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "stock-asc") sorted.sort((a, b) => a.currentStock - b.currentStock);
    else if (sortBy === "stock-desc") sorted.sort((a, b) => b.currentStock - a.currentStock);
    else if (sortBy === "value-desc") sorted.sort((a, b) => (b.costPriceCents * b.currentStock) - (a.costPriceCents * a.currentStock));
    // "newest" is default (already prepended on create)

    return sorted;
  }, [inventory.products, search, filterCat, filterStatus, sortBy]);

  // Handlers
  const handleSaveProduct = (payload) => {
    if (editingProduct) {
      const res = inventory.updateProduct(editingProduct.id, payload);
      if (res.ok) toast.addToast("Product updated", "success");
      return res;
    } else {
      const res = inventory.addProduct(payload);
      if (res.ok) toast.addToast("Product added", "success");
      return res;
    }
  };

  const handleSaveStockOp = (payload) => {
    const res = inventory.recordStockOperation(payload);
    if (res.ok) toast.addToast("Stock updated successfully", "success");
    return res;
  };

  const confirmDelete = () => {
    const res = inventory.deleteProduct(deletingProduct.id);
    if (!res.ok) {
      // The hook blocks deletion if movements exist
      if (window.confirm(`${res.error}\n\nWould you like to discontinue this product instead?`)) {
        inventory.discontinueProduct(deletingProduct.id);
        toast.addToast("Product discontinued", "success");
      }
    } else {
      toast.addToast("Product deleted", "success");
    }
    setDeletingProduct(null);
  };

  return (
    <div>
      <div className="toolbar">
        <input type="search" className="input" placeholder="Search by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} />
        
        <select className="input" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {inventory.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="in-stock">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
          <option value="discontinued">Discontinued</option>
        </select>

        <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest Added</option>
          <option value="name">Name (A-Z)</option>
          <option value="stock-asc">Stock (Low to High)</option>
          <option value="stock-desc">Stock (High to Low)</option>
          <option value="value-desc">Highest Value</option>
        </select>

        <button className="btn btn-primary" onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}>
          + Add Product
        </button>
      </div>

      <ProductTable 
        products={filteredProducts} 
        categories={inventory.categories}
        suppliers={inventory.suppliers}
        onEdit={(p) => { setEditingProduct(p); setIsProductModalOpen(true); }}
        onDelete={(p) => setDeletingProduct(p)}
        onStockOp={(p, type) => { setStockOpProduct(p); setStockOpType(type); }}
      />

      <ProductForm 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)} 
        onSave={handleSaveProduct}
        initialData={editingProduct}
        categories={inventory.categories}
        suppliers={inventory.suppliers}
      />

      <StockOperationModal 
        isOpen={!!stockOpProduct}
        onClose={() => setStockOpProduct(null)}
        product={stockOpProduct}
        initialType={stockOpType}
        onSave={handleSaveStockOp}
      />

      <ConfirmDialog 
        isOpen={!!deletingProduct}
        title="Delete Product?"
        message={`Are you sure you want to delete ${deletingProduct?.name}? If it has stock history, we will offer to discontinue it instead.`}
        isDestructive
        onConfirm={confirmDelete}
        onCancel={() => setDeletingProduct(null)}
      />
    </div>
  );
};
