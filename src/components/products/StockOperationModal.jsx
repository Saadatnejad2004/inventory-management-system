import { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Field } from "../common/Field";
import { STOCK_TYPES, REASONS, REASON_LABELS, STOCK_TYPE_LABELS } from "../../utils/stock";

export const StockOperationModal = ({ isOpen, onClose, product, initialType, onSave }) => {
  const [type, setType] = useState(initialType || STOCK_TYPES.IN);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setType(initialType || STOCK_TYPES.IN);
      setQuantity("");
      setReason(REASONS[initialType || STOCK_TYPES.IN][0]);
      setNote("");
      setError("");
    }
  }, [isOpen, initialType]);

  const handleTypeChange = (newType) => {
    setType(newType);
    setReason(REASONS[newType][0]);
    setError("");
    setQuantity("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = Number(quantity);
    const result = onSave({ productId: product.id, type, quantity: qty, reason, note });
    if (!result.ok) {
      setError(result.error);
    } else {
      onClose();
    }
  };

  if (!product) return null;

  const reasonOptions = REASONS[type].map(r => ({ value: r, label: REASON_LABELS[r] }));
  const isAdjust = type === STOCK_TYPES.ADJUST;

  return (
    <Modal isOpen={isOpen} title={`${STOCK_TYPE_LABELS[type]} Stock`} onClose={onClose}>
      <div style={{ marginBottom: "16px", background: "var(--bg)", padding: "12px", borderRadius: "6px" }}>
        <strong>{product.name}</strong> (SKU: {product.sku})<br />
        Current Stock: <strong>{product.currentStock} {product.unitOfMeasure}</strong>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <button type="button" className={`btn ${type === STOCK_TYPES.IN ? "btn-primary" : "btn-ghost"}`} onClick={() => handleTypeChange(STOCK_TYPES.IN)}>Receive (IN)</button>
          <button type="button" className={`btn ${type === STOCK_TYPES.OUT ? "btn-primary" : "btn-ghost"}`} onClick={() => handleTypeChange(STOCK_TYPES.OUT)}>Issue (OUT)</button>
          <button type="button" className={`btn ${type === STOCK_TYPES.ADJUST ? "btn-primary" : "btn-ghost"}`} onClick={() => handleTypeChange(STOCK_TYPES.ADJUST)}>Adjust</button>
        </div>

        <Field 
          label={isAdjust ? "New Stock Level (Target)" : "Quantity"} 
          name="quantity" 
          type="number" 
          value={quantity} 
          onChange={(n, v) => { setQuantity(v); setError(""); }} 
        />
        
        <Field label="Reason" name="reason" type="select" value={reason} onChange={(n, v) => setReason(v)} options={reasonOptions} />
        <Field label="Note (Optional)" name="note" value={note} onChange={(n, v) => setNote(v)} />

        {error && <p style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{error}</p>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Confirm {STOCK_TYPE_LABELS[type]}</button>
        </div>
      </form>
    </Modal>
  );
};
