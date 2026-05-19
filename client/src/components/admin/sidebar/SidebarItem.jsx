// ─── SidebarItem.jsx ──────────────────────────────────────────────────────────
// Renders a single navigation row: icon + Hebrew label.
// Uses React Router's NavLink so the `active` class is applied automatically
// when the current URL matches `item.path`.
// ──────────────────────────────────────────────────────────────────────────────

import { NavLink } from "react-router-dom";
import SidebarIcon from "./SidebarIcon";
import styles from "./SidebarItem.module.css";

function SidebarItem({ item }) {
  return (
    <li className={styles.item}>
      <NavLink
        to={item.path}
        // `end` prevents /admin from matching every /admin/* sub-route
        end={item.path === "/admin"}
        className={({ isActive }) =>
          `${styles.link} ${isActive ? styles.active : ""}`
        }
        title={item.labelEn}
      >
        <span className={styles.iconWrap}>
          <SidebarIcon name={item.icon} />
        </span>
        <span className={styles.label}>{item.labelEn}</span>
      </NavLink>
    </li>
  );
}

export default SidebarItem;
