export const Badge = ({ status }) => {
  const map = {
    "in-stock": { label: "In Stock", cls: "badge-in-stock" },
    low: { label: "Low Stock", cls: "badge-low" },
    out: { label: "Out of Stock", cls: "badge-out" },
    discontinued: { label: "Discontinued", cls: "badge-discontinued" },
  };
  const { label, cls } = map[status] || map["in-stock"];
  return <span className={`badge ${cls}`}>{label}</span>;
};
