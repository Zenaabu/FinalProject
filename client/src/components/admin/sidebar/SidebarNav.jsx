// ─── SidebarNav.jsx ───────────────────────────────────────────────────────────
// Renders one SidebarItem per nav entry inside a semantic <nav> element.
// Defaults to the admin NAV_ITEMS, but any area (e.g. the instructor panel)
// can pass its own items and root path.
// ──────────────────────────────────────────────────────────────────────────────

import { NAV_ITEMS } from "./navConfig";
import SidebarItem from "./SidebarItem";
import styles from "./SidebarNav.module.css";

function SidebarNav({
  items = NAV_ITEMS,
  rootPath = "/admin",
  ariaLabel = "Admin navigation",
}) {
  return (
    <nav className={styles.nav} aria-label={ariaLabel}>
      <ul className={styles.list}>
        {items.map((item) => (
          <SidebarItem key={item.id} item={item} rootPath={rootPath} />
        ))}
      </ul>
    </nav>
  );
}

export default SidebarNav;
