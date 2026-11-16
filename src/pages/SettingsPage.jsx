import { useState } from "react";
import { Field } from "../components/common/Field";
import { ConfirmDialog } from "../components/common/ConfirmDialog";

export const SettingsPage = ({ inventory, toast }) => {
  // --- Category State ---
  const [catForm, setCatForm] = useState({ name: "", description: "" });
  const [catErrors, setCatErrors] = useState({});
  const [editingCatId, setEditingCatId] = useState(null);
  const [deletingCatId, setDeletingCatId] = useState(null);

  // --- Supplier State ---
  const [supForm, setSupForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [supErrors, setSupErrors] = useState({});
  const [editingSupId, setEditingSupId] = useState(null);
  const [deletingSupId, setDeletingSupId] = useState(null);

  // ============ Category Handlers ============
  const handleCatSubmit = (e) => {
    e.preventDefault();
    const result = editingCatId
      ? inventory.updateCategory(editingCatId, catForm)
      : inventory.addCategory(catForm);

    if (!result.ok) {
      setCatErrors(result.errors);
      toast.addToast("Please fix category errors", "error");
      return;
    }
    setCatForm({ name: "", description: "" });
    setEditingCatId(null);
    setCatErrors({});
    toast.addToast(`Category ${editingCatId ? "updated" : "added"}`, "success");
  };

  const handleCatEdit = (cat) => {
    setCatForm({ name: cat.name, description: cat.description || "" });
    setEditingCatId(cat.id);
    setCatErrors({});
  };

  const confirmDeleteCat = () => {
    const result = inventory.deleteCategory(deletingCatId);
    if (!result.ok) {
      toast.addToast(result.error, "error");
    } else {
      toast.addToast("Category deleted", "success");
    }
    setDeletingCatId(null);
  };

  // ============ Supplier Handlers ============
  const handleSupSubmit = (e) => {
    e.preventDefault();
    const result = editingSupId
      ? inventory.updateSupplier(editingSupId, supForm)
      : inventory.addSupplier(supForm);

    if (!result.ok) {
      setSupErrors(result.errors);
      toast.addToast("Please fix supplier errors", "error");
      return;
    }
    setSupForm({ name: "", email: "", phone: "", address: "" });
    setEditingSupId(null);
    setSupErrors({});
    toast.addToast(`Supplier ${editingSupId ? "updated" : "added"}`, "success");
  };

  const handleSupEdit = (sup) => {
    setSupForm({ name: sup.name, email: sup.email, phone: sup.phone, address: sup.address || "" });
    setEditingSupId(sup.id);
    setSupErrors({});
  };

  const confirmDeleteSup = () => {
    const result = inventory.deleteSupplier(deletingSupId);
    if (!result.ok) {
      toast.addToast(result.error, "error");
    } else {
      toast.addToast("Supplier deleted", "success");
    }
    setDeletingSupId(null);
  };

  return (
    <div className="grid-2">
      {/* ================= CATEGORIES ================= */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Categories</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleCatSubmit} style={{ marginBottom: "24px", display: "flex", gap: "10px", flexDirection: "column" }}>
            <Field label="Category Name" name="name" value={catForm.name} error={catErrors.name} onChange={(n, v) => setCatForm({ ...catForm, [n]: v })} />
            <Field label="Description (Optional)" name="description" value={catForm.description} error={catErrors.description} onChange={(n, v) => setCatForm({ ...catForm, [n]: v })} />
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" className="btn btn-primary">{editingCatId ? "Save Changes" : "Add Category"}</button>
              {editingCatId && <button type="button" className="btn btn-ghost" onClick={() => { setEditingCatId(null); setCatForm({ name: "", description: "" }); setCatErrors({}); }}>Cancel</button>}
            </div>
          </form>

          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Name</th><th>Actions</th></tr></thead>
              <tbody>
                {inventory.categories.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong><br /><span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{c.description}</span></td>
                    <td className="actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => handleCatEdit(c)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeletingCatId(c.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= SUPPLIERS ================= */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Suppliers</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSupSubmit} style={{ marginBottom: "24px", display: "flex", gap: "10px", flexDirection: "column" }}>
            <Field label="Supplier Name" name="name" value={supForm.name} error={supErrors.name} onChange={(n, v) => setSupForm({ ...supForm, [n]: v })} />
            <Field label="Email" name="email" type="email" value={supForm.email} error={supErrors.email} onChange={(n, v) => setSupForm({ ...supForm, [n]: v })} />
            <Field label="Phone" name="phone" value={supForm.phone} error={supErrors.phone} onChange={(n, v) => setSupForm({ ...supForm, [n]: v })} />
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" className="btn btn-primary">{editingSupId ? "Save Changes" : "Add Supplier"}</button>
              {editingSupId && <button type="button" className="btn btn-ghost" onClick={() => { setEditingSupId(null); setSupForm({ name: "", email: "", phone: "", address: "" }); setSupErrors({}); }}>Cancel</button>}
            </div>
          </form>

          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Name</th><th>Contact</th><th>Actions</th></tr></thead>
              <tbody>
                {inventory.suppliers.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.name}</strong></td>
                    <td><span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{s.email}<br />{s.phone}</span></td>
                    <td className="actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => handleSupEdit(s)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeletingSupId(s.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmations */}
      <ConfirmDialog isOpen={!!deletingCatId} title="Delete Category?" message="Are you sure? This will fail if products are assigned to it." isDestructive onConfirm={confirmDeleteCat} onCancel={() => setDeletingCatId(null)} />
      <ConfirmDialog isOpen={!!deletingSupId} title="Delete Supplier?" message="Are you sure? This will fail if products are assigned to it." isDestructive onConfirm={confirmDeleteSup} onCancel={() => setDeletingSupId(null)} />
    </div>
  );
};
