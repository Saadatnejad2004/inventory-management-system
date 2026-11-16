const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "products", label: "Inventory (Products)" },
  { id: "movements", label: "Stock Movements" },
  { id: "reports", label: "Reports" },
  { id: "settings", label: "Settings (Ref Data)" },
];

export const Sidebar = ({ activePage, onNavigate }) => (
  <aside className="sidebar">
    <div className="sidebar-header">Inventory System</div>
    <nav className="sidebar-nav">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${activePage === item.id ? "active" : ""}`}
          onClick={() => onNavigate(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  </aside>
);
