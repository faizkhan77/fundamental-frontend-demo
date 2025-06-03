// src/components/AboutSection.jsx
import React from "react";

const AboutSection = ({ stockName, aboutInfo, keyPoints }) => {
  if (!aboutInfo && (!keyPoints || keyPoints.length === 0)) {
    // Only render if there's something to show, or adjust to always show the section card
    return null;
  }

  return (
    <section className="section-card about-section">
      <h2>About {stockName || "the Company"}</h2>
      {aboutInfo && <p>{aboutInfo}</p>}
      {keyPoints && keyPoints.length > 0 && (
        <>
          <h3 style={{ marginTop: "20px", fontSize: "1.1em", color: "#444" }}>
            Key Points:
          </h3>
          <ul>
            {keyPoints.map((point, i) => (
              <li key={`kp-${i}`}>{point}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
};

export default AboutSection;
