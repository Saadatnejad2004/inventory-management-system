import { useState } from "react";
import { useInventory } from "./hooks/useInventory";
import { useToast } from "./hooks/useToast";

import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { ToastContainer } from "./components/common/Toast";

// We will create these page components in B2 and B3.
// For now, we'll stub them out so the shell compiles.
import { DashboardPage } from "./pages/DashboardPage";
import { ProductsPage } from "./pages/ProductsPage";
import { MovementsPage } from "./pages/MovementsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";

const PAGE_TITLES = {
  dashboard: "Dashboard Overview",
  products: "Inventory Management",
  movements: "Stock Movements",
  reports: "Inventory Reports",
  settings: "Reference Data (Categories & Suppliers)",
};

const App = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const inventory = useInventory();
  const toast = useToast();

  if (typeof window !== "undefined") {
    window.__inv = { ...inventory, toast };
  }

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all data?")) {
      inventory.clearAll();
      toast.addToast("All data cleared", "success");
    }
  };

  const handleLoadSample = () => {
    inventory.loadSample();
    toast.addToast("Sample data loaded", "success");
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage inventory={inventory} />;
      case "products":
        return <ProductsPage inventory={inventory} toast={toast} />;
      case "movements":
        return <MovementsPage inventory={inventory} />;
      case "reports":
        return <ReportsPage inventory={inventory} />;
      case "settings":
        return <SettingsPage inventory={inventory} toast={toast} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      
      <div className="main-content">
        <TopBar
          title={PAGE_TITLES[activePage]}
          onLoadSample={handleLoadSample}
          onClear={handleClear}
        />
        <main className="page-container">
          {renderPage()}
        </main>
      </div>

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
    </div>
  );
};

export default App;
