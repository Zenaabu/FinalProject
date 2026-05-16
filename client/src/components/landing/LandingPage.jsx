import HeroSection from "./sections/hero/HeroSection";
import CoursesGrid from "./sections/courses/CoursesGrid";
import CTABanner from "./about/sections/cta/CTABanner";

function LandingPage() {
  return (
    <>
      <HeroSection />
      <CoursesGrid />
      <CTABanner />
    </>
  );
}

export default LandingPage;
