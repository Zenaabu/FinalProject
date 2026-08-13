import styles from "./VolumeCalculatorHero.module.css";
import surfboardIcon from "../../../../../assets/surfboard.png";

function VolumeCalculatorHero() {
  return (
    <div className={styles.hero}>
      <img
        src={surfboardIcon}
        alt=""
        className={styles.icon}
        aria-hidden="true"
      />
      <h1 className={styles.heading}>
        Find Your <span className={styles.accent}>Perfect Volume</span>
      </h1>

      <p className={styles.subtext}>
        Board volume is the difference between fighting for every wave and
        paddling into it with ease. Answer a couple of quick questions and
        we'll do the math for you.
      </p>
    </div>
  );
}

export default VolumeCalculatorHero;
