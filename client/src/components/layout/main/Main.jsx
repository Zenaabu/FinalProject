import { Outlet } from "react-router-dom";
import Header from "../header/Header";
import styles from "./main.module.css";

function Main() {
  return (
    <div className={styles.page}>
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Main;
