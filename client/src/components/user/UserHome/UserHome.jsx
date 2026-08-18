// ─── UserHome.jsx ─────────────────────────────────────────────────────────────
// Landing page of /user — welcome message, today's surf conditions, and the
// user's enrolled courses (or a "browse courses" promo if they have none).
// ──────────────────────────────────────────────────────────────────────────────

import useSession from "../../auth/useSession";
import WeatherWidget from "../Dashboard/WeatherWidget/WeatherWidget";
import MyCourses from "./MyCourses";
import EmailReminderBanner from "./EmailReminderBanner";
import styles from "./UserHome.module.css";

function UserHome() {
  const { user } = useSession();
  const firstName = user?.first_name || "Surfer";

  return (
    <div className={styles.home}>
      <div className={styles.welcome}>
        <h1 className={styles.title}>Welcome back, {firstName}!</h1>
        <p className={styles.subtitle}>Welcome to Blue Mars Surf Club</p>
      </div>
      <EmailReminderBanner />
      <WeatherWidget />
      <MyCourses />
    </div>
  );
}

export default UserHome;
