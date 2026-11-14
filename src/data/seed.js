// Sample data to populate the app for demos and reviewer testing.
// Deterministic IDs make the data reproducible across reloads.
// The invariant currentStock = initialStock + sum(deltas) holds by construction.

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

const CATEGORIES = [
  { id: "cat-electronics", name: "Electronics", description: "Computers, peripherals, and accessories" },
  { id: "cat-furniture", name: "Furniture", description: "Desks, chairs, and storage" },
  { id: "cat-stationery", name: "Stationery", description: "Paper, pens, and office supplies" },
  { id: "cat-apparel", name: "Apparel", description: "Uniforms and workwear" },
  { id: "cat-tools", name: "Tools & Hardware", description: "Hand tools and consumables" },
];

const SUPPLIERS = [
  { id: "sup-tech", name: "TechDistributors Inc.", email: "orders@techdist.example", phone: "555-0101", address: "123 Silicon Ave, San Jose, CA" },
  { id: "sup-acme", name: "Acme Supplies Co.", email: "sales@acme.example", phone: "555-0102", address: "456 Main St, Springfield, IL" },
  { id: "sup-paper", name: "Paper & Pen Wholesale", email: "hello@paperpen.example", phone: "555-0103", address: "789 Court St, Boston, MA" },
  { id: "sup-workwear", name: "WorkWear Direct", email: "info@workwear.example", phone: "555-0104", address: "321 Industrial Blvd, Detroit, MI" },
  { id: "sup-hardware", name: "Hardware Depot Ltd.", email: "accounts@hardwaredepot.example", phone: "555-0105", address: "654 Tool Rd, Cleveland, OH" },
];

// stock = target ending inventory (some healthy, some low, some out)
const PRODUCTS = [
  { sku: "ELE-MOU-001", name: "Wireless Mouse", categoryId: "cat-electronics", supplierId: "sup-tech", unitOfMeasure: "pcs", costPriceCents: 850, sellPriceCents: 1499, reorderLevel: 20, targetStock: 145 },
  { sku: "ELE-KEY-001", name: "Mechanical Keyboard", categoryId: "cat-electronics", supplierId: "sup-tech", unitOfMeasure: "pcs", costPriceCents: 4200, sellPriceCents: 6999, reorderLevel: 15, targetStock: 62 },
  { sku: "ELE-MON-027", name: "27-inch LED Monitor", categoryId: "cat-electronics", supplierId: "sup-tech", unitOfMeasure: "pcs", costPriceCents: 18000, sellPriceCents: 24999, reorderLevel: 10, targetStock: 8 },
  { sku: "ELE-HUB-USB", name: "USB-C Hub 7-in-1", categoryId: "cat-electronics", supplierId: "sup-tech", unitOfMeasure: "pcs", costPriceCents: 2100, sellPriceCents: 3999, reorderLevel: 25, targetStock: 0 },
  { sku: "FUR-DSK-160", name: "Standing Desk 160cm", categoryId: "cat-furniture", supplierId: "sup-acme", unitOfMeasure: "pcs", costPriceCents: 35000, sellPriceCents: 49999, reorderLevel: 5, targetStock: 12 },
  { sku: "FUR-CHR-ERG", name: "Ergonomic Office Chair", categoryId: "cat-furniture", supplierId: "sup-acme", unitOfMeasure: "pcs", costPriceCents: 22000, sellPriceCents: 32999, reorderLevel: 8, targetStock: 4 },
  { sku: "FUR-SHF-3T", name: "3-Tier Bookshelf", categoryId: "cat-furniture", supplierId: "sup-acme", unitOfMeasure: "pcs", costPriceCents: 6500, sellPriceCents: 9999, reorderLevel: 10, targetStock: 27 },
  { sku: "STA-A4-500", name: "A4 Paper (500 sheets)", categoryId: "cat-stationery", supplierId: "sup-paper", unitOfMeasure: "ream", costPriceCents: 450, sellPriceCents: 699, reorderLevel: 50, targetStock: 320 },
  { sku: "STA-PEN-BLK", name: "Ballpoint Pen Black (box of 12)", categoryId: "cat-stationery", supplierId: "sup-paper", unitOfMeasure: "box", costPriceCents: 240, sellPriceCents: 499, reorderLevel: 30, targetStock: 18 },
  { sku: "STA-NTB-A5", name: "A5 Notebook", categoryId: "cat-stationery", supplierId: "sup-paper", unitOfMeasure: "pcs", costPriceCents: 180, sellPriceCents: 399, reorderLevel: 40, targetStock: 210 },
  { sku: "STA-TON-BLK", name: "Laser Printer Toner Black", categoryId: "cat-stationery", supplierId: "sup-paper", unitOfMeasure: "pcs", costPriceCents: 4800, sellPriceCents: 7999, reorderLevel: 6, targetStock: 3 },
  { sku: "APP-TSH-M", name: "Staff T-Shirt (M)", categoryId: "cat-apparel", supplierId: "sup-workwear", unitOfMeasure: "pcs", costPriceCents: 550, sellPriceCents: 1299, reorderLevel: 20, targetStock: 88 },
  { sku: "APP-TSH-L", name: "Staff T-Shirt (L)", categoryId: "cat-apparel", supplierId: "sup-workwear", unitOfMeasure: "pcs", costPriceCents: 550, sellPriceCents: 1299, reorderLevel: 20, targetStock: 47 },
  { sku: "APP-JKT-HV", name: "Hi-Vis Safety Jacket", categoryId: "cat-apparel", supplierId: "sup-workwear", unitOfMeasure: "pcs", costPriceCents: 1400, sellPriceCents: 2499, reorderLevel: 10, targetStock: 22 },
  { sku: "TLS-DRL-18V", name: "18V Cordless Drill", categoryId: "cat-tools", supplierId: "sup-hardware", unitOfMeasure: "pcs", costPriceCents: 7500, sellPriceCents: 11999, reorderLevel: 5, targetStock: 9 },
  { sku: "TLS-SCR-100", name: "Wood Screws 100-pack", categoryId: "cat-tools", supplierId: "sup-hardware", unitOfMeasure: "pack", costPriceCents: 320, sellPriceCents: 599, reorderLevel: 25, targetStock: 140 },
  { sku: "TLS-GLV-L", name: "Work Gloves (L)", categoryId: "cat-tools", supplierId: "sup-hardware", unitOfMeasure: "pair", costPriceCents: 420, sellPriceCents: 899, reorderLevel: 30, targetStock: 0 },
];

/**
 * For a given target ending stock, produce movements that net to that value.
 * Every product starts at initialStock = 0, then records:
 *   - 1 or more INs (initial purchase, possibly restocks)
 *   - 0 or more OUTs (sales)
 * The invariant currentStock = sum(delta) holds by construction.
 */
const buildMovementsFor = (productId, targetStock, seedIndex) => {
  const mv = [];
  let running = 0;
  let seq = 0;

  const push = (type, quantity, reason, daysAgoVal, note = "") => {
    seq += 1;
    const previousStock = running;
    const resultingStock =
      type === "IN" ? previousStock + quantity : previousStock - quantity;
    mv.push({
      id: `mv-${productId}-${seq}`,
      productId,
      type,
      quantity,
      delta: type === "IN" ? quantity : -quantity,
      previousStock,
      resultingStock,
      reason,
      note,
      createdAt: daysAgo(daysAgoVal),
    });
    running = resultingStock;
  };

  const initialBuy = targetStock === 0 ? 40 : Math.ceil(targetStock * 1.5) + 10;
  push("IN", initialBuy, "purchase", 19 - (seedIndex % 5), "Initial stock received");

  let toSell = running - targetStock;
  if (toSell > 0) {
    const saleCount = Math.min(3, Math.max(1, Math.ceil(toSell / 40)));
    for (let i = 0; i < saleCount; i++) {
      const remaining = running - targetStock;
      if (remaining <= 0) break;
      const qty = i === saleCount - 1 ? remaining : Math.min(Math.ceil(remaining / 2), remaining);
      push("OUT", qty, "sale", 15 - i * 3 - (seedIndex % 3));
    }
  } else if (toSell < 0) {
    push("IN", -toSell, "purchase", 8, "Restock");
  }

  // Safety net: if anything drifted, do an ADJUST to reconcile.
  if (running !== targetStock) {
    push("ADJUST", targetStock - running > 0 ? running + (targetStock - running) : targetStock, "count", 2);
    // The adjust above is a no-op if types don't match; being safe:
  }

  // If we're still off due to the safe-guard branch (shouldn't happen), normalize:
  // (kept minimal on purpose; the math above always lands on target)

  return mv;
};

export const buildSampleData = () => {
  const categories = CATEGORIES.map((c) => ({ ...c, createdAt: daysAgo(30) }));
  const suppliers = SUPPLIERS.map((s) => ({ ...s, createdAt: daysAgo(30) }));

  const products = PRODUCTS.map((p, i) => {
    const created = daysAgo(20 - (i % 5));
    return {
      id: `prod-${p.sku}`,
      sku: p.sku,
      name: p.name,
      description: "",
      categoryId: p.categoryId,
      supplierId: p.supplierId,
      unitOfMeasure: p.unitOfMeasure,
      costPriceCents: p.costPriceCents,
      sellPriceCents: p.sellPriceCents,
      reorderLevel: p.reorderLevel,
      initialStock: 0,
      currentStock: p.targetStock,
      status: "active",
      createdAt: created,
      updatedAt: created,
    };
  });

  const movements = [];
  PRODUCTS.forEach((p, i) => {
    const productId = `prod-${p.sku}`;
    movements.push(...buildMovementsFor(productId, p.targetStock, i));
  });

  return { categories, suppliers, products, movements };
};
