import { Badge } from "../common/Badge";
import { getStockStatus } from "../../utils/reports";
import { formatCents } from "../../utils/format";

export const ProductTable = ({ products, categories, suppliers, onEdit, onDelete, onStockOp }) => {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <h3>No products found</h3>
        <p>Try adjusting your search or filters, or add a new product.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category / Supplier</th>
            <th>Stock</th>
            <th>Value (Cost)</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const cat = categories.find(c => c.id === p.categoryId)?.name || "Unknown";
            const sup = suppliers.find(s => s.id === p.supplierId)?.name || "Unknown";
            const status = getStockStatus(p);
            const valueCents = p.costPriceCents * p.currentStock;

            return (
              <tr key={p.id}>
                <td>
                  <strong>{p.sku}</strong><br />
                  <span style={{ fontSize: "0.85rem" }}>{p.name}</span>
                </td>
                <td>
                  <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                    {cat}<br />{sup}
                  </span>
                </td>
                <td>
                  <strong>{p.currentStock}</strong> <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{p.unitOfMeasure}</span>
                </td>
                <td>{formatCents(valueCents)}</td>
                <td><Badge status={status} /></td>
                <td>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <button className="btn btn-primary btn-sm" onClick={() => onStockOp(p, "IN")}>+ In</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => onStockOp(p, "OUT")}>- Out</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => onEdit(p)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(p)}>Delete</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
