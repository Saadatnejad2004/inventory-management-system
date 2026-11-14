export const getActiveProducts = (products) => products.filter((p) => p.status === "active");

export const getStockStatus = (product) => {
  if (product.status === "discontinued") return "discontinued";
  if (product.currentStock === 0) return "out";
  if (product.currentStock <= product.reorderLevel) return "low";
  return "in-stock";
};

export const getInventoryValuationCents = (products) =>
  getActiveProducts(products).reduce((sum, p) => sum + p.costPriceCents * p.currentStock, 0);

export const getRetailValueCents = (products) =>
  getActiveProducts(products).reduce((sum, p) => sum + p.sellPriceCents * p.currentStock, 0);

export const getTotalStockUnits = (products) =>
  getActiveProducts(products).reduce((sum, p) => sum + p.currentStock, 0);

export const getProductCount = (products) => getActiveProducts(products).length;

export const getLowStockProducts = (products) =>
  getActiveProducts(products)
    .filter((p) => p.currentStock > 0 && p.currentStock <= p.reorderLevel)
    .sort((a, b) => a.currentStock - b.currentStock);

export const getOutOfStockProducts = (products) =>
  getActiveProducts(products)
    .filter((p) => p.currentStock === 0)
    .sort((a, b) => a.name.localeCompare(b.name));

/**
 * Value of inventory grouped by category. Sorted descending by value.
 */
export const getCategoryBreakdown = (products, categories) => {
  const active = getActiveProducts(products);
  return categories
    .map((cat) => {
      const rows = active.filter((p) => p.categoryId === cat.id);
      const valueCents = rows.reduce((s, p) => s + p.costPriceCents * p.currentStock, 0);
      const units = rows.reduce((s, p) => s + p.currentStock, 0);
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        productCount: rows.length,
        units,
        valueCents,
      };
    })
    .sort((a, b) => b.valueCents - a.valueCents);
};

/**
 * Movement trend over the last N days.
 * Returns [{ date: "YYYY-MM-DD", inQty, outQty, adjustNet }], sorted ascending by date.
 */
export const getMovementTrend = (movements, days = 30) => {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const byDate = new Map();

  for (const m of movements) {
    const t = new Date(m.createdAt).getTime();
    if (t < cutoff) continue;
    const date = m.createdAt.slice(0, 10);
    if (!byDate.has(date)) byDate.set(date, { date, inQty: 0, outQty: 0, adjustNet: 0 });
    const row = byDate.get(date);
    if (m.type === "IN") row.inQty += m.quantity;
    else if (m.type === "OUT") row.outQty += m.quantity;
    else row.adjustNet += m.delta;
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Full valuation table used by the Reports page. Joins product + category + supplier.
 */
export const getValuationRows = (products, categories, suppliers) => {
  return getActiveProducts(products)
    .map((p) => {
      const cat = categories.find((c) => c.id === p.categoryId);
      const sup = suppliers.find((s) => s.id === p.supplierId);
      return {
        ...p,
        categoryName: cat?.name ?? "(deleted)",
        supplierName: sup?.name ?? "(deleted)",
        costValueCents: p.costPriceCents * p.currentStock,
        retailValueCents: p.sellPriceCents * p.currentStock,
        stockStatus: getStockStatus(p),
      };
    })
    .sort((a, b) => b.costValueCents - a.costValueCents);
};
