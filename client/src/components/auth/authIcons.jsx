const iconStroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.8",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const UserIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...iconStroke}>
    <path d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="8" r="4" />
  </svg>
);

export const MailIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...iconStroke}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);

export const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...iconStroke}>
    <path d="M22 16.9v2.5a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 1h2.5a2 2 0 0 1 2 1.7c.1.8.3 1.5.5 2.2a2 2 0 0 1-.5 2.1L7.5 8.1a16 16 0 0 0 8.4 8.4l1.1-1.1a2 2 0 0 1 2.1-.5c.7.2 1.4.4 2.2.5a2 2 0 0 1 1.7 1.5Z" />
  </svg>
);

export const LockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...iconStroke}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

export const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...iconStroke}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </svg>
);
