// ─── HealthScreeningModal.jsx ───────────────────────────────────────────────
// Shown right before a new account is created, once the sign-up form itself
// is valid. Surfing is a physical sport, so we ask a short yes/no health
// screening — if anything comes back "yes" we point the user to a doctor
// instead of creating the account; only a clean "no" on every question lets
// the real signup request (onCleared) fire.
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { HeartPulse, ShieldCheck, AlertTriangle } from "lucide-react";
import styles from "./HealthScreeningModal.module.css";

const QUESTIONS = [
  {
    id: "heart",
    text: "Do you have any heart condition or cardiovascular disease (e.g. arrhythmia, heart attack, high blood pressure requiring medication)?",
  },
  {
    id: "cancer",
    text: "Have you been diagnosed with cancer, or are you currently receiving treatment for cancer?",
  },
  {
    id: "respiratory",
    text: "Do you have a respiratory condition (e.g. severe asthma) that could be triggered by strenuous activity in the water?",
  },
  {
    id: "neurological",
    text: "Have you experienced fainting, seizures, or dizzy spells in the past 12 months?",
  },
  {
    id: "injury",
    text: "Do you have any injury, recent surgery, or other medical condition that limits your ability to swim or perform strenuous physical activity?",
  },
];

function HealthScreeningModal({ onClose, onCleared, submitting }) {
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const allAnswered = QUESTIONS.every(
    (q) => answers[q.id] === "yes" || answers[q.id] === "no",
  );
  const hasRisk = QUESTIONS.some((q) => answers[q.id] === "yes");

  const handleAnswer = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div
      className={styles.overlay}
      onClick={submitting ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Health screening"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {!showResult && (
          <>
            <div className={styles.iconWrap}>
              <HeartPulse size={26} />
            </div>
            <h2 className={styles.title}>Health Screening</h2>
            <p className={styles.subtitle}>
              Surfing is a physical sport out on open water. Please answer
              honestly so we can make sure it's safe for you to join.
            </p>

            <div className={styles.questionList}>
              {QUESTIONS.map((q, index) => (
                <div key={q.id} className={styles.questionItem}>
                  <p className={styles.questionText}>
                    <span className={styles.questionNumber}>
                      {index + 1}.
                    </span>{" "}
                    {q.text}
                  </p>
                  <div className={styles.answerPills}>
                    <button
                      type="button"
                      className={`${styles.answerPill} ${answers[q.id] === "no" ? styles.answerPillActiveNo : ""}`}
                      onClick={() => handleAnswer(q.id, "no")}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      className={`${styles.answerPill} ${answers[q.id] === "yes" ? styles.answerPillActiveYes : ""}`}
                      onClick={() => handleAnswer(q.id, "yes")}
                    >
                      Yes
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <button
                type="button"
                className={styles.btnCancel}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnContinue}
                onClick={() => setShowResult(true)}
                disabled={!allAnswered}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {showResult && hasRisk && (
          <>
            <div className={`${styles.iconWrap} ${styles.iconWrapWarning}`}>
              <AlertTriangle size={26} />
            </div>
            <h2 className={styles.title}>Please See a Doctor First</h2>
            <p className={styles.resultMessage}>
              Based on your answers, we'd like you to get medical clearance
              from your doctor before joining our surf courses. Your safety
              always comes first — once you have your doctor's approval,
              come back and we'd love to have you out on the water.
            </p>
            <div className={styles.footer}>
              <button
                type="button"
                className={styles.btnContinue}
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </>
        )}

        {showResult && !hasRisk && (
          <>
            <div className={`${styles.iconWrap} ${styles.iconWrapSuccess}`}>
              <ShieldCheck size={26} />
            </div>
            <h2 className={styles.title}>All Clear!</h2>
            <p className={styles.resultMessage}>
              Thanks for confirming. Let's create your account and get you
              ready for the waves.
            </p>
            <div className={styles.footer}>
              <button
                type="button"
                className={styles.btnContinue}
                onClick={onCleared}
                disabled={submitting}
              >
                {submitting ? "Creating account..." : "Create My Account"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default HealthScreeningModal;
