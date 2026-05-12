import styles from "./OurValues.module.css";

const VALUES = [
  {
    title: "Ocean Respect",
    description:
      "We respect the ocean and work to protect it for future generations.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M2 12c2-4 4-6 6-6s4 4 6 4 4-4 6-4"
          stroke="#0e6ba8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 18c2-4 4-6 6-6s4 4 6 4 4-4 6-4"
          stroke="#0ea5e9"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Community",
    description:
      "We're a friendly, supportive community that welcomes everyone.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
          stroke="#0e6ba8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="7" r="4" stroke="#0e6ba8" strokeWidth="2" />
        <path
          d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
          stroke="#0ea5e9"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Growth",
    description: "We believe in progress, both in and out of the water.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polyline
          points="23 6 13.5 15.5 8.5 10.5 1 18"
          stroke="#0e6ba8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="17 6 23 6 23 12"
          stroke="#0ea5e9"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Good Vibes",
    description:
      "Positive energy, good times, and a love for the surf lifestyle.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="5" stroke="#0e6ba8" strokeWidth="2" />
        <line
          x1="12"
          y1="1"
          x2="12"
          y2="3"
          stroke="#0ea5e9"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="12"
          y1="21"
          x2="12"
          y2="23"
          stroke="#0ea5e9"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="4.22"
          y1="4.22"
          x2="5.64"
          y2="5.64"
          stroke="#0ea5e9"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="18.36"
          y1="18.36"
          x2="19.78"
          y2="19.78"
          stroke="#0ea5e9"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="1"
          y1="12"
          x2="3"
          y2="12"
          stroke="#0ea5e9"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="21"
          y1="12"
          x2="23"
          y2="12"
          stroke="#0ea5e9"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="4.22"
          y1="19.78"
          x2="5.64"
          y2="18.36"
          stroke="#0ea5e9"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="18.36"
          y1="5.64"
          x2="19.78"
          y2="4.22"
          stroke="#0ea5e9"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

function OurValues() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>Our Values</span>
      </div>
      <div className={styles.grid}>
        {VALUES.map((v) => (
          <div key={v.title} className={styles.item}>
            <div className={styles.iconWrapper}>{v.icon}</div>
            <h3 className={styles.itemTitle}>{v.title}</h3>
            <p className={styles.itemBody}>{v.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default OurValues;
