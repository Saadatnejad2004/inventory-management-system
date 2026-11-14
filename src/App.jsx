import { useInventory } from "./hooks/useInventory";

const App = () => {
  const inv = useInventory();
  const integrity = inv.verifyIntegrity();

  return (
    <div style={{ padding: 24, fontFamily: "monospace", lineHeight: 1.6 }}>
      <h1>Data Layer — Phase A Test</h1>

      <p>
        Categories: <b>{inv.categories.length}</b> · Suppliers: <b>{inv.suppliers.length}</b> · Products:{" "}
        <b>{inv.products.length}</b> · Movements: <b>{inv.movements.length}</b>
      </p>

      <p>
        <button onClick={() => inv.loadSample()}>Load Sample Data</button>{" "}
        <button onClick={() => inv.clearAll()}>Clear All</button>
      </p>

      <p style={{ color: integrity.allPassed ? "green" : "crimson" }}>
        Integrity: {integrity.allPassed ? "ALL PASS" : `${integrity.failures.length} FAILURE(S)`}
      </p>
      {!integrity.allPassed && (
        <pre style={{ background: "#fee", padding: 12, fontSize: 12 }}>
          {JSON.stringify(integrity.failures, null, 2)}
        </pre>
      )}

      <h2>Products</h2>
      <pre style={{ background: "#f4f4f4", padding: 12, fontSize: 12 }}>
        {JSON.stringify(
          inv.products.map((p) => ({
            sku: p.sku,
            stock: p.currentStock,
            reorder: p.reorderLevel,
          })),
          null,
          2
        )}
      </pre>
    </div>
  );
};

export default App;
