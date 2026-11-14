const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export const formatCents = (cents) => {
  if (!Number.isFinite(cents)) return "-";
  return USD.format(cents / 100);
};

/**
 * Parse user input like "10.99" -> 1099 (integer cents).
 * Uses string parsing to avoid floating-point bugs (e.g. 1.005 * 100 === 100.49999...).
 * Returns NaN for invalid input.
 */
export const parsePriceToCents = (input) => {
  const s = String(input ?? "").trim();
  if (!s) return NaN;
  const match = s.match(/^(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) return NaN;
  const whole = parseInt(match[1], 10);
  const frac = (match[2] ?? "").padEnd(2, "0");
  return whole * 100 + parseInt(frac, 10);
};

/**
 * Format a money input value for editing an existing product.
 * 1099 -> "10.99"; 1000 -> "10.00"
 */
export const centsToInputValue = (cents) => {
  if (!Number.isFinite(cents)) return "";
  return (cents / 100).toFixed(2);
};

/**
 * Human-friendly relative time: "3 days ago", "just now".
 */
export const formatRelativeTime = (iso) => {
  if (!iso) return "-";
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.round(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day} day${day === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString();
};

export const formatDateTime = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleString();
};

export const formatDate = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString();
};
