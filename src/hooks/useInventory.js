import { useTable } from "./useTable";
import { hasErrors, validateCategory, validateSupplier, validateProduct } from "../utils/validation";
import {
  STOCK_TYPES,
  validateStockOperation,
  computeDelta,
  computeResultingStock,
  verifyProductIntegrity,
} from "../utils/stock";
import { buildSampleData } from "../data/seed";

const nowIso = () => new Date().toISOString();

export const useInventory = () => {
  // ============ Tables ============
  const [categories, setCategories] = useTable("categories");
  const [suppliers, setSuppliers] = useTable("suppliers");
  const [products, setProducts] = useTable("products");
  const [movements, setMovements] = useTable("movements");

  // ============ Categories ============
  const addCategory = (values) => {
    const errors = validateCategory(values, { categories });
    if (hasErrors(errors)) return { ok: false, errors };

    const created = nowIso();
    const category = {
      id: crypto.randomUUID(),
      name: values.name.trim(),
      description: (values.description ?? "").trim(),
      createdAt: created,
    };
    setCategories((prev) => [category, ...prev]);
    return { ok: true, category };
  };

  const updateCategory = (id, values) => {
    const errors = validateCategory(values, { categories, editingId: id });
    if (hasErrors(errors)) return { ok: false, errors };

    const updated = nowIso();
    setCategories((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, name: values.name.trim(), description: (values.description ?? "").trim(), updatedAt: updated }
          : c
      )
    );
    return { ok: true };
  };

  const deleteCategory = (id) => {
    const usedByProduct = products.some((p) => p.categoryId === id);
    if (usedByProduct) {
      return { ok: false, error: "Cannot delete: this category is used by one or more products." };
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    return { ok: true };
  };

  // ============ Suppliers ============
  const addSupplier = (values) => {
    const errors = validateSupplier(values, { suppliers });
    if (hasErrors(errors)) return { ok: false, errors };

    const created = nowIso();
    const supplier = {
      id: crypto.randomUUID(),
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      address: (values.address ?? "").trim(),
      createdAt: created,
    };
    setSuppliers((prev) => [supplier, ...prev]);
    return { ok: true, supplier };
  };

  const updateSupplier = (id, values) => {
    const errors = validateSupplier(values, { suppliers, editingId: id });
    if (hasErrors(errors)) return { ok: false, errors };

    const updated = nowIso();
    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              name: values.name.trim(),
              email: values.email.trim(),
              phone: values.phone.trim(),
              address: (values.address ?? "").trim(),
              updatedAt: updated,
            }
          : s
      )
    );
    return { ok: true };
  };

  const deleteSupplier = (id) => {
    const usedByProduct = products.some((p) => p.supplierId === id);
    if (usedByProduct) {
      return { ok: false, error: "Cannot delete: this supplier is used by one or more products." };
    }
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    return { ok: true };
  };

  // ============ Products ============
  const addProduct = (values) => {
    const errors = validateProduct(values, { products, categories, suppliers });
    if (hasErrors(errors)) return { ok: false, errors };

    const created = nowIso();
    const product = {
      id: crypto.randomUUID(),
      sku: values.sku.trim().toUpperCase(),
      name: values.name.trim(),
      description: (values.description ?? "").trim(),
      categoryId: values.categoryId,
      supplierId: values.supplierId,
      unitOfMeasure: values.unitOfMeasure,
      costPriceCents: values.costPriceCents,
      sellPriceCents: values.sellPriceCents,
      reorderLevel: values.reorderLevel,
      initialStock: values.currentStock,
      currentStock: values.currentStock,
      status: "active",
      createdAt: created,
      updatedAt: created,
    };
    setProducts((prev) => [product, ...prev]);
    return { ok: true, product };
  };

  const updateProduct = (id, values) => {
    const errors = validateProduct(values, { products, categories, suppliers, editingId: id });
    if (hasErrors(errors)) return { ok: false, errors };

    const updated = nowIso();
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              sku: values.sku.trim().toUpperCase(),
              name: values.name.trim(),
              description: (values.description ?? "").trim(),
              categoryId: values.categoryId,
              supplierId: values.supplierId,
              unitOfMeasure: values.unitOfMeasure,
              costPriceCents: values.costPriceCents,
              sellPriceCents: values.sellPriceCents,
              reorderLevel: values.reorderLevel,
              updatedAt: updated,
              // NOTE: currentStock and initialStock are NOT editable here.
              // Stock only changes via recordStockOperation (audited).
            }
          : p
      )
    );
    return { ok: true };
  };

  const deleteProduct = (id) => {
    const hasMovements = movements.some((m) => m.productId === id);
    if (hasMovements) {
      return {
        ok: false,
        error: "Cannot delete: this product has stock history. Discontinue it instead to preserve the audit trail.",
      };
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    return { ok: true };
  };

  const discontinueProduct = (id) => {
    const updated = nowIso();
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "discontinued", updatedAt: updated } : p))
    );
    return { ok: true };
  };

  const reactivateProduct = (id) => {
    const updated = nowIso();
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "active", updatedAt: updated } : p))
    );
    return { ok: true };
  };

  // ============ Stock Operations ============
  const recordStockOperation = ({ productId, type, quantity, reason, note }) => {
    const product = products.find((p) => p.id === productId);
    const check = validateStockOperation(product, type, quantity, reason);
    if (!check.ok) return check;

    const previousStock = product.currentStock;
    const resultingStock = computeResultingStock(product, type, quantity);
    const delta = computeDelta(type, quantity, previousStock);
    const created = nowIso();

    const movement = {
      id: crypto.randomUUID(),
      productId,
      type,
      quantity,
      delta,
      previousStock,
      resultingStock,
      reason,
      note: (note ?? "").trim(),
      createdAt: created,
    };

    // Atomic at the application layer: both setters run in the same React
    // batch, so consumers only see the post-operation state. (In a real DB
    // this would be a transaction.)
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, currentStock: resultingStock, updatedAt: created } : p
      )
    );
    setMovements((prev) => [movement, ...prev]);

    return { ok: true, movement };
  };

  // ============ Utilities ============
  const loadSample = () => {
    const sample = buildSampleData();
    setCategories(sample.categories);
    setSuppliers(sample.suppliers);
    setProducts(sample.products);
    setMovements(sample.movements);
    return { ok: true };
  };

  const clearAll = () => {
    setCategories([]);
    setSuppliers([]);
    setProducts([]);
    setMovements([]);
    return { ok: true };
  };

  /**
   * Data-accuracy check across all products. Returns
   * { allPassed, failures: [{ sku, name, error }] }.
   */
  const verifyIntegrity = () => {
    const failures = [];
    for (const p of products) {
      const res = verifyProductIntegrity(p, movements);
      if (!res.ok) failures.push({ sku: p.sku, name: p.name, error: res.error });
    }
    return { allPassed: failures.length === 0, failures };
  };

  return {
    // data
    categories,
    suppliers,
    products,
    movements,

    // category ops
    addCategory,
    updateCategory,
    deleteCategory,

    // supplier ops
    addSupplier,
    updateSupplier,
    deleteSupplier,

    // product ops
    addProduct,
    updateProduct,
    deleteProduct,
    discontinueProduct,
    reactivateProduct,

    // stock
    recordStockOperation,

    // utilities
    loadSample,
    clearAll,
    verifyIntegrity,
  };
};
