// ─── CourseList.jsx ───────────────────────────────────────────────────────────
// Master view: displays all courses in a table.
// Each row has a "Manage" button that lifts the selected course to CoursesMain.
// Replace MOCK_COURSES with an API call when the backend is ready.
// ──────────────────────────────────────────────────────────────────────────────

import styles from "./CourseList.module.css";

/* ── Mock data ───────────────────────────────────────────────────────────── */
const MOCK_COURSES = [
  {
    id: 1,
    name: "Open Water Diver",
    level: "Beginner",
    capacity: 12,
    price: 1200,
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    status: "Active",
    description: "Entry-level PADI open water certification course.",
    difficulty: "Beginner",
    instructor: "Maya Katz",
  },
  {
    id: 2,
    name: "Advanced Open Water",
    level: "Intermediate",
    capacity: 10,
    price: 1650,
    startDate: "2026-07-05",
    endDate: "2026-07-26",
    status: "Active",
    description: "Expands diving skills with five adventure dives.",
    difficulty: "Intermediate",
    instructor: "Lior Ben-David",
  },
  {
    id: 3,
    name: "Rescue Diver",
    level: "Advanced",
    capacity: 8,
    price: 2100,
    startDate: "2026-08-01",
    endDate: "2026-08-28",
    status: "Active",
    description: "Learn to prevent and manage problems in the water.",
    difficulty: "Advanced",
    instructor: "Maya Katz",
  },
  {
    id: 4,
    name: "Freediving Level 1",
    level: "Beginner",
    capacity: 8,
    price: 950,
    startDate: "2026-06-15",
    endDate: "2026-06-22",
    status: "Inactive",
    description: "Introduction to breath-hold diving techniques.",
    difficulty: "Beginner",
    instructor: "Noa Cohen",
  },
  {
    id: 5,
    name: "Divemaster",
    level: "Professional",
    capacity: 6,
    price: 4500,
    startDate: "2026-09-01",
    endDate: "2026-11-30",
    status: "Active",
    description: "First professional level in the PADI system.",
    difficulty: "Advanced",
    instructor: "Lior Ben-David",
  },
];

function CourseList({ onManage }) {
  return (
    <div className={styles.card}>
      {/* ── Card header ───────────────────────────────────────────── */}
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>All Courses</h2>
        <button className={styles.btnCreate} type="button">
          + Create New Course
        </button>
      </div>

      {/* ── Table ─────────────────────────────────────────────────── */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Course Name</th>
              <th>Level</th>
              <th>Capacity</th>
              <th>Price</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_COURSES.map((course) => (
              <tr key={course.id} className={styles.row}>
                <td className={styles.courseName}>{course.name}</td>
                <td>{course.level}</td>
                <td>{course.capacity}</td>
                <td>₪{course.price.toLocaleString()}</td>
                <td>{course.startDate}</td>
                <td>{course.endDate}</td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${
                      course.status === "Active"
                        ? styles.statusActive
                        : styles.statusInactive
                    }`}
                  >
                    {course.status}
                  </span>
                </td>
                <td>
                  <button
                    className={styles.btnManage}
                    type="button"
                    onClick={() => onManage(course)}
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CourseList;
