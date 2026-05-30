// ─── UserDatabase.jsx ─────────────────────────────────────────────────────────
// Child view 1: master list of all registered users.
// Manages local user state (role updates, block/unblock toggles).
// Opens ChangeRoleModal or BlockUserModal based on which button is clicked.
// Replace INITIAL_USERS with an API call when the backend is ready.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import AvatarInitials from "../../dashboard/shared/AvatarInitials";
import ChangeRoleModal from "../modals/ChangeRoleModal";
import BlockUserModal from "../modals/BlockUserModal";
import styles from "./UserDatabase.module.css";

/* Normalise a DB row into the shape the component uses */
function toUser(row) {
  return {
    id: row.user_id,
    name: `${row.first_name} ${row.last_name}`,
    email: row.email,
    phone: row.phone ?? "—",
    role: row.role,
    status: row.is_blocked ? "Blocked" : "Active",
  };
}

/* Maps role name → CSS module class for the badge */
const ROLE_CLASS = {
  user: "roleUser",
  instructor: "roleInstructor",
  admin: "roleManager",
};

function UserDatabase() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalUser, setModalUser] = useState(null);
  const [modalType, setModalType] = useState(null); // "changeRole" | "blockUser"

  /* ── Fetch all users on mount ────────────────────────────────────────── */
  const loadUsers = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/admin/users")
      .then((r) => r.json().then((body) => ({ ok: r.ok, body })))
      .then(({ ok, body }) => {
        if (!ok) throw new Error(body.message || "Failed to load users");
        setUsers(body.users.map(toUser));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  function openModal(user, type) {
    setModalUser(user);
    setModalType(type);
  }

  function closeModal() {
    setModalUser(null);
    setModalType(null);
  }

  /* Apply a role change: persist to DB then update local state */
  function handleRoleChange(userId, newRole) {
    fetch(`/api/admin/users/${userId}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    })
      .then((r) => r.json().then((body) => ({ ok: r.ok, body })))
      .then(({ ok, body }) => {
        if (!ok) throw new Error(body.message || "Failed to update role");
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
        );
        closeModal();
      })
      .catch((e) => {
        setError(e.message);
        closeModal();
      });
  }

  /* Toggle Active ↔ Blocked: persist to DB then update local state */
  function handleBlockToggle(userId) {
    const target = users.find((u) => u.id === userId);
    const newBlocked = target?.status === "Active" ? 1 : 0;

    fetch(`/api/admin/users/${userId}/block`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_blocked: newBlocked }),
    })
      .then((r) => r.json().then((body) => ({ ok: r.ok, body })))
      .then(({ ok, body }) => {
        if (!ok)
          throw new Error(body.message || "Failed to update block status");
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, status: newBlocked === 1 ? "Blocked" : "Active" }
              : u,
          ),
        );
        closeModal();
      })
      .catch((e) => {
        setError(e.message);
        closeModal();
      });
  }

  return (
    <>
      {/* ── Loading / error banners ──────────────────────────────────── */}
      {loading && <div className={styles.feedback}>Loading users…</div>}
      {error && (
        <div className={`${styles.feedback} ${styles.feedbackError}`}>
          {error}
          <button
            className={styles.feedbackClose}
            type="button"
            onClick={() => setError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className={styles.card}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              {/* ── Column headers ────────────────────────────────────── */}
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Current Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              {/* ── Data rows ─────────────────────────────────────────── */}
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={styles.row}>
                    {/* Name + avatar */}
                    <td>
                      <div className={styles.nameCell}>
                        <AvatarInitials name={u.name} size={32} />
                        <span className={styles.name}>{u.name}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className={styles.email}>{u.email}</td>

                    {/* Phone */}
                    <td className={styles.phone}>{u.phone}</td>

                    {/* Role badge */}
                    <td>
                      <span
                        className={`${styles.roleBadge} ${styles[ROLE_CLASS[u.role]]}`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* Status dot + label */}
                    <td>
                      <span
                        className={`${styles.status} ${u.status === "Active" ? styles.active : styles.blocked}`}
                      >
                        {u.status}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.btnRole}
                          type="button"
                          onClick={() => openModal(u, "changeRole")}
                        >
                          Change Role
                        </button>
                        <button
                          className={`${styles.btnBlock} ${u.status === "Blocked" ? styles.btnUnblock : ""}`}
                          type="button"
                          onClick={() => openModal(u, "blockUser")}
                        >
                          {u.status === "Blocked" ? "Unblock" : "Block User"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      {modalType === "changeRole" && modalUser && (
        <ChangeRoleModal
          user={modalUser}
          onConfirm={handleRoleChange}
          onClose={closeModal}
        />
      )}
      {modalType === "blockUser" && modalUser && (
        <BlockUserModal
          user={modalUser}
          onConfirm={handleBlockToggle}
          onClose={closeModal}
        />
      )}
    </>
  );
}

export default UserDatabase;
