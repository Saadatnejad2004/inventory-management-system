import { useMemo } from "react";
import { 
  getInventoryValuationCents, 
  getTotalStockUnits, 
  getProductCount, 
  getLowStockProducts, 
  getOutOfStockProducts,
  getCategoryBreakdown,
  getMovementTrend
} from "../utils/reports";
import { formatCents } from "../utils/format";
import { Badge } from "../components/common/Badge";
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from "recharts";

const COLORS = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#8b5cf6", "#ec4899"];

export const DashboardPage = ({ inventory }) => {
  const { products, categories, movements } = inventory;

  const totalValue = useMemo(() => getInventoryValuationCents(products), [products]);
  const totalUnits = useMemo(() => getTotalStockUnits(products), [products]);
  const productCount = useMemo(() => getProductCount(products), [products]);
  const lowStock = useMemo(() => getLowStockProducts(products), [products]);
  const outOfStock = useMemo(() => getOutOfStockProducts(products), [products]);

  const categoryData = useMemo(() => {
    return getCategoryBreakdown(products, categories)
      .filter(c => c.valueCents > 0)
      .map(c => ({
        name: c.categoryName,
        value: c.valueCents / 100 // convert to dollars for chart
      }));
  }, [products, categories]);

  const trendData = useMemo(() => getMovementTrend(movements, 30), [movements]);

  return (
    <div>
      {/* 1. KPI Cards */}
      <div className="kpi-grid">
        <div className="card kpi-card">
          <span className="kpi-label">Total Inventory Value</span>
          <span className="kpi-value">{formatCents(totalValue)}</span>
          <span className="kpi-sub">At cost price</span>
        </div>
        <div className="card kpi-card">
          <span className="kpi-label">Total Stock Units</span>
          <span className="kpi-value">{totalUnits.toLocaleString()}</span>
          <span className="kpi-sub">Across {productCount} products</span>
        </div>
        <div className="card kpi-card" style={{ borderLeft: "4px solid var(--warning)" }}>
          <span className="kpi-label">Low Stock Alerts</span>
          <span className="kpi-value">{lowStock.length}</span>
          <span className="kpi-sub">Needs reordering soon</span>
        </div>
        <div className="card kpi-card" style={{ borderLeft: "4px solid var(--danger)" }}>
          <span className="kpi-label">Out of Stock</span>
          <span className="kpi-value">{outOfStock.length}</span>
          <span className="kpi-sub">Currently unavailable</span>
        </div>
      </div>

      {/* 2. Charts */}
      <div className="chart-grid">
        {/* Category Value Chart */}
        <div className="card chart-card">
          <h3 className="chart-title">Inventory Value by Category</h3>
          <div className="chart-wrapper">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: "var(--muted)" }}>No inventory data to display.</p>
            )}
          </div>
        </div>

        {/* Movement Trend */}
        <div className="card chart-card">
          <h3 className="chart-title">Movement Trend (Last 30 Days)</h3>
          <div className="chart-wrapper">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip />
                  <Bar dataKey="inQty" fill="var(--success)" name="Received (IN)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="outQty" fill="var(--danger)" name="Issued (OUT)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: "var(--muted)" }}>No recent movements.</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Actionable Lists */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Low Stock Items</h3>
          </div>
          <div className="card-body">
            {lowStock.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>All stock levels are healthy.</p>
            ) : (
              <table className="table">
                <thead><tr><th>Product</th><th>Stock</th><th>Status</th></tr></thead>
                <tbody>
                  {lowStock.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.sku}</strong><br />{p.name}</td>
                      <td>{p.currentStock} / {p.reorderLevel}</td>
                      <td><Badge status="low" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Out of Stock Items</h3>
          </div>
          <div className="card-body">
            {outOfStock.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>No products are out of stock.</p>
            ) : (
              <table className="table">
                <thead><tr><th>Product</th><th>Status</th></tr></thead>
                <tbody>
                  {outOfStock.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.sku}</strong><br />{p.name}</td>
                      <td><Badge status="out" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
