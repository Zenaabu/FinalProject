import styles from "./AboutPage.module.css";
import AboutHero from "./sections/hero/AboutHero";
import AboutStory from "./sections/story/AboutStory";
import OurValues from "./sections/values/OurValues";
import CommunitySection from "./sections/community/CommunitySection";
import CTABanner from "./sections/cta/CTABanner";

function AboutPage() {
  return (
    <div className={styles.page}>
      <AboutHero />
      <AboutStory />
      <OurValues />
      <CommunitySection />
      <CTABanner />
    </div>
  );
}

export default AboutPage;
