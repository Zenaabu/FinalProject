import Navbar from "../layout/header/Header";
import HeroSection from "./HeroSection";
import CoursesGrid from "./CoursesGrid";
import styles from "./LandingPage.module.css";

function LandingPage() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main>
        <HeroSection />
        <CoursesGrid />
      </main>
    </div>
  );
}

export default LandingPage;
