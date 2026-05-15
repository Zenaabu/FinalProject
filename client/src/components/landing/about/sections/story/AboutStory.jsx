import { Link } from "react-router-dom";
import surfboardImg from "../../../../../assets/aboutusImegs/surfboard.jpg";
import styles from "./AboutStory.module.css";

function AboutStory() {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {/* ── LEFT: Text ── */}
        <div className={styles.textCol}>
          <span className={styles.eyebrow}>Our Story</span>
          <h2 className={styles.title}>
            Born from the Ocean.
            <br />
            Built for Everyone.
          </h2>
          <p className={styles.body}>
            Blue Mars was founded with a simple mission: to share our passion
            for surfing and the ocean lifestyle with everyone. Whether you're a
            beginner catching your first wave or an experienced surfer, you'll
            find a place here.
          </p>
          <Link to="/signup" className={styles.button}>
            Learn More
          </Link>
        </div>

        {/* ── RIGHT: Image ── */}
        <div className={styles.imageCol}>
          <img
            src={surfboardImg}
            alt="Surfboard on the beach"
            className={styles.image}
          />
        </div>
      </div>
    </section>
  );
}

export default AboutStory;
