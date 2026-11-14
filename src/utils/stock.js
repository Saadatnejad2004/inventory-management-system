export const STOCK_TYPES = {
  IN: "IN",
  OUT: "OUT",
  ADJUST: "ADJUST",
};

export const STOCK_TYPE_LABELS = {
  IN: "Receive",
  OUT: "Issue",
  ADJUST: "Adjust",
};

export const REASONS = {
  IN: ["purchase", "return", "transfer", "other"],
  OUT: ["sale", "damage", "theft", "transfer", "other"],
  ADJUST: ["count", "damage", "theft", "other"],
};

export const REASON_LABELS = {
  purchase: "Purchase",
  return: "Return",
  transfer: "Transfer",
  sale: "Sale",
  damage: "Damage",
  theft: "Theft",
  count: "Physical count",
  other: "Other",
};

/**
 * Validate a stock operation BEFORE applying it.
 * Returns { ok: true } or { ok: false, error: "..." }.
 * Does not mutate anything - pure function.
 */
export const validateStockOperation = (product, type, quantity, reason) => {
  if (!product) return { ok: false, error: "Product not found." };
  if (product.status !== "active") {
    return { ok: false, error: "Product is discontinued - reactivate it before recording stock operations." };
  }
  if (!Object.values(STOCK_TYPES).includes(type)) {
    return { ok: false, error: "Invalid stock operation type." };
  }
  if (!REASONS[type].includes(reason)) {
    return { ok: false, error: `Invalid reason for a ${type} operation.` };
  }

  if (type === STOCK_TYPES.ADJUST) {
    // For ADJUST, `quantity` is the NEW stock level (target), not a delta.
    if (!Number.isInteger(quantity) || quantity < 0) {
      return { ok: false, error: "New stock must be a non-negative whole number." };
    }
  } else {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return { ok: false, error: "Quantity must be a positive whole number." };
    }
    if (type === STOCK_TYPES.OUT && quantity > product.currentStock) {
      return { ok: false, error: `Cannot issue ${quantity}: only ${product.currentStock} in stock.` };
    }
  }

  return { ok: true };
};

export const computeResultingStock = (product, type, quantity) => {
  if (type === STOCK_TYPES.IN) return product.currentStock + quantity;
  if (type === STOCK_TYPES.OUT) return product.currentStock - quantity;
  if (type === STOCK_TYPES.ADJUST) return quantity;
  throw new Error(`Unknown stock type: ${type}`);
};

export const computeDelta = (type, quantity, previousStock) => {
  if (type === STOCK_TYPES.IN) return quantity;
  if (type === STOCK_TYPES.OUT) return -quantity;
  if (type === STOCK_TYPES.ADJUST) return quantity - previousStock;
  throw new Error(`Unknown stock type: ${type}`);
};

/**
 * The data-accuracy invariant. For a single product, every movement's
 * stock snapshots must chain correctly from initialStock, and the final
 * resulting stock must equal the product's currentStock.
 *
 * Returns { ok: true } or { ok: false, error: "..." }.
 */
export const verifyProductIntegrity = (product, allMovements) => {
  const chain = allMovements
    .filter((m) => m.productId === product.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  let expected = product.initialStock ?? 0;

  for (const m of chain) {
    if (m.previousStock !== expected) {
      return { ok: false, error: `Movement ${m.id}: previousStock=${m.previousStock} ≠ expected=${expected}` };
    }
    const resulting =
      m.type === STOCK_TYPES.ADJUST
        ? m.quantity
        : m.type === STOCK_TYPES.IN
        ? m.previousStock + m.quantity
        : m.previousStock - m.quantity;

    if (m.resultingStock !== resulting) {
      return { ok: false, error: `Movement ${m.id}: resultingStock=${m.resultingStock} ≠ expected=${resulting}` };
    }
    if (m.delta !== resulting - m.previousStock) {
      return { ok: false, error: `Movement ${m.id}: delta inconsistent with snapshots` };
    }
    if (m.resultingStock < 0) {
      return { ok: false, error: `Movement ${m.id}: negative resulting stock` };
    }
    expected = resulting;
  }

  if (expected !== product.currentStock) {
    return { ok: false, error: `Product currentStock=${product.currentStock} ≠ expected=${expected}` };
  }

  return { ok: true };
};
