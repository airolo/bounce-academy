export function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`button button-primary ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}
