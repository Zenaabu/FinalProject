import { useState } from "react";
import styles from "./VolumeCalculatorForm.module.css";
import {
  SKILL_LEVELS,
  FITNESS_LEVELS,
  calculateVolumeLiters,
} from "./volumeMath";

const SKILL_TIPS = {
  beginner:
    "Extra volume keeps you stable and paddling early — exactly what you want while you're learning.",
  intermediate:
    "A balanced volume that still forgives a late paddle without holding back your progress.",
  advanced:
    "Enough volume for speed between sections without sacrificing control.",
  expert: "A lean, responsive volume built for performance surfing.",
};

function VolumeCalculatorForm() {
  const [weight, setWeight] = useState("");
  const [skillLevel, setSkillLevel] = useState(SKILL_LEVELS[0].value);
  const [fitnessLevel, setFitnessLevel] = useState(FITNESS_LEVELS[1].value);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function handleCalculate() {
    const weightKg = parseFloat(weight);
    if (!weight || isNaN(weightKg) || weightKg <= 0) {
      setError("Enter your weight to get a recommendation.");
      setResult(null);
      return;
    }

    setError("");
    setResult(calculateVolumeLiters(weightKg, skillLevel, fitnessLevel));
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor="weight" className={styles.label}>
            Weight
          </label>
          <div className={styles.inputRow}>
            <input
              id="weight"
              type="number"
              min="1"
              step="0.5"
              inputMode="decimal"
              placeholder="e.g. 75"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className={styles.input}
            />
            <span className={styles.unit}>kg</span>
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="skillLevel" className={styles.label}>
            Skill Level
          </label>
          <select
            id="skillLevel"
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value)}
            className={styles.select}
          >
            {SKILL_LEVELS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="fitnessLevel" className={styles.label}>
            Fitness Level
          </label>
          <select
            id="fitnessLevel"
            value={fitnessLevel}
            onChange={(e) => setFitnessLevel(e.target.value)}
            className={styles.select}
          >
            {FITNESS_LEVELS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.resultPanel}>
        <span className={styles.resultLabel}>Recommended Volume</span>

        {result !== null ? (
          <>
            <span className={styles.resultValue}>{result} L</span>
            <p className={styles.resultTip}>{SKILL_TIPS[skillLevel]}</p>
          </>
        ) : (
          <span className={styles.resultPlaceholder}>—</span>
        )}

        {error && <span className={styles.error}>{error}</span>}

        <button
          type="button"
          onClick={handleCalculate}
          className={styles.calculateBtn}
        >
          Calculate
        </button>
      </div>
    </div>
  );
}

export default VolumeCalculatorForm;
