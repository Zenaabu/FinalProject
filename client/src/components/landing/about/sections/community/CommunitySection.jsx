import { Link } from "react-router-dom";
import firecampImg from "../../../../../assets/aboutusImegs/firecamp.jpg";
import styles from "./CommunitySection.module.css";

function CommunitySection() {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {/* ── LEFT: Image ── */}
        <div className={styles.imageCol}>
          <img
            src={firecampImg}
            alt="Blue Mars community around a beach bonfire"
            className={styles.image}
          />
        </div>

        {/* ── RIGHT: Text ── */}
        <div className={styles.textCol}>
          <span className={styles.eyebrow}>Our Community</span>
          <h2 className={styles.title}>Together in and out of the water.</h2>
          <p className={styles.body}>
            From surf sessions and ocean cleanups to BBQs and workshops  we do
            more than surf. We build friendships, share knowledge, and create
            memories that last.
          </p>
          <Link to="/signup" className={styles.button}>
            Join the Club
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CommunitySection;
