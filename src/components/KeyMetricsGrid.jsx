// src/components/KeyMetricsGrid.jsx
import React from "react";

const MetricItem = ({ label, value, unit = "" }) => (
  <div className="metric-box">
    <span className="label">{label}</span>
    <span className="value">
      {value === "N/A" || value === null || typeof value === "undefined"
        ? "N/A"
        : unit === "₹" && typeof value === "number"
        ? `${unit}${value.toFixed(2)}`
        : unit === "₹"
        ? `${unit}${value}` // If value is already formatted string with Rs.
        : unit === "%" && typeof value === "number"
        ? `${value.toFixed(2)}${unit}`
        : unit === "%"
        ? `${value}${unit}` // If value is already formatted string with %
        : value}
    </span>
  </div>
);

const KeyMetricsGrid = ({ stockData }) => {
  if (!stockData) {
    return <p>Loading key metrics...</p>;
  }

  const metrics = [
    { label: "Market Cap", value: stockData.marketCapFormatted, unit: "" }, // Already formatted with "Cr"
    { label: "Stock P/E", value: stockData.stockPE, unit: "" },
    { label: "Current Price", value: stockData.currentPrice, unit: "₹" },
    { label: "Book Value", value: stockData.bookValueFormatted, unit: "₹" }, // Assumes bookValueFormatted includes ₹
    { label: "High / Low (52W)", value: stockData.yearHighLow, unit: "₹" }, // Assumes yearHighLow includes ₹
    {
      label: "Dividend Yield",
      value: stockData.dividendYieldFormatted,
      unit: "%",
    }, // Assumes dividendYieldFormatted is just the number
    { label: "ROCE", value: stockData.roceFormatted, unit: "%" }, // Assumes roceFormatted is just the number
    { label: "ROE", value: stockData.roeFormatted, unit: "%" }, // Assumes roeFormatted is just the number
    { label: "RSI (14)", value: stockData.rsiValue, unit: "" },
    { label: "Face Value", value: stockData.faceValue, unit: "₹" },
  ];

  return (
    <section className="key-metrics-grid">
      {metrics.map((metric) => (
        <MetricItem
          key={metric.label}
          label={metric.label}
          value={metric.value}
          unit={metric.unit}
        />
      ))}
    </section>
  );
};

export default KeyMetricsGrid;
