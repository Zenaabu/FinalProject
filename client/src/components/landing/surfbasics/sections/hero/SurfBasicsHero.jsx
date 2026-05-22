import styles from "./SurfBasicsHero.module.css";

function SurfBasicsHero() {
  return (
    <div className={styles.hero}>
      <h1 className={styles.heading}>
        Your Surf Journey <span className={styles.accent}>Starts Here</span>
      </h1>

      <p className={styles.subtext}>
        Bite-sized beginner lessons taught by Blue Mars instructors — covering
        everything you need before your first session in the water.
      </p>
    </div>
  );
}

export default SurfBasicsHero;
