export const TopBar = ({ title, onLoadSample, onClear }) => (
  <header className="topbar">
    <h1>{title}</h1>
    <div className="topbar-actions">
      <button className="btn btn-ghost btn-sm" onClick={onLoadSample}>Load Sample Data</button>
      <button className="btn btn-danger btn-sm" onClick={onClear}>Reset App</button>
    </div>
  </header>
);
