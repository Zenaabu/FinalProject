import CourseCard from "./CourseCard";
import styles from "./CoursesGrid.module.css";
import beginnerImg from "../../assets/coursesCardsImegs/biggener.png";
import intermediateImg from "../../assets/coursesCardsImegs/intermidate.png";
import advancedImg from "../../assets/coursesCardsImegs/advance.png";

const COURSES = [
  {
    id: 1,
    level: "Beginner",
    title: "Start Your Journey",
    description: "Perfect for those who've never touched a surfboard",
    price: 199,
    image: beginnerImg,
    features: [
      "8 sessions per month",
      "Basic wave theory",
      "Safety & ocean awareness",
      "Board provided",
      "Small group classes (4-6 people)",
    ],
    buttonLabel: "Join Beginner",
  },
  {
    id: 2,
    level: "Intermediate",
    title: "Ride the Face",
    description: "For surfers who can stand up and want to start turning",
    price: 269,
    image: intermediateImg,
    features: [
      "10 sessions per month",
      "Wave reading & positioning",
      "Turning fundamentals",
      "Video feedback sessions",
      "Semi-private coaching (2-3 people)",
    ],
    buttonLabel: "Join Intermediate",
  },
  {
    id: 3,
    level: "Advanced",
    title: "Master the Lineup",
    description: "Push your limits with expert coaching in real conditions",
    price: 349,
    image: advancedImg,
    features: [
      "Unlimited sessions",
      "Aerial & barrel techniques",
      "Competition preparation",
      "1-on-1 coaching available",
      "Priority lineup access",
    ],
    buttonLabel: "Join Advanced",
  },
];

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
