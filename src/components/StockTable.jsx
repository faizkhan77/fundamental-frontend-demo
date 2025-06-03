// src/components/StockTable.jsx
import React from "react";
import { ALL_INDICATOR_NAMES, INDICATOR_DISPLAY_NAMES } from "../constants"; // Adjust path
import "./StockTable.css"; // For styling the table and checkboxes

const getSignalClass = (signal) => {
  if (!signal) return "";
  if (signal.includes("Strong Buy")) return "signal-strong-buy";
  if (signal.includes("Buy")) return "signal-buy";
  if (signal.includes("Strong Sell")) return "signal-strong-sell";
  if (signal.includes("Sell")) return "signal-sell";
  return "signal-neutral";
};

const StockTable = ({
  stocks,
  onStockSelect,
  selectedIndicators,
  onIndicatorToggle,
}) => {
  const visibleIndicatorKeys = ALL_INDICATOR_NAMES.filter(
    (name) => selectedIndicators[name]
  );

  return (
    <div>
      <div className="indicator-selectors">
        <h3>Select Indicators</h3>
        <div className="checkbox-group">
          {ALL_INDICATOR_NAMES.map((name) => (
            <label key={name} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedIndicators[name]}
                onChange={() => onIndicatorToggle(name)}
              />
              {INDICATOR_DISPLAY_NAMES[name] || name}
            </label>
          ))}
        </div>
      </div>
      <h2>Qualifying Stocks</h2>
      <p className="subtitle">Showing results for selected indicators</p>{" "}
      {/* and time period - if you add time period later */}
      {!stocks || stocks.length === 0 ? (
        <p>No stock data available or matches current filter.</p>
      ) : (
        <div className="table-container">
          {" "}
          {/* Added for scrolling if table is too wide */}
          <table className="stock-table">
            <thead>
              <tr>
                <th>Sr.</th>
                <th>Name</th>
                <th>CMP (₹)</th>
                {/* Market Cap can be later or after symbol */}
                {/* <th>Symbol</th> */}
                <th>Market Cap</th>
                {visibleIndicatorKeys.map((name) => (
                  <th key={name}>{INDICATOR_DISPLAY_NAMES[name] || name}</th>
                ))}
                <th>Overall Decision</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock, index) => {
                // Helper to find a specific signal from the stock.signals array
                const getIndicatorDecision = (indicatorName) => {
                  if (!stock.signals) return "N/A";
                  const signalObj = stock.signals.find(
                    (s) => s.name === indicatorName
                  );
                  return signalObj ? signalObj.decision : "N/A";
                };

                return (
                  <tr key={stock.id} onClick={() => onStockSelect(stock)}>
                    <td>{index + 1}</td>
                    <td>{stock.name}</td>
                    <td>
                      {typeof stock.currentPrice === "number"
                        ? stock.currentPrice.toFixed(2)
                        : stock.currentPrice}
                    </td>
                    {/* <td>{stock.symbol}</td> */}
                    <td>{stock.marketCapFormatted}</td>
                    {visibleIndicatorKeys.map((name) => (
                      <td
                        key={name}
                        className={getSignalClass(getIndicatorDecision(name))}
                      >
                        {getIndicatorDecision(name)}
                      </td>
                    ))}
                    <td className={getSignalClass(stock.frontendOverallSignal)}>
                      {stock.frontendOverallSignal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StockTable;
