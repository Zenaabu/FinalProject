// ─── SidebarNav.jsx ───────────────────────────────────────────────────────────
// Receives the full NAV_ITEMS array from navConfig and renders one
// SidebarItem per entry inside a semantic <nav> element.
// ──────────────────────────────────────────────────────────────────────────────

import { NAV_ITEMS } from "./navConfig";
import SidebarItem from "./SidebarItem";
import styles from "./SidebarNav.module.css";

function SidebarNav() {
  return (
    <nav className={styles.nav} aria-label="Admin navigation">
      <ul className={styles.list}>
        {NAV_ITEMS.map((item) => (
          <SidebarItem key={item.id} item={item} />
        ))}
      </ul>
    </nav>
  );
}

export default SidebarNav;
