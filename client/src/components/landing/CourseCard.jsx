import { Link } from "react-router-dom";
import styles from "./CourseCard.module.css";

function CourseCard({ course }) {
  const { title, description, price, level, features, buttonLabel, image } =
    course;

  return (
    <article className={styles.card}>
      {/* ── Photo ── */}
      <div className={styles.imageWrapper}>
        {image ? (
          <img src={image} alt={title} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
      </div>

      {/* ── Card body ── */}
      <div className={styles.body}>
        {/* Level badge */}
        <span className={`${styles.badge} ${styles[`badge${level}`]}`}>
          {level}
        </span>

        {/* Title + description */}
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>

        {/* Price */}
        <div className={styles.priceRow}>
          <span className={styles.price}>${price}</span>
          <span className={styles.priceUnit}> per month</span>
        </div>

        {/* Feature list */}
        <ul className={styles.features}>
          {features.map((feat) => (
            <li key={feat} className={styles.featureItem}>
              <svg
                className={styles.check}
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 10l4.5 4.5L16 6"
                  stroke="#0ea5e9"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {feat}
            </li>
          ))}
        </ul>

        {/* CTA button */}
        <Link to="/signup" className={styles.button}>
          {buttonLabel}
        </Link>
      </div>
    </article>
  );
}

export default CourseCard;
