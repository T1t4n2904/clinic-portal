type SelectFieldProps = {
  label: string;
  name: string;
  options: string[];
  defaultValue?: string;
  error?: string;
};

export function SelectField({
  label,
  name,
  options,
  defaultValue = "",
  error,
}: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
        defaultValue={defaultValue}
      >
        <option value="" disabled>
          Select {label.toLowerCase()}
        </option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
