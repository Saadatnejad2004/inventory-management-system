export const hasErrors = (errors) => Object.keys(errors).length > 0;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?\d{7,15}$/;
const SKU_RE = /^[A-Z0-9][A-Z0-9-]{1,18}[A-Z0-9]$/;
const NAME_RE = /^[\p{L}][\p{L}\s.'-]*$/u;

// ---------------- Categories ----------------
export const validateCategory = (values, { categories, editingId = null }) => {
  const errors = {};
  const name = (values.name ?? "").trim();
  if (!name) {
    errors.name = "Category name is required.";
  } else if (name.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (name.length > 60) {
    errors.name = "Name must be 60 characters or fewer.";
  } else {
    const duplicate = categories.find(
      (c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== editingId
    );
    if (duplicate) errors.name = "A category with this name already exists.";
  }
  if ((values.description ?? "").length > 300) {
    errors.description = "Description must be 300 characters or fewer.";
  }
  return errors;
};

// ---------------- Suppliers ----------------
export const validateSupplier = (values, { suppliers, editingId = null }) => {
  const errors = {};

  const name = (values.name ?? "").trim();
  if (!name) {
    errors.name = "Supplier name is required.";
  } else if (name.length > 80) {
    errors.name = "Name must be 80 characters or fewer.";
  } else if (!NAME_RE.test(name)) {
    errors.name = "Name contains invalid characters.";
  } else {
    const duplicate = suppliers.find(
      (s) => s.name.toLowerCase() === name.toLowerCase() && s.id !== editingId
    );
    if (duplicate) errors.name = "A supplier with this name already exists.";
  }

  const email = (values.email ?? "").trim();
  if (!email) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";

  const phone = (values.phone ?? "").trim();
  const phoneDigits = phone.replace(/[\s\-()]/g, "");
  if (!phone) errors.phone = "Phone is required.";
  else if (!PHONE_RE.test(phoneDigits)) errors.phone = "Phone must be 7-15 digits (optional leading +).";

  if ((values.address ?? "").length > 200) {
    errors.address = "Address must be 200 characters or fewer.";
  }

  return errors;
};

// ---------------- Products ----------------
export const validateProduct = (values, { products, categories, suppliers, editingId = null }) => {
  const errors = {};

  const sku = (values.sku ?? "").trim().toUpperCase();
  if (!sku) {
    errors.sku = "SKU is required.";
  } else if (!SKU_RE.test(sku)) {
    errors.sku = "SKU must be 3–20 uppercase letters, digits, or hyphens (no leading/trailing hyphen).";
  } else {
    const duplicate = products.find((p) => p.sku === sku && p.id !== editingId);
    if (duplicate) errors.sku = "This SKU is already in use.";
  }

  const name = (values.name ?? "").trim();
  if (!name) errors.name = "Product name is required.";
  else if (name.length > 100) errors.name = "Name must be 100 characters or fewer.";

  if (!values.categoryId) {
    errors.categoryId = "Category is required.";
  } else if (!categories.some((c) => c.id === values.categoryId)) {
    errors.categoryId = "Selected category does not exist.";
  }

  if (!values.supplierId) {
    errors.supplierId = "Supplier is required.";
  } else if (!suppliers.some((s) => s.id === values.supplierId)) {
    errors.supplierId = "Selected supplier does not exist.";
  }

  if (!values.unitOfMeasure) errors.unitOfMeasure = "Unit of measure is required.";

  if (!Number.isInteger(values.costPriceCents) || values.costPriceCents < 0) {
    errors.costPriceCents = "Cost price must be a non-negative amount.";
  }
  if (!Number.isInteger(values.sellPriceCents) || values.sellPriceCents < 0) {
    errors.sellPriceCents = "Sell price must be a non-negative amount.";
  }

  if (!Number.isInteger(values.reorderLevel) || values.reorderLevel < 0) {
    errors.reorderLevel = "Reorder level must be 0 or greater.";
  }

  if (!editingId) {
    if (!Number.isInteger(values.currentStock) || values.currentStock < 0) {
      errors.currentStock = "Initial stock must be 0 or greater.";
    }
  }

  return errors;
};
