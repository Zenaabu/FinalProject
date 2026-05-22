import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./VideoGrid.module.css";
import VideoCard from "./VideoCard";

/* ── Episode data ─────────────────────────────────────────────
   When you have the video files, add a `videoSrc` key to each
   object, e.g.:  videoSrc: "/videos/paddling-basics.mp4"
   ─────────────────────────────────────────────────────────── */
const EPISODES = [
  {
    epNumber: 1,
    title: "Paddling Basics",
    description:
      "Master the foundational paddle technique that powers every wave catch. Learn arm positioning, timing, and the body posture that keeps you fast and efficient in the water.",
    duration: "4:12",
    videoSrc: "/videos/beginner.mp4",
  },
  {
    epNumber: 2,
    title: "Standing Up",
    description:
      "The pop-up is the heart of surfing. We break it down into a simple two-step motion you can practise on dry land until it becomes second nature before you ever hit the surf.",
    duration: "6:15",
    videoSrc: "/videos/intermediate.mp4",
  },
  {
    epNumber: 3,
    title: "Ocean Safety",
    description:
      "Understand rip currents, wave timing, and surf etiquette so your first session is confident, safe, and enjoyable for everyone sharing the lineup.",
    duration: "5:48",
    videoSrc: "/videos/advance.mp4",
  },
];

function VideoGrid() {
  const [activeEp, setActiveEp] = useState(null);

  return (
    <section className={styles.section}>
      {/* ── Cards grid ── */}
      <div className={styles.grid}>
        {EPISODES.map((ep) => (
          <VideoCard
            key={ep.epNumber}
            episode={ep}
            isPlaying={activeEp === ep.epNumber}
            onPlay={() => setActiveEp(ep.epNumber)}
            onStop={() => setActiveEp(null)}
          />
        ))}
      </div>

      {/* ── CTA ── */}
      <div className={styles.ctaWrapper}>
        <Link to="/signup" className={styles.ctaButton}>
          Sign Up To Hit The Waves
        </Link>
      </div>
    </section>
  );
}

export default VideoGrid;
