// ─── UserProfilePage.jsx ──────────────────────────────────────────────────────
// Displays and allows editing of the logged-in user's profile.
// Every field is editable (hover → pencil appears → click → inline edit).
// USER ID is locked. EMAIL must remain unique across all users.
// Password change: two fields (new + confirm) with live requirement checks.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import styles from "./UserProfilePage.module.css";

// ── Password validation (mirrors server/validations/utils.js) ─────────────────
function getPasswordErrors(password) {
  const errors = [];
  if (!password || password.length < 8) errors.push("At least 8 characters");
  if (password && !/[A-Z]/.test(password))
    errors.push("At least 1 uppercase letter");
  if (password && !/\d/.test(password)) errors.push("At least 1 number");
  if (password && !/[^A-Za-z0-9]/.test(password))
    errors.push("At least 1 special character (!@#$%^&* …)");
  if (password && /[^\x20-\x7E]/.test(password))
    errors.push("English characters only");
  return errors;
}

// ── Field icon SVGs ────────────────────────────────────────────────────────────
const FieldIcon = ({ type }) => {
  const icons = {
    person: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    email: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    phone: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.08 6.08l1.93-1.94a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    gender: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="11" r="4" />
        <line x1="12" y1="15" x2="12" y2="23" />
        <line x1="9" y1="20" x2="15" y2="20" />
      </svg>
    ),
    calendar: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    role: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    password: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    id: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  };
  return icons[type] || icons.person;
};

// Pencil icon
const PencilIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

// ── Password change field (two inputs + live requirements) ────────────────────
function PasswordField({ onSave, saving, serverError }) {
  const [editing, setEditing] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const newPwRef = useRef(null);

  useEffect(() => {
    if (editing && newPwRef.current) newPwRef.current.focus();
  }, [editing]);

  function handleCancel() {
    setNewPw("");
    setConfirmPw("");
    setEditing(false);
  }

  const pwErrors = getPasswordErrors(newPw);
  const mismatch = confirmPw.length > 0 && newPw !== confirmPw;
  const canSave =
    newPw.length > 0 && pwErrors.length === 0 && newPw === confirmPw;

  function handleSave() {
    if (!canSave) return;
    onSave(newPw, () => {
      setNewPw("");
      setConfirmPw("");
      setEditing(false);
    });
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") handleCancel();
  }

  return (
    <div className={`${styles.field} ${editing ? styles.fieldEditing : ""}`}>
      <div className={styles.fieldIconCircle}>
        <FieldIcon type="password" />
      </div>
      <div className={styles.fieldContent}>
        <span className={styles.fieldLabel}>PASSWORD</span>

        {editing ? (
          <div className={styles.pwEditBlock}>
            {/* New password input */}
            <div className={styles.pwInputRow}>
              <input
                ref={newPwRef}
                className={`${styles.editInput} ${newPw.length > 0 && pwErrors.length > 0 ? styles.editInputError : ""}`}
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="New password"
                autoComplete="new-password"
              />
            </div>

            {/* Live requirement checklist */}
            {newPw.length > 0 && (
              <ul className={styles.pwRequirements}>
                {[
                  { label: "At least 8 characters", ok: newPw.length >= 8 },
                  {
                    label: "At least 1 uppercase letter",
                    ok: /[A-Z]/.test(newPw),
                  },
                  { label: "At least 1 number", ok: /\d/.test(newPw) },
                  {
                    label: "At least 1 special character",
                    ok: /[^A-Za-z0-9]/.test(newPw),
                  },
                  {
                    label: "English characters only",
                    ok: !/[^\x20-\x7E]/.test(newPw),
                  },
                ].map(({ label, ok }) => (
                  <li
                    key={label}
                    className={ok ? styles.reqOk : styles.reqFail}
                  >
                    <span className={styles.reqDot}>{ok ? "✓" : "✗"}</span>
                    {label}
                  </li>
                ))}
              </ul>
            )}

            {/* Confirm password input */}
            <div className={styles.pwInputRow}>
              <input
                className={`${styles.editInput} ${mismatch ? styles.editInputError : ""}`}
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
            </div>
            {mismatch && (
              <span className={styles.pwMismatch}>Passwords do not match</span>
            )}

            {/* Server-side error */}
            {serverError && (
              <span className={styles.fieldError}>{serverError}</span>
            )}

            {/* Action buttons */}
            <div className={styles.pwActions}>
              <button
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={!canSave || saving}
                type="button"
              >
                {saving ? "…" : "Save"}
              </button>
              <button
                className={styles.cancelBtn}
                onClick={handleCancel}
                type="button"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <span className={styles.fieldValue}>{"•".repeat(10)}</span>
        )}
      </div>

      {!editing && (
        <button
          className={styles.pencilBtn}
          onClick={() => setEditing(true)}
          type="button"
          title="Change password"
          aria-label="Change password"
        >
          <PencilIcon />
        </button>
      )}
    </div>
  );
}

// ── Single editable field ──────────────────────────────────────────────────────
function ProfileField({
  label,
  value,
  iconType,
  locked,
  type = "text",
  options,
  onSave,
  saving,
  error,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const inputRef = useRef(null);

  // sync draft when value changes from parent
  useEffect(() => {
    if (!editing) setDraft(value ?? "");
  }, [value, editing]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  function handlePencilClick() {
    if (locked) return;
    setDraft(value ?? "");
    setEditing(true);
  }

  function handleCancel() {
    setDraft(value ?? "");
    setEditing(false);
  }

  function handleSave() {
    if (draft === value) {
      setEditing(false);
      return;
    }
    onSave(draft, () => setEditing(false));
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  }

  const displayValue = type === "password" ? "•".repeat(10) : value || "—";

  return (
    <div className={`${styles.field} ${locked ? styles.fieldLocked : ""}`}>
      <div className={styles.fieldIconCircle}>
        <FieldIcon type={iconType} />
      </div>
      <div className={styles.fieldContent}>
        <span className={styles.fieldLabel}>
          {label}
          {locked && <span className={styles.lockedBadge}>LOCKED</span>}
        </span>

        {editing ? (
          <div className={styles.editRow}>
            {options ? (
              <select
                ref={inputRef}
                className={styles.editInput}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
              >
                {options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                ref={inputRef}
                className={styles.editInput}
                type={type === "password" ? "password" : type}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={type === "password" ? "New password" : ""}
              />
            )}
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={saving}
              type="button"
            >
              {saving ? "…" : "Save"}
            </button>
            <button
              className={styles.cancelBtn}
              onClick={handleCancel}
              type="button"
            >
              ✕
            </button>
          </div>
        ) : (
          <span className={styles.fieldValue}>{displayValue}</span>
        )}

        {error && <span className={styles.fieldError}>{error}</span>}
      </div>

      {!locked && !editing && (
        <button
          className={styles.pencilBtn}
          onClick={handlePencilClick}
          type="button"
          title="Edit"
          aria-label={`Edit ${label}`}
        >
          <PencilIcon />
        </button>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function UserProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fieldSaving, setFieldSaving] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  function saveField(fieldKey, value, onDone) {
    setFieldSaving((prev) => ({ ...prev, [fieldKey]: true }));
    setFieldErrors((prev) => ({ ...prev, [fieldKey]: null }));

    const body = { [fieldKey]: value };

    fetch("/api/auth/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setUser((prev) => ({ ...prev, [fieldKey]: value }));
          toast.success("Updated successfully!");
          onDone();
        } else {
          setFieldErrors((prev) => ({ ...prev, [fieldKey]: data.message }));
        }
      })
      .catch(() => {
        setFieldErrors((prev) => ({ ...prev, [fieldKey]: "Failed to save" }));
      })
      .finally(() => {
        setFieldSaving((prev) => ({ ...prev, [fieldKey]: false }));
      });
  }

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!user) {
    return <div className={styles.loadingWrap}>Could not load profile.</div>;
  }

  const fullName = `${user.first_name} ${user.last_name}`;
  const roleLabel =
    user.role === "admin"
      ? "Admin"
      : user.role === "instructor"
        ? "Instructor"
        : "Regular User";

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Profile</h1>
        <p className={styles.subtitle}>
          Hover any field and click the pencil to edit it
        </p>
      </div>

      <div className={styles.card}>
        {/* Card header */}
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <h2 className={styles.userName}>{fullName}</h2>
            <span className={styles.roleBadge}>{roleLabel}</span>
          </div>
          <div className={styles.userIdBadge}>
            <span className={styles.userIdLabel}>USER ID</span>
            <span className={styles.userIdValue}>{user.user_id}</span>
          </div>
        </div>

        {/* Fields grid */}
        <div className={styles.grid}>
          <ProfileField
            label="FIRST NAME"
            value={user.first_name}
            iconType="person"
            onSave={(v, done) => saveField("first_name", v, done)}
            saving={fieldSaving.first_name}
            error={fieldErrors.first_name}
          />
          <ProfileField
            label="LAST NAME"
            value={user.last_name}
            iconType="person"
            onSave={(v, done) => saveField("last_name", v, done)}
            saving={fieldSaving.last_name}
            error={fieldErrors.last_name}
          />
          <ProfileField
            label="EMAIL ADDRESS"
            value={user.email}
            iconType="email"
            type="email"
            onSave={(v, done) => saveField("email", v, done)}
            saving={fieldSaving.email}
            error={fieldErrors.email}
          />
          <ProfileField
            label="PHONE NUMBER"
            value={user.phone}
            iconType="phone"
            onSave={(v, done) => saveField("phone", v, done)}
            saving={fieldSaving.phone}
            error={fieldErrors.phone}
          />
          <ProfileField
            label="GENDER"
            value={user.gender}
            iconType="gender"
            options={["male", "female", "other"]}
            onSave={(v, done) => saveField("gender", v, done)}
            saving={fieldSaving.gender}
            error={fieldErrors.gender}
          />
          <ProfileField
            label="DATE OF BIRTH"
            value={
              user.birth_date
                ? // dateStrings:true returns "YYYY-MM-DD"; guard against old Date objects too
                  (user.birth_date instanceof Date
                    ? user.birth_date.toISOString()
                    : String(user.birth_date)
                  ).slice(0, 10)
                : ""
            }
            iconType="calendar"
            type="date"
            onSave={(v, done) => saveField("birth_date", v, done)}
            saving={fieldSaving.birth_date}
            error={fieldErrors.birth_date}
          />
          <ProfileField label="ROLE" value={roleLabel} iconType="role" locked />
          <PasswordField
            onSave={(v, done) => saveField("password", v, done)}
            saving={fieldSaving.password}
            serverError={fieldErrors.password}
          />
          <ProfileField
            label="USER ID"
            value={user.user_id}
            iconType="id"
            locked
          />
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;
