// ─── CourseRosters.jsx ────────────────────────────────────────────────────────
// Child view 2: shows the student list for a selected course.
// The dropdown controls which course's roster is displayed.
// Replace COURSES with an API call when the backend is ready.
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import AvatarInitials from "../../dashboard/shared/AvatarInitials";
import styles from "./CourseRosters.module.css";

/* ── Mock data ───────────────────────────────────────────────────────────── */
const COURSES = [
  {
    id: "course-1",
    label: "Beginner Surf Basics — June 10",
    students: [
      {
        id: 1,
        name: "Lior Ben-David",
        phone: "050-123-4567",
        email: "lior@bluemars.com",
        date: "2026-05-17",
      },
      {
        id: 2,
        name: "Maya Katz",
        phone: "052-234-5678",
        email: "maya@bluemars.com",
        date: "2026-05-16",
      },
      {
        id: 3,
        name: "Eitan Shamir",
        phone: "054-345-6789",
        email: "eitan@bluemars.com",
        date: "2026-05-15",
      },
    ],
  },
  {
    id: "course-2",
    label: "Intermediate Carving — June 12",
    students: [
      {
        id: 4,
        name: "Noa Cohen",
        phone: "053-456-7890",
        email: "noa@bluemars.com",
        date: "2026-05-14",
      },
      {
        id: 5,
        name: "Avi Peretz",
        phone: "058-567-8901",
        email: "avi@bluemars.com",
        date: "2026-05-13",
      },
    ],
  },
  {
    id: "course-3",
    label: "Advanced Pipeline — June 15",
    students: [
      {
        id: 6,
        name: "Shira Levi",
        phone: "050-678-9012",
        email: "shira@bluemars.com",
        date: "2026-05-12",
      },
      {
        id: 7,
        name: "Dan Mizrahi",
        phone: "052-789-0123",
        email: "dan@bluemars.com",
        date: "2026-05-10",
      },
    ],
  },
];

function CourseRosters() {
  const [selectedId, setSelectedId] = useState(COURSES[0].id);

  const selected = COURSES.find((c) => c.id === selectedId);

  return (
    <div className={styles.card}>
      {/* ── Course selector ──────────────────────────────────────────── */}
      <div className={styles.selectorRow}>
        <label htmlFor="course-select" className={styles.selectorLabel}>
          Select Course
        </label>
        <select
          id="course-select"
          className={styles.select}
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {COURSES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Roster meta bar ──────────────────────────────────────────── */}
      <div className={styles.rosterMeta}>
        <span className={styles.courseName}>{selected.label}</span>
        <span className={styles.count}>
          {selected.students.length} participants
        </span>
      </div>

      {/* ── Roster table ─────────────────────────────────────────────── */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Participant Name</th>
              <th>Phone Number</th>
              <th>Email</th>
              <th>Registration Date</th>
            </tr>
          </thead>
          <tbody>
            {selected.students.map((s) => (
              <tr key={s.id} className={styles.row}>
                <td>
                  <div className={styles.nameCell}>
                    <AvatarInitials name={s.name} size={32} />
                    <span className={styles.name}>{s.name}</span>
                  </div>
                </td>
                <td className={styles.phone}>{s.phone}</td>
                <td className={styles.email}>{s.email}</td>
                <td className={styles.date}>{s.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CourseRosters;
