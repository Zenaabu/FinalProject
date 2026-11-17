// ─── coursesData.js ───────────────────────────────────────────────────────────
// The three marketing plan cards (Beginner/Intermediate/Advanced). Shared by
// the landing page's CoursesGrid and the logged-in user dashboard's
// no-enrollment promo, so the copy only lives in one place.
// ──────────────────────────────────────────────────────────────────────────────

import beginnerImg from "../../../../assets/coursesCardsImegs/biggener.png";
import intermediateImg from "../../../../assets/coursesCardsImegs/intermidate.png";
import advancedImg from "../../../../assets/coursesCardsImegs/advance.png";

export const COURSES = [
  {
    id: 1,
    level: "Beginner",
    title: "Start Your Journey",
    description: "Perfect for those who've never touched a surfboard",
    image: beginnerImg,
    features: [
      "Basic wave theory",
      "Safety & ocean awareness",
      "Board provided",
    ],
    buttonLabel: "Join Beginner",
  },
  {
    id: 2,
    level: "Intermediate",
    title: "Ride the Face",
    description: "For surfers who can stand up and want to start turning",
    image: intermediateImg,
    features: [
      "Wave reading & positioning",
      "Turning fundamentals",
      "Video feedback sessions",
    ],
    buttonLabel: "Join Intermediate",
  },
  {
    id: 3,
    level: "Advanced",
    title: "Master the Lineup",
    description: "Push your limits with expert coaching in real conditions",
    image: advancedImg,
    features: [
      "Aerial & barrel techniques",
      "Competition preparation",
      "Priority lineup access",
    ],
    buttonLabel: "Join Advanced",
  },
];
