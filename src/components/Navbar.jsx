// src/components/Navbar.jsx
import React from "react";
import { useTheme } from "../context/ThemeContext"; // Import useTheme
import "./Navbar.css";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme(); // Get theme and toggle function

  return (
    <nav className="app-navbar">
      <div className="navbar-container">
        <div className="navbar-logo">BrainFog</div>
        <button onClick={toggleTheme} className="theme-toggle-button">
          Switch to {theme === "light" ? "Dark" : "Light"} Mode
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
