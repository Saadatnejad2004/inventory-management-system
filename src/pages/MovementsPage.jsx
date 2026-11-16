import { useState, useMemo } from "react";
import { formatDateTime } from "../utils/format";
import { STOCK_TYPE_LABELS } from "../utils/stock";

export const MovementsPage = ({ inventory }) => {
  const [filterType, setFilterType] = useState("");
  const [search, setSearch] = useState("");

  const enrichedMovements = useMemo(() => {
    const productMap = new Map(inventory.products.map((p) => [p.id, p]));
    
    return inventory.movements.map((m) => ({
      ...m,
      productName: productMap.get(m.productId)?.name || "Unknown Product",
      sku: productMap.get(m.productId)?.sku || "???",
    }));
  }, [inventory.movements, inventory.products]);

  const filtered = useMemo(() => {
    let res = enrichedMovements;
    const term = search.toLowerCase().trim();

    if (term) {
      res = res.filter(
        (m) => m.productName.toLowerCase().includes(term) || m.sku.toLowerCase().includes(term)
      );
    }
    if (filterType) res = res.filter((m) => m.type === filterType);

    return res;
  }, [enrichedMovements, search, filterType]);

  return (
    <div>
      <div className="toolbar">
        <input
          type="search"
          className="input"
          placeholder="Search by product name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="IN">Receive (IN)</option>
          <option value="OUT">Issue (OUT)</option>
          <option value="ADJUST">Adjust</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Product</th>
              <th>Type</th>
              <th>Change</th>
              <th>Snapshot (Before → After)</th>
              <th>Reason / Note</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "32px", color: "var(--muted)" }}>
                  No movements found.
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr key={m.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{formatDateTime(m.createdAt)}</td>
                  <td>
                    <strong>{m.sku}</strong><br />
                    <span style={{ fontSize: "0.85rem" }}>{m.productName}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: m.type === "IN" ? "var(--success)" : m.type === "OUT" ? "var(--danger)" : "var(--warning)" }}>
                      {STOCK_TYPE_LABELS[m.type]}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: m.delta > 0 ? "var(--success)" : "var(--danger)" }}>
                    {m.delta > 0 ? `+${m.delta}` : m.delta}
                  </td>
                  <td>
                    {m.previousStock} → <strong>{m.resultingStock}</strong>
                  </td>
                  <td>
                    <span style={{ textTransform: "capitalize" }}>{m.reason}</span>
                    {m.note && <><br /><span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{m.note}</span></>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
