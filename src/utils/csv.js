export const exportToCsv = (filename, rows) => {
  if (!rows || !rows.length) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","), // Header row
    ...rows.map((row) =>
      headers
        .map((header) => {
          const val = row[header];
          // Escape quotes and wrap in quotes if it contains a comma/quote
          const str = String(val ?? "");
          const escaped = str.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    ),
  ].join("\n");

  // Create a Blob and trigger a download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
