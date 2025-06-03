// src/components/StockDetail.js
import React, { useState, useEffect, useCallback } from "react";
import ProfitAndLossSection from "./ProfitAndLossSection";
import BalanceSheetSection from "./BalanceSheetSection";
import CashFlowSection from "./CashFlowSection";
import FinancialRatiosSection from "./FinancialRatiosSection";
import StockPageHeader from "./StockPageHeader"; // IMPORT
import KeyMetricsGrid from "./KeyMetricsGrid"; // IMPORT
import EnhancedPriceChart from "./EnhancedPriceChart";
import ProsConsSection from "./ProsConsSection";
import QuarterlyResultsSection from "./QuarterlyResultsSection";
import ShareholdingPatternSection from "./ShareholdingPatternSection";
import PeerComparisonSection from "./PeerComparisonSection";
import StickySubNav from "./StickySubNav";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  Bar,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  BarChart,
  Pie,
  Cell,
  Sector,
} from "recharts";

// CustomTooltip and COLORS consts (as you provided them earlier)
// This CustomTooltip's styling will be handled by the .custom-tooltip class in theme.css
const CustomTooltip = ({ active, payload, chartType }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0];
    if (chartType === "pie") {
      const name = dataPoint.name;
      const value = dataPoint.value;
      return (
        <div className="custom-tooltip">
          {" "}
          {/* This class is styled by theme.css */}
          <p
            className="label" // Use className for sub-styling if needed, or rely on direct P styling
            style={{
              color: dataPoint.payload.fill || dataPoint.color, // Series color
              margin: 0,
              fontWeight: "bold",
            }}
          >
            {`${name}: ${value != null ? value.toFixed(2) : "N/A"}%`}
          </p>
        </div>
      );
    } else if (chartType === "line") {
      const label = dataPoint.payload.date;
      return (
        <div className="custom-tooltip">
          {" "}
          {/* This class is styled by theme.css */}
          <p
            className="label" // This class is styled by theme.css
          >{`${label}`}</p>
          {payload.map((pld, index) => (
            <p key={index} style={{ color: pld.stroke, margin: 0 }}>
              {" "}
              {/* Series color */}
              {`${pld.name}: ${
                typeof pld.value === "number" ? pld.value.toFixed(2) : pld.value
              }%`}
            </p>
          ))}
        </div>
      );
    }
    const label = payload[0].payload.date || payload[0].payload.name;
    return (
      <div className="custom-tooltip">
        {" "}
        {/* This class is styled by theme.css */}
        <p
          className="label" // This class is styled by theme.css
        >{`${label}`}</p>
        {payload.map((pld, index) => (
          <p
            key={index}
            style={{ color: pld.color || pld.stroke || pld.fill, margin: 0 }} // Series color
          >
            {`${pld.name}: ${
              typeof pld.value === "number"
                ? pld.value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : pld.value
            }`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// PriceChartTooltip uses "custom-tooltip" class, so it will also be themed by theme.css
const PriceChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip price-chart-tooltip">
        <p
          className="label" // Styled by theme.css via .custom-tooltip .label
        >
          {label}
        </p>
        {payload.map((pld) => {
          if (pld.value === null || typeof pld.value === "undefined") {
            return null;
          }
          let formattedValue = pld.value;
          if (typeof pld.value === "number") {
            if (pld.dataKey === "volume") {
              formattedValue = pld.value.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              });
            } else {
              formattedValue = pld.value.toFixed(2);
            }
          }
          return (
            <p
              key={pld.dataKey}
              style={{ color: pld.stroke || pld.fill, margin: "3px 0" }} // Series color
            >
              {`${pld.name}: ${formattedValue}`}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  // Consider defining theme-based series colors in theme.css if needed, e.g.,
  // getComputedStyle(document.documentElement).getPropertyValue('--chart-series-1').trim()
];

// Active shape for Pie chart
const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  // ... (rest of renderActiveShape remains the same)
  // The `fill` prop comes from COLORS array.
  // `stroke="#fff"` for the Sector provides separation. This generally looks ok on dark backgrounds too.
  // If text elements were used here, their 'fill' would need to use theme variables.
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 3}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill} // from COLORS
        stroke="#fff" // Or use a theme variable if #fff is problematic in some themes
        strokeWidth={2}
      />
    </g>
  );
};

// Main Component
const StockDetail = ({ stock, onGoBack, API_BASE_URL }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const onPieEnter = useCallback(
    (_, index) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );

  const onPieLeave = useCallback(() => {
    setActiveIndex(null);
  }, [setActiveIndex]);

  if (!stock || !stock.id) {
    return <p className="loading-message">Loading main stock data...</p>; // Added class for theming
  }

  const stockName = stock.name;

  // ... (state for EnhancedPriceChart remains the same)

  const growthMetrics = {
    compoundedSalesGrowth: stock.compoundedSalesGrowth,
    compoundedProfitGrowth: stock.compoundedProfitGrowth,
    stockPriceCagr: stock.stockPriceCagr,
    returnOnEquityTrend: stock.returnOnEquityTrend,
  };

  const sections = [
    { id: "key-metrics-section", label: "Key Metrics" },
    { id: "price-chart-section", label: "Price Chart" },
    { id: "peer-comparison-section", label: "Peers" },
    { id: "quarterly-results-section", label: "Quarterly" },
    { id: "profit-loss-section", label: "Profit & Loss" },
    { id: "balance-sheet-section", label: "Balance Sheet" },
    { id: "cash-flow-section", label: "Cash Flow" },
    { id: "ratios-section", label: "Ratios" },
    { id: "shareholding-section", label: "Shareholding" },
  ];

  const handleSubNavClick = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -120;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // For Recharts grid, axes, ticks, and legend text, we rely on global CSS overrides
  // in theme.css (e.g., styling .recharts-cartesian-grid-line, .recharts-text.recharts-cartesian-axis-tick-value, .recharts-legend-item-text)
  // This means we can remove hardcoded stroke/fill props from these components here.

  return (
    <div className="stock-detail">
      <button
        onClick={onGoBack}
        className="back-button" // Styled by App.css (now using variables) and/or theme.css
        style={{
          position: "sticky",
          top: "10px",
          zIndex: 1001,
          marginBottom: "-40px",
        }}
      >
        ← Back to List
      </button>
      <StockPageHeader
        name={stock.name}
        sector={stock.sector}
        industry={stock.industry}
        nseCode={stock.nseCode}
        bseCode={stock.bseCode}
        currentPrice={stock.currentPrice}
        priceChange={stock.priceChange}
      />
      <StickySubNav
        stockName={stock.name}
        sections={sections}
        onNavClick={handleSubNavClick}
      />
      <section id="key-metrics-section" className="content-section">
        <KeyMetricsGrid stockData={stock} />
      </section>
      <section id="price-chart-section" className="content-section">
        <EnhancedPriceChart
          stockId={stock.id}
          API_BASE_URL={API_BASE_URL}
          stockName={stockName} // PASS stockName HERE
        />
      </section>
      <section id="peer-comparison-section" className="content-section">
        <PeerComparisonSection
          peerComparisonData={stock.peerComparison}
          peerCmpChartData={stock.peerCmpChart}
          peerPeChartData={stock.peerPeChart}
          stockName={stockName} // PASS stockName HERE
        />
      </section>
      <section id="quarterly-results-section" className="content-section">
        <QuarterlyResultsSection
          quarterlyTableData={stock.quarterlyResults}
          financialsChartData={stock.quarterlyFinancialsChartData}
          epsChartData={stock.quarterlyEPSChartData}
        />
      </section>
      <section id="profit-loss-section" className="content-section">
        <ProfitAndLossSection
          profitAndLossTableData={stock.profitAndLoss}
          annualFinancialsChartData={stock.annualFinancialsChartData}
          growthData={growthMetrics} // Pass the defined growthMetrics
          stockName={stockName} // PASS stockName HERE
        />
      </section>
      <section id="balance-sheet-section" className="content-section">
        <BalanceSheetSection
          balanceSheetData={stock.balanceSheet}
          liabilitiesChartData={stock.balanceSheetLiabilitiesChartData}
          assetsChartData={stock.balanceSheetAssetsChartData}
          stockName={stockName} // PASS stockName HERE
        />
      </section>
      <section id="cash-flow-section" className="content-section">
        <CashFlowSection
          cashFlowTableData={stock.cashFlows}
          cashFlowsChartData={stock.cashFlowsChartData}
          stockName={stockName} // PASS stockName HERE
        />
      </section>
      <section id="ratios-section" className="content-section">
        <FinancialRatiosSection
          ratiosTableData={stock.ratiosTableData}
          efficiencyDaysChartData={stock.efficiencyDaysChartData}
          roceTrendChartData={stock.roceTrend}
          stockName={stockName} // PASS stockName HERE
        />
      </section>

      {stock.shareholdingHistory && stock.shareholdingHistory.length > 0 && (
        <ShareholdingPatternSection
          shareholdingHistory={stock.shareholdingHistory}
          shareholdingPieData={stock.shareholdingPieData}
          shareholdingTrendData={stock.shareholdingTrendData}
          stockName={stockName}
        />
      )}
    </div>
  );
};

export default StockDetail;
