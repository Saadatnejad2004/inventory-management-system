import { useMemo } from "react";
import { getValuationRows, getCategoryBreakdown } from "../utils/reports";
import { formatCents } from "../utils/format";
import { exportToCsv } from "../utils/csv";

export const ReportsPage = ({ inventory }) => {
  const rows = useMemo(
    () => getValuationRows(inventory.products, inventory.categories, inventory.suppliers),
    [inventory.products, inventory.categories, inventory.suppliers]
  );
  
  const categories = useMemo(
    () => getCategoryBreakdown(inventory.products, inventory.categories),
    [inventory.products, inventory.categories]
  );

  const handleExport = () => {
    const exportData = rows.map((r) => ({
      SKU: r.sku,
      Name: r.name,
      Category: r.categoryName,
      Supplier: r.supplierName,
      Stock: r.currentStock,
      Unit: r.unitOfMeasure,
      CostPerUnit: (r.costPriceCents / 100).toFixed(2),
      TotalCostValue: (r.costValueCents / 100).toFixed(2),
    }));
    exportToCsv("inventory-valuation", exportData);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      
      {/* Category Summary */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Value by Category</h3>
        </div>
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Products</th>
                <th>Total Units</th>
                <th>Total Value (Cost)</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.categoryId}>
                  <td><strong>{c.categoryName}</strong></td>
                  <td>{c.productCount}</td>
                  <td>{c.units}</td>
                  <td>{formatCents(c.valueCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Valuation Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Full Inventory Valuation</h3>
          <button className="btn btn-primary btn-sm" onClick={handleExport}>Export CSV</button>
        </div>
        <div className="card-body">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Unit Cost</th>
                  <th>Total Value</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.sku}</td>
                    <td>{r.name}</td>
                    <td>{r.categoryName}</td>
                    <td>{r.currentStock}</td>
                    <td>{formatCents(r.costPriceCents)}</td>
                    <td><strong>{formatCents(r.costValueCents)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
