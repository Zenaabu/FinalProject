import React from "react";
import "./Header.css";

function Header() {
  return (
    <header className="portal-header">
      <div className="portal-header__top">
        <div className="portal-header__logo">Blue Mars</div>
      </div>

      <nav className="portal-header__nav">
        <ul className="portal-header__nav-list">
          <li>
            <a href="#">Dashboard</a>
          </li>
          <li>
            <a href="#">Course Catalog</a>
          </li>
          <li>
            <a href="#">My Courses</a>
          </li>
          <li>
            <a href="#">Learning Center</a>
          </li>
          <li>
            <a href="#">Profile</a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
