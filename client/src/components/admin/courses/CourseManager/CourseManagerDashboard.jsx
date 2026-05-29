// ─── CourseManagerDashboard.jsx ───────────────────────────────────────────────
// Parent container for the vertical accordion course view.
// Owns all mock data and passes it down as props.
// Replace MOCK_COURSES with an API call when the backend is ready.
// ──────────────────────────────────────────────────────────────────────────────

import CourseHeaderCard from "./CourseHeaderCard";
import styles from "./CourseManagerDashboard.module.css";

/* ── Mock data ─────────────────────────────────────────────────────────────
   Uses database-style Primary Keys (course_id, lesson_id, user_id)
   so the shape is ready to be swapped for real API data.
   ───────────────────────────────────────────────────────────────────────── */
const MOCK_COURSES = [
  {
    course_id: "c-001",
    title: "Beginner Surf Course",
    level: "Beginner",
    status: "Active",
    instructor: "Jake Morrison",
    start_date: "2026-06-01",
    end_date: "2026-06-30",
    schedule: "Mon, Wed, Fri · 09:00 AM",
    capacity: 15,
    enrolled: 12,
    lessons: [
      {
        lesson_id: "l-001",
        title: "Safety First: Ocean Awareness",
        date: "2026-06-02",
        time: "09:00 (90 min)",
        location: "South Beach",
        students: [
          { user_id: "u-001", name: "Lior Ben-David", email: "lior@surf.com",  attendance_status: "present" },
          { user_id: "u-002", name: "Maya Cohen",      email: "maya@surf.com",  attendance_status: "absent"  },
          { user_id: "u-003", name: "Eitan Shamir",    email: "eitan@surf.com", attendance_status: "present" },
          { user_id: "u-004", name: "Noa Peretz",      email: "noa@surf.com",   attendance_status: "late"    },
        ],
      },
      {
        lesson_id: "l-002",
        title: "Board Basics & Paddling Technique",
        date: "2026-06-04",
        time: "09:00 (90 min)",
        location: "South Beach",
        students: [
          { user_id: "u-001", name: "Lior Ben-David", email: "lior@surf.com",  attendance_status: "present" },
          { user_id: "u-002", name: "Maya Cohen",      email: "maya@surf.com",  attendance_status: "present" },
          { user_id: "u-003", name: "Eitan Shamir",    email: "eitan@surf.com", attendance_status: "present" },
          { user_id: "u-004", name: "Noa Peretz",      email: "noa@surf.com",   attendance_status: "present" },
        ],
      },
      {
        lesson_id: "l-003",
        title: "Pop-Up Fundamentals",
        date: "2026-06-06",
        time: "09:00 (90 min)",
        location: "South Beach",
        students: [],
      },
    ],
  },
  {
    course_id: "c-002",
    title: "Intermediate Surf Course",
    level: "Intermediate",
    status: "Active",
    instructor: "Sarah Blake",
    start_date: "2026-06-01",
    end_date: "2026-06-30",
    schedule: "Tue, Thu · 11:00 AM",
    capacity: 12,
    enrolled: 8,
    lessons: [
      {
        lesson_id: "l-004",
        title: "Reading Waves & Surf Etiquette",
        date: "2026-06-03",
        time: "11:00 (90 min)",
        location: "North Shore",
        students: [
          { user_id: "u-005", name: "Dan Mizrahi", email: "dan@surf.com",  attendance_status: "present" },
          { user_id: "u-006", name: "Rina Golan",  email: "rina@surf.com", attendance_status: "present" },
          { user_id: "u-007", name: "Amit Levi",   email: "amit@surf.com", attendance_status: "late"    },
        ],
      },
      {
        lesson_id: "l-005",
        title: "Carving & Cutback Techniques",
        date: "2026-06-05",
        time: "11:00 (90 min)",
        location: "North Shore",
        students: [
          { user_id: "u-005", name: "Dan Mizrahi", email: "dan@surf.com",  attendance_status: "present" },
          { user_id: "u-006", name: "Rina Golan",  email: "rina@surf.com", attendance_status: "absent"  },
        ],
      },
    ],
  },
  {
    course_id: "c-003",
    title: "Advanced Surf Course",
    level: "Advanced",
    status: "Upcoming",
    instructor: "Marcus Rodriguez",
    start_date: "2026-07-01",
    end_date: "2026-07-31",
    schedule: "Mon, Wed, Fri · 06:00 AM",
    capacity: 10,
    enrolled: 5,
    lessons: [
      {
        lesson_id: "l-006",
        title: "Pipeline & Tube Riding",
        date: "2026-07-01",
        time: "06:00 (120 min)",
        location: "Main Break",
        students: [],
      },
      {
        lesson_id: "l-007",
        title: "Big Wave Preparation",
        date: "2026-07-03",
        time: "06:00 (120 min)",
        location: "Main Break",
        students: [],
      },
    ],
  },
];

function CourseManagerDashboard() {
  return (
    <div className={styles.dashboard}>
      {MOCK_COURSES.map((course) => (
        <CourseHeaderCard
          key={course.course_id}
          course={course}
          onEditCourse={() => console.log("Edit course:", course.course_id)}
        />
      ))}
    </div>
  );
}

export default CourseManagerDashboard;
