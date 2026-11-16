```markdown
# Testing Report — Inventory Management System

## Data Accuracy Verification (Step 5)
The system was designed with an invariant: *A product's current stock must always equal its initial stock plus the sum of its movement deltas.*

**Test Execution:**
1. Loaded sample data (17 products, 5 categories, 43 movements).
2. Ran 15 random operations (Receive, Issue, Adjust, and creating new products).
3. Executed the internal integrity checker via the browser console:
   ```js
   __inv.verifyIntegrity()
