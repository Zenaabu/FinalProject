import CourseCard from "./CourseCard";
import { COURSES } from "./coursesData";
import styles from "./CoursesGrid.module.css";

function CoursesGrid() {
  return (
    <section id="courses" className={styles.section}>
      {/* Section header */}
      <div className={styles.header}>
        <span className={styles.label}>Our Courses</span>
        <h2 className={styles.title}>Find your level, ride your journey</h2>
        <p className={styles.subtitle}>
          Three structured tracks designed to take you from first-timer to
          lineup regular — at your own pace, with expert guidance.
        </p>
      </div>

      {/* 3-column card grid */}
      <div className={styles.grid}>
        {COURSES.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}

export default CoursesGrid;
