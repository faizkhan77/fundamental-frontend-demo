// src/components/ProsConsSection.jsx
import React from "react";

const ProsConsSection = ({ pros, cons }) => {
  const hasPros = pros && pros.length > 0;
  const hasCons = cons && cons.length > 0;

  if (!hasPros && !hasCons) {
    return null; // Don't render if no pros or cons
  }

  return (
    <section className="pros-cons-grid">
      {hasPros && (
        <div className="pros">
          <h3>Pros</h3>
          <ul>
            {pros.map((pro, i) => (
              <li key={`pro-${i}`}>{pro}</li>
            ))}
          </ul>
        </div>
      )}
      {hasCons && (
        <div className="cons">
          <h3>Cons</h3>
          <ul>
            {cons.map((con, i) => (
              <li key={`con-${i}`}>{con}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default ProsConsSection;
