// ─── LessonAccordionList.jsx ──────────────────────────────────────────────────
// Container below CourseHeaderCard. Renders a LessonAccordionItem per lesson.
// ──────────────────────────────────────────────────────────────────────────────

import LessonAccordionItem from "./LessonAccordionItem";
import styles from "./LessonAccordionList.module.css";

function LessonAccordionList({
  lessons,
  courseId,
  courseInstructor,
  onLessonsChanged,
  nested = false,
}) {
  return (
    <div className={nested ? styles.wrapperNested : styles.wrapper}>
      <h3 className={styles.heading}>Lessons ({lessons.length})</h3>
      <div className={styles.list}>
        {lessons.length === 0 ? (
          <p className={styles.heading}>
            This course has no lessons scheduled yet.
          </p>
        ) : (
          lessons.map((lesson) => (
            <LessonAccordionItem
              key={lesson.lesson_id}
              lesson={lesson}
              courseId={courseId}
              courseInstructor={courseInstructor}
              onLessonsChanged={onLessonsChanged}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default LessonAccordionList;
