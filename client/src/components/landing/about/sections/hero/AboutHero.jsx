import surfSchoolImg from "../../../../../assets/aboutusImegs/surfshcool.jpg";
import styles from "./AboutHero.module.css";

function AboutHero() {
  return (
    <section className={styles.hero}>
      <img
        src={surfSchoolImg}
        alt="Surf School sign"
        className={styles.bgImage}
      />
      <div className={styles.overlay} />
      <div className={styles.content}>
        <div className={styles.waveDecor}>
          <svg
            viewBox="0 0 80 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 6 C10 0, 20 12, 30 6 C40 0, 50 12, 60 6 C70 0, 75 12, 80 6"
              stroke="#7ee8f8"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h1 className={styles.title}>About Us</h1>
        <p className={styles.subtitle}>
          We're more than a surf club — we're a community built by the love of
          the ocean and the pursuit of adventure.
        </p>
      </div>
      <div className={styles.waveDivider}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path
            d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    </section>
  );
}

export default AboutHero;
