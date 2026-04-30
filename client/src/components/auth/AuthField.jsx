export default function AuthField({
  styles,
  icon: Icon,
  error,
  fullWidth = false,
  fieldClassName = "",
  children,
}) {
  return (
    <div
      className={`${styles.formGroup} ${fullWidth ? styles.fullWidthField : ""} ${fieldClassName}`}
    >
      <div
        className={`${styles.fieldShell} ${error ? styles.fieldShellError : ""}`}
      >
        <span className={styles.inputIcon} aria-hidden="true">
          <Icon size={18} strokeWidth={1.8} />
        </span>
        {children}
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}
