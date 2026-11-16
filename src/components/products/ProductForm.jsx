import { useEffect, useState } from "react";
import { Field } from "../common/Field";
import { Modal } from "../common/Modal";
import { parsePriceToCents, centsToInputValue } from "../../utils/format";

const UNITS = ["pcs", "box", "kg", "L", "pack", "pair", "ream"];

export const ProductForm = ({ isOpen, onClose, onSave, initialData, categories, suppliers }) => {
  const [form, setForm] = useState({
    sku: "", name: "", categoryId: "", supplierId: "",
    unitOfMeasure: "pcs", costPrice: "", sellPrice: "", reorderLevel: "0", currentStock: "0"
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          sku: initialData.sku, name: initialData.name, categoryId: initialData.categoryId,
          supplierId: initialData.supplierId, unitOfMeasure: initialData.unitOfMeasure,
          costPrice: centsToInputValue(initialData.costPriceCents),
          sellPrice: centsToInputValue(initialData.sellPriceCents),
          reorderLevel: String(initialData.reorderLevel),
          currentStock: "" // Read-only during edit
        });
      } else {
        setForm({ sku: "", name: "", categoryId: "", supplierId: "", unitOfMeasure: "pcs", costPrice: "", sellPrice: "", reorderLevel: "0", currentStock: "0" });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert money strings to integer cents before validation
    const costPriceCents = parsePriceToCents(form.costPrice);
    const sellPriceCents = parsePriceToCents(form.sellPrice);
    
    const payload = {
      ...form,
      costPriceCents,
      sellPriceCents,
      reorderLevel: Number(form.reorderLevel),
      currentStock: Number(form.currentStock),
    };

    const result = onSave(payload);
    if (!result.ok) {
      setErrors(result.errors);
    } else {
      onClose();
    }
  };

  const catOptions = categories.map(c => ({ value: c.id, label: c.name }));
  const supOptions = suppliers.map(s => ({ value: s.id, label: s.name }));

  return (
    <Modal isOpen={isOpen} title={initialData ? "Edit Product" : "Add Product"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="form-grid" style={{ display: "grid", gap: "16px", gridTemplateColumns: "1fr 1fr" }}>
        <Field label="SKU" name="sku" value={form.sku} error={errors.sku} onChange={handleChange} placeholder="E.g. ELE-001" />
        <Field label="Name" name="name" value={form.name} error={errors.name} onChange={handleChange} />
        
        <Field label="Category" name="categoryId" type="select" value={form.categoryId} error={errors.categoryId} onChange={handleChange} options={catOptions} />
        <Field label="Supplier" name="supplierId" type="select" value={form.supplierId} error={errors.supplierId} onChange={handleChange} options={supOptions} />
        
        <Field label="Unit (pcs, kg, etc)" name="unitOfMeasure" type="select" value={form.unitOfMeasure} error={errors.unitOfMeasure} onChange={handleChange} options={UNITS.map(u => ({ value: u, label: u }))} />
        
        <div style={{ display: "flex", gap: "10px" }}>
           <Field label="Cost Price ($)" name="costPrice" value={form.costPrice} error={errors.costPriceCents} onChange={handleChange} placeholder="0.00" />
           <Field label="Sell Price ($)" name="sellPrice" value={form.sellPrice} error={errors.sellPriceCents} onChange={handleChange} placeholder="0.00" />
        </div>

        <Field label="Reorder Level" name="reorderLevel" type="number" value={form.reorderLevel} error={errors.reorderLevel} onChange={handleChange} />
        
        {!initialData && (
           <Field label="Initial Stock" name="currentStock" type="number" value={form.currentStock} error={errors.currentStock} onChange={handleChange} />
        )}

        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Save Product</button>
        </div>
      </form>
    </Modal>
  );
};
