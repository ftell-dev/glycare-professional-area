export default function FormField({ label, error, className = '', ...inputProps }) {
  const id = inputProps.id ?? inputProps.name

  return (
    <div className={`field ${className}`.trim()}>
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...inputProps} />
      {error && <span className="field-error" id={`${id}-error`}>{error}</span>}
    </div>
  )
}