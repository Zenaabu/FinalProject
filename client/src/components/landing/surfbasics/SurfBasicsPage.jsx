import styles from "./SurfBasicsPage.module.css";
import SurfBasicsHero from "./sections/hero/SurfBasicsHero";
import VideoGrid from "./sections/videos/VideoGrid";
import bgImage from "../../../assets/surfbasics/benniersurfing.jpg";

function SurfBasicsPage() {
  return (
    <div className={styles.page} style={{ backgroundImage: `url(${bgImage})` }}>
      <div className={styles.content}>
        <SurfBasicsHero />
        <VideoGrid />
      </div>
    </div>
  );
}

export default SurfBasicsPage;
