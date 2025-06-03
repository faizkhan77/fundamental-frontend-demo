// src/App.jsx
import React, { useState, useEffect, useMemo } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import StockTable from "./components/StockTable";
import StockDetail from "./components/StockDetail";
import { ALL_INDICATOR_NAMES } from "./constants";
import { calculateFrontendOverallSignal } from "./utils/calculateOverallSignal";

import { ThemeProvider } from "./context/ThemeContext"; // 1. IMPORT ThemeProvider
import "./theme.css"; // Ensure theme.css is imported (you already have this)

const API_BASE_URL = "http://127.0.0.1:8000/api";

function App() {
  const [selectedStockData, setSelectedStockData] = useState(null);
  const [rawStocksSummary, setRawStocksSummary] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentViewStockId, setCurrentViewStockId] = useState(null);

  const initialSelectedIndicators = ALL_INDICATOR_NAMES.reduce(
    (acc, indicator) => {
      acc[indicator] = true;
      return acc;
    },
    {}
  );
  const [selectedIndicators, setSelectedIndicators] = useState(
    initialSelectedIndicators
  );

  useEffect(() => {
    const fetchStocksSummary = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/stocks`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setRawStocksSummary(data || []);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch stocks summary:", e);
        setRawStocksSummary([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStocksSummary();
  }, []);

  const allStocksSummaryWithFrontendSignal = useMemo(() => {
    if (!rawStocksSummary) return [];
    return rawStocksSummary.map((stock) => ({
      ...stock,
      frontendOverallSignal: calculateFrontendOverallSignal(
        stock.signals,
        selectedIndicators
      ),
    }));
  }, [rawStocksSummary, selectedIndicators]);

  useEffect(() => {
    if (!currentViewStockId) {
      setSelectedStockData(null);
      return;
    }
    const fetchStockDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_BASE_URL}/stock/${currentViewStockId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data || Object.keys(data).length === 0) {
          console.warn(`No data returned for stock ID: ${currentViewStockId}`);
          setSelectedStockData(null);
        } else {
          setSelectedStockData(data);
        }
      } catch (e) {
        setError(e.message);
        console.error(`Failed to fetch details for ${currentViewStockId}:`, e);
        setSelectedStockData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStockDetails();
  }, [currentViewStockId]);

  const handleStockSelect = (stockSummary) => {
    setCurrentViewStockId(stockSummary.id);
  };

  const handleGoBack = () => {
    setCurrentViewStockId(null);
    setError(null);
  };

  const handleIndicatorToggle = (indicatorName) => {
    setSelectedIndicators((prev) => ({
      ...prev,
      [indicatorName]: !prev[indicatorName],
    }));
  };

  // Error handling for list view - keep this as is, but it will now be within ThemeProvider
  const renderErrorListView = () => (
    <div
      className="container error-message"
      style={{ textAlign: "center", marginTop: "50px" }}
    >
      <p>Error: {error}</p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: "10px 20px",
          backgroundColor: "var(--button-bg-color)", // Use theme variable
          color: "var(--button-text-color)", // Use theme variable
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Try Again
      </button>
    </div>
  );

  // Main render
  return (
    <ThemeProvider>
      {" "}
      {/* 2. WRAP with ThemeProvider */}
      <Navbar />
      {/* 3. RENDER Navbar here, it will have the theme toggle */}
      {/* Your existing .container can be renamed or styled as .app-container from example if preferred */}
      {/* For now, I'll keep your .container class and apply general padding similar to your example's .app-container */}
      <div
        className="container" // You can rename this to app-container if you prefer and adjust App.css
        style={{
          paddingTop: "20px",
          paddingBottom: "20px",
          maxWidth: "1320px" /* Or your preferred max-width */,
          margin: "0 auto",
          paddingLeft: "15px",
          paddingRight: "15px",
        }}
      >
        {error && !currentViewStockId ? ( // Show main list error if present
          renderErrorListView()
        ) : currentViewStockId ? ( // Stock Detail View
          isLoading && !selectedStockData ? (
            <p className="loading-message">
              Loading {currentViewStockId} details...
            </p>
          ) : selectedStockData ? (
            <StockDetail
              stock={selectedStockData}
              onGoBack={handleGoBack}
              API_BASE_URL={API_BASE_URL}
            />
          ) : error ? ( // Error specific to detail view
            <div
              className="error-message"
              style={{ textAlign: "center", marginTop: "50px" }}
            >
              <p>Error loading details: {error}</p>
              <button
                onClick={handleGoBack}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "var(--button-bg-color)",
                  color: "var(--button-text-color)",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              >
                Go Back to List
              </button>
            </div>
          ) : (
            !isLoading && (
              <div style={{ textAlign: "center", marginTop: "50px" }}>
                <p>Could not load stock details for {currentViewStockId}.</p>
                <button
                  onClick={handleGoBack}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "var(--button-bg-color)",
                    color: "var(--button-text-color)",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Go Back
                </button>
              </div>
            )
          )
        ) : (
          // Stock Table View
          <>
            {isLoading && rawStocksSummary.length === 0 && (
              <p className="loading-message">Loading stock list...</p>
            )}
            {(!isLoading || rawStocksSummary.length > 0) && (
              <StockTable
                stocks={allStocksSummaryWithFrontendSignal}
                onStockSelect={handleStockSelect}
                selectedIndicators={selectedIndicators}
                onIndicatorToggle={handleIndicatorToggle}
              />
            )}
            {!isLoading && !error && rawStocksSummary.length === 0 && (
              <p style={{ textAlign: "center", marginTop: "20px" }}>
                No stocks found.
              </p>
            )}
          </>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
