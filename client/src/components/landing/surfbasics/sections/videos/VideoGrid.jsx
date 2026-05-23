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
    title: "Learn with BlueMars",
    description:
      "Whether you’re stepping on a surfboard for the first time or looking to improve your skills, our surf courses are designed for every level — beginner, intermediate, and advanced. Learn proper techniques, ocean safety, and real surfing fundamentals with step-by-step guidance..",
    duration: "4:12",
    videoSrc: "/videos/beginner.mp4",
  },
  {
    epNumber: 2,
    title: "Surf Safety Essentials",
    description:
      "Before chasing waves, every surfer needs to understand safety. In this lesson, we’ll cover the essential rules of the ocean, how to protect yourself and others in the water, and the habits every surfer should know before paddling out.",
    duration: "6:15",
    videoSrc: "/videos/intermediate.mp4",
  },
  {
    epNumber: 3,
    title: "Standing Up",
    description:
      "The pop-up is the heart of surfing. We break it down into a simple two-step motion you can practise on dry land until it becomes second nature before you ever hit the surf.",
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
