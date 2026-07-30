/**
 * Shared form primitives reused across all modals.
 * Keeps the styling consistent with the dark SaaS theme.
 */

/* ── Field wrapper ───────────────────────────────────── */
export const Field = ({ label, error, required, children }) => (
  <div>
    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#8b8fa8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {label}{required && <span style={{ color: '#f87171', marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs" style={{ color: '#f87171' }}>{error}</p>}
  </div>
);

/* ── Text / Number input ────────────────────────────── */
export const Input = ({ type = 'text', placeholder, value, onChange, min, step }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    min={min}
    step={step}
    className="input"
    style={{ height: 38 }}
  />
);

/* ── Textarea ───────────────────────────────────────── */
export const Textarea = ({ placeholder, value, onChange, rows = 3 }) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    rows={rows}
    className="input"
    style={{ resize: 'vertical', minHeight: 72 }}
  />
);

/* ── Select dropdown ───────────────────────────────── */
export const Select = ({ value, onChange, children, placeholder }) => (
  <select
    value={value}
    onChange={onChange}
    className="input"
    style={{
      height: 38,
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23545769'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 10px center',
      backgroundSize: '14px',
      paddingRight: 32,
      cursor: 'pointer',
      color: value ? '#f0f2f5' : '#545769',
    }}
  >
    {placeholder && <option value="" style={{ background: '#111316', color: '#545769' }}>{placeholder}</option>}
    {children}
  </select>
);

/* ── Modal footer ──────────────────────────────────── */
export const ModalFooter = ({ onCancel, onSubmit, loading, submitLabel = 'Save', submitColor = '#5c6bc0' }) => (
  <div
    className="flex items-center justify-end gap-3 px-6 py-4"
    style={{ borderTop: '1px solid #1a1c22', flexShrink: 0 }}
  >
    <button
      type="button"
      onClick={onCancel}
      className="btn-secondary"
      disabled={loading}
      style={{ minWidth: 90 }}
    >
      Cancel
    </button>
    <button
      type="button"
      onClick={onSubmit}
      disabled={loading}
      className="btn"
      style={{
        background: loading ? 'rgba(92,107,192,0.5)' : submitColor,
        color: '#fff',
        borderColor: 'transparent',
        minWidth: 110,
        boxShadow: loading ? 'none' : '0 1px 2px rgba(0,0,0,0.3)',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Saving…
        </span>
      ) : submitLabel}
    </button>
  </div>
);

/* ── Grid layout helper ────────────────────────────── */
export const Grid2 = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
);

/* ── Section divider ───────────────────────────────── */
export const FieldSection = ({ children }) => (
  <div className="px-6 py-5 space-y-4">{children}</div>
);
