import { Link } from "react-router-dom";
import styles from "./HeroSection.module.css";
import heroBg from "../../assets/summervibe-srufing.png";

function HeroSection() {
  return (
    <section
      className={styles.hero}
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      {/* Dark overlay for text legibility */}
      <div className={styles.overlay} />

      <div className={styles.content}>
        <h1 className={styles.slogan}>
          Ride the wave,
          <br />
          <span className={styles.accent}>master the ocean</span>
        </h1>
        <p className={styles.subtext}>
          Learn from world-class instructors, connect with riders worldwide, and
          start your surf journey today.
        </p>
        <div className={styles.actions}>
          <Link to="/signup" className={styles.ctaButton}>
            Sign Up Free
          </Link>
          <Link to="/courses" className={styles.secondaryButton}>
            Explore Courses
          </Link>
        </div>
      </div>

      {/* Wave divider */}
      <div className={styles.waveDivider}>
        <svg
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,50 C300,95 600,5 900,55 C1100,90 1300,20 1440,50 L1440,90 L0,90 Z"
            fill="#f0f7ff"
          />
        </svg>
      </div>
    </section>
  );
}

export default HeroSection;
