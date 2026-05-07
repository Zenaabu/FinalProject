import styles from "./ShowcaseSection.module.css";
import surfGroup from "../../assets/summervibe-srufing.png";

function ShowcaseSection() {
  return (
    <section className={styles.showcase}>
      <div className={styles.header}>
        <span className={styles.label}>Why Blue Mars</span>
        <h2 className={styles.title}>Everything you need to ride</h2>
        <p className={styles.subtitle}>
          From your very first lesson to mastering the lineup — we've built the
          platform around your journey.
        </p>
      </div>

      <div className={styles.grid}>
        {/* ── Card 1: Learn ── */}
        <div className={styles.card}>
          <div className={`${styles.imageWrapper} ${styles.gradientCard}`}>
            <div className={styles.gradientOverlay}>
              <span className={styles.waveIcon}>🏄</span>
              <p className={styles.gradientText}>One-on-One Coaching</p>
            </div>
            <span className={styles.cardTag}>Learn</span>
          </div>
          <div className={styles.cardBody}>
            <h3 className={styles.cardTitle}>Expert One-on-One Instruction</h3>
            <p className={styles.cardText}>
              Get personal coaching from seasoned surfers who will guide you
              from your first paddle to catching your first wave — safely and
              confidently.
            </p>
          </div>
        </div>

        {/* ── Card 2: Community ── */}
        <div className={styles.card}>
          <div className={styles.imageWrapper}>
            <img
              src={surfGroup}
              alt="Group of surfers walking out of the ocean at golden hour"
              className={styles.image}
            />
            <span className={styles.cardTag}>Community</span>
          </div>
          <div className={styles.cardBody}>
            <h3 className={styles.cardTitle}>A Thriving Surf Community</h3>
            <p className={styles.cardText}>
              Ride alongside passionate surfers from around the world. Share
              sessions, celebrate milestones, and build lifelong friendships in
              the water.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ShowcaseSection;
