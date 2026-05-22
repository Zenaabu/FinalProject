import { useRef, useEffect } from "react";
import styles from "./VideoCard.module.css";

function VideoCard({ episode, isPlaying, onPlay, onStop }) {
  const { epNumber, title, description, duration, videoSrc } = episode;
  const epLabel = `EP ${String(epNumber).padStart(2, "0")}`;
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  return (
    <article className={styles.card}>
      {/* ── Thumbnail ── */}
      <div className={styles.thumbnail}>
        {/* Episode badge – top left */}
        {!isPlaying && <span className={styles.epBadge}>{epLabel}</span>}

        {/* Wave decoration – hidden when video is playing */}
        {!isPlaying && <div className={styles.wavePrimary} />}
        {!isPlaying && <div className={styles.waveSecondary} />}

        {/* Play button – hidden once playing */}
        {!isPlaying && (
          <button
            className={styles.playBtn}
            aria-label={`Play ${title}`}
            onClick={videoSrc ? onPlay : undefined}
          >
            <svg
              className={styles.playIcon}
              viewBox="0 0 56 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="28" cy="28" r="28" fill="rgba(255,255,255,0.82)" />
              <path d="M23 19.5l16 8.5-16 8.5V19.5z" fill="#0284c7" />
            </svg>
          </button>
        )}

        {/* Duration badge – hidden when playing */}
        {!isPlaying && <span className={styles.duration}>{duration}</span>}

        {/* Video element – always in DOM so pause works instantly */}
        {videoSrc && (
          <video
            ref={videoRef}
            className={`${styles.video} ${isPlaying ? styles.videoVisible : ""}`}
            src={videoSrc}
            controls
            controlsList="nodownload noremoteplayback nofullscreen"
            preload="metadata"
            onEnded={onStop}
          />
        )}
      </div>

      {/* ── Info ── */}
      <div className={styles.info}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </article>
  );
}

export default VideoCard;
