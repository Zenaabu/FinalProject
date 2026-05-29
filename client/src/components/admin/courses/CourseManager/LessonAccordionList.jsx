// ─── LessonAccordionList.jsx ──────────────────────────────────────────────────
// Container below CourseHeaderCard. Renders a LessonAccordionItem per lesson.
// ──────────────────────────────────────────────────────────────────────────────

import LessonAccordionItem from "./LessonAccordionItem";
import styles from "./LessonAccordionList.module.css";

function LessonAccordionList({ lessons, nested = false }) {
  return (
    <div className={nested ? styles.wrapperNested : styles.wrapper}>
      <h3 className={styles.heading}>Lessons ({lessons.length})</h3>
      <div className={styles.list}>
        {lessons.map((lesson, index) => (
          <LessonAccordionItem
            key={lesson.lesson_id}
            lesson={lesson}
            index={index + 1}
          />
        ))}
      </div>
    </div>
  );
}

export default LessonAccordionList;
