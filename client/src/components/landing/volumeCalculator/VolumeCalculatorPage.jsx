import styles from "./VolumeCalculatorPage.module.css";
import VolumeCalculatorHero from "./sections/hero/VolumeCalculatorHero";
import VolumeCalculatorForm from "./sections/calculator/VolumeCalculatorForm";

function VolumeCalculatorPage() {
  return (
    <div className={styles.page}>
      <VolumeCalculatorHero />
      <VolumeCalculatorForm />
    </div>
  );
}

export default VolumeCalculatorPage;
