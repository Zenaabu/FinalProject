import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import "./UserLayout.css";

function UserLayout() {
  return (
    <div className="user-layout">
      <Header />
      <main className="user-layout__content">
        <Outlet />
      </main>
    </div>
  );
}

export default UserLayout;
