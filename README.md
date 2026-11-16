# Inventory Management System

A professional, responsive single-page application for managing inventory, tracking stock movements, generating reports, and monitoring business KPIs.

## Features
- **Inventory Tracking:** CRUD for products with unique SKU generation, category and supplier relational linking.
- **Stock Management:** Atomic Receive (IN), Issue (OUT), and Adjust operations with strict validation (cannot issue more than available).
- **Audit Trail:** Every stock change generates an immutable `StockMovement` record, preserving history.
- **Reports Dashboard:** KPI cards, visual charts (Recharts), low-stock alerts, and valuation tables.
- **Data Export:** CSV export for full inventory valuation.
- **Persistence:** Data is stored reliably in browser `localStorage`.
- **Referential Integrity:** Deleting categories/suppliers is blocked if linked to active products. Deleting products with history is blocked (offers "discontinue" instead).

## Tech Stack
- React 18 + Vite
- Vanilla CSS (Design tokens, responsive flex/grid layouts)
- Recharts (Data visualization)
- Lucide/Standard Emoji for icons
- LocalStorage (Data layer)

## Business Logic & Architecture
The application is built with a strict separation of concerns:
1. **`utils/`**: Pure functions for money parsing (integer cents, no floats), validation, stock operations, and report aggregation.
2. **`hooks/useInventory.js`**: The single source of truth. Owns the state for all 4 tables and exposes atomic CRUD operations.
3. **`components/` & `pages/`**: Purely presentational. They receive data and callbacks as props.

### The Stock Invariant
The system enforces a strict invariant:
`currentStock = initialStock + sum(IN) - sum(OUT) + sum(ADJUST)`
A built-in utility `verifyIntegrity()` can be called from the console to audit the ledger.

## Getting Started
```bash
npm install
npm run dev