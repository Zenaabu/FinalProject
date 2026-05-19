// ─── UserDatabase.jsx ─────────────────────────────────────────────────────────
// Child view 1: master list of all registered users.
// Manages local user state (role updates, block/unblock toggles).
// Opens ChangeRoleModal or BlockUserModal based on which button is clicked.
// Replace INITIAL_USERS with an API call when the backend is ready.
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import AvatarInitials from "../../dashboard/shared/AvatarInitials";
import ChangeRoleModal from "../modals/ChangeRoleModal";
import BlockUserModal from "../modals/BlockUserModal";
import styles from "./UserDatabase.module.css";

/* ── Mock data ───────────────────────────────────────────────────────────── */
const INITIAL_USERS = [
  {
    id: 1,
    name: "Lior Ben-David",
    email: "lior@bluemars.com",
    phone: "050-123-4567",
    role: "User",
    status: "Active",
  },
  {
    id: 2,
    name: "Maya Katz",
    email: "maya@bluemars.com",
    phone: "052-234-5678",
    role: "Instructor",
    status: "Active",
  },
  {
    id: 3,
    name: "Eitan Shamir",
    email: "eitan@bluemars.com",
    phone: "054-345-6789",
    role: "User",
    status: "Blocked",
  },
  {
    id: 4,
    name: "Noa Cohen",
    email: "noa@bluemars.com",
    phone: "053-456-7890",
    role: "Manager",
    status: "Active",
  },
  {
    id: 5,
    name: "Avi Peretz",
    email: "avi@bluemars.com",
    phone: "058-567-8901",
    role: "User",
    status: "Active",
  },
];

/* Maps role name → CSS module class for the badge */
const ROLE_CLASS = {
  User: "roleUser",
  Instructor: "roleInstructor",
  Manager: "roleManager",
};

function UserDatabase() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [modalUser, setModalUser] = useState(null); // user being actioned
  const [modalType, setModalType] = useState(null); // "changeRole" | "blockUser"

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  function openModal(user, type) {
    setModalUser(user);
    setModalType(type);
  }

  function closeModal() {
    setModalUser(null);
    setModalType(null);
  }

  /* Apply a role change and close the modal */
  function handleRoleChange(userId, newRole) {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
    );
    closeModal();
  }

  /* Toggle Active ↔ Blocked and close the modal */
  function handleBlockToggle(userId) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === "Active" ? "Blocked" : "Active" }
          : u,
      ),
    );
    closeModal();
  }

  return (
    <>
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
