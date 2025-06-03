// src/components/StickySubNav.jsx
import React, { useState, useEffect, useRef } from "react";
import "./StickySubNav.css";

const StickySubNav = ({ stockName, sections, onNavClick }) => {
  const [activeSection, setActiveSection] = useState("");
  const navRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const navTop = nav.offsetTop;

    const handleScroll = () => {
      if (window.scrollY > navTop) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }

      let currentSectionId = "";
      // MODIFIED: Adjust threshold based on new sticky position (top: 0)
      // This should be approximately the height of your sticky nav + a small buffer.
      // Estimated height of sticky nav: ~70px. Buffer: 20px.
      const threshold = 90; // Adjust as needed

      sections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= threshold && rect.bottom >= threshold) {
            currentSectionId = section.id;
          }
        }
      });

      setActiveSection((prevActiveSection) => {
        if (currentSectionId && currentSectionId !== prevActiveSection) {
          return currentSectionId;
        }
        if (!currentSectionId && prevActiveSection) {
          if (sections.length > 0) {
            const firstSectionEl = document.getElementById(sections[0].id);
            if (firstSectionEl) {
              const firstSectionRect = firstSectionEl.getBoundingClientRect();
              if (firstSectionRect.top > threshold) {
                return "";
              }
            } else {
              return "";
            }
          } else {
            return "";
          }
        }
        return prevActiveSection;
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [sections]);

  const handleNavClick = (sectionId, event) => {
    event.preventDefault();
    onNavClick(sectionId);
  };

  return (
    <div
      ref={navRef}
      className={`sticky-subnav-wrapper ${isSticky ? "sticky" : ""}`}
    >
      <div className="sticky-subnav-stock-name">{stockName}</div>
      <nav className="sticky-subnav-links">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={activeSection === section.id ? "active" : ""}
            onClick={(e) => handleNavClick(section.id, e)}
          >
            {section.label}
          </a>
        ))}
      </nav>
    </div>
  );
};

export default StickySubNav;
