// src/components/StockPageHeader.jsx
import React from "react";

const StockPageHeader = ({
  name,
  sector,
  industry,
  nseCode,
  bseCode,
  currentPrice,
  priceChange,
}) => {
  return (
    <header className="stock-page-header">
      <div className="stock-name-sector">
        <h1>{name || "N/A"}</h1>
        <div className="codes">
          Sector: {sector || "N/A"} | Industry: {industry || "N/A"} <br />
          {nseCode && (
            <a
              href={`https://www.screener.in/company/${nseCode}/consolidated/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              NSE: {nseCode}
            </a>
          )}
          {nseCode && bseCode && " | "} {/* Add separator only if both exist */}
          {bseCode && `BSE: ${bseCode}`}
        </div>
      </div>
      <div className="stock-price-info">
        <div className="current-price-value">
          ₹
          {typeof currentPrice === "number"
            ? currentPrice.toFixed(2)
            : currentPrice || "N/A"}
        </div>
        {priceChange && priceChange.absolute !== "N/A" && (
          <div
            className={`price-change-value ${
              priceChange.isPositive ? "positive" : "negative"
            }`}
          >
            {priceChange.isPositive ? "▲" : "▼"} {priceChange.absolute} (
            {priceChange.percent}%)
          </div>
        )}
      </div>
    </header>
  );
};

export default StockPageHeader;
