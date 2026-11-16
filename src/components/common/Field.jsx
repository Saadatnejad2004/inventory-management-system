export const Field = ({ label, name, type = "text", value, error, options, onChange, ...rest }) => {
  const isSelect = type === "select";
  const inputClass = error ? "input input-error" : "input";

  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {isSelect ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className={inputClass}
          {...rest}
        >
          <option value="">Select {label.toLowerCase()}...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className={inputClass}
          {...rest}
        />
      )}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
};
