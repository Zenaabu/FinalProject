import { Link } from "react-router-dom";
import styles from "./CTABanner.module.css";

function CTABanner() {
  return (
    <section className={styles.banner}>
      <div className={styles.content}>
        <div className={styles.text}>
          <h2 className={styles.title}>Ready to be part of the club?</h2>
          <p className={styles.subtitle}>
            Join us and experience the surf lifestyle.
          </p>
        </div>
        <Link to="/signup" className={styles.button}>
          Join the Club
        </Link>
      </div>
    </section>
  );
}

export default CTABanner;
