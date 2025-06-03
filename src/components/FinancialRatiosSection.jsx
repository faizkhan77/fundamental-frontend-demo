// src/components/FinancialRatiosSection.jsx
import React, { useRef, useCallback } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import * as htmlToImage from "html-to-image";
import GeminiSummarizeButton from "./GeminiSummarizeButton";
import { generateSectionSummary } from "../services/geminiService";

const CustomTooltip = ({ active, payload, label }) => {
  // ... (your CustomTooltip implementation)
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-lg text-xs">
        <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">
          {label}
        </p>
        {payload.map((pld, index) => (
          <p
            key={index}
            style={{ color: pld.stroke || pld.fill }}
            className="my-0.5"
          >
            {`${pld.name}: ${
              typeof pld.value === "number"
                ? pld.value.toLocaleString(undefined, {
                    minimumFractionDigits:
                      pld.name && pld.name.includes("%") ? 1 : 0,
                    maximumFractionDigits:
                      pld.name && pld.name.includes("%") ? 1 : 0,
                  })
                : pld.value
            }${
              pld.name &&
              pld.name.includes("%") &&
              typeof pld.value === "number"
                ? "%"
                : ""
            }`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Using RATIO_COLORS_VARS for consistency with other sections
const RATIO_COLORS_VARS = [
  "var(--chart-ratio-color1, #3498db)",
  "var(--chart-ratio-color2, #e74c3c)",
  "var(--chart-ratio-color3, #2ecc71)",
  "var(--chart-ratio-color4, #f1c40f)",
  "var(--chart-ratio-color5, #9b59b6)",
];
// Keep RATIO_COLORS if directly used in JSX and not through vars, but prefer vars.
const RATIO_COLORS = ["#3498db", "#e74c3c", "#2ecc71", "#f1c40f", "#9b59b6"];

const FinancialRatiosSection = ({
  ratiosTableData,
  efficiencyDaysChartData,
  roceTrendChartData,
  stockName,
}) => {
  const efficiencyChartRef = useRef(null);
  const roceChartRef = useRef(null);

  const handleRatiosSummarizeRequest = useCallback(async () => {
    console.log("[FinancialRatios] Summarize request started.");
    const images = [];
    const imageMimeType = "image/png";

    let captureBgColor = "white";
    if (typeof window !== "undefined") {
      try {
        const style = window.getComputedStyle(document.documentElement);
        captureBgColor =
          style.getPropertyValue("--card-bg-color-capture").trim() ||
          style.getPropertyValue("--card-bg-color").trim() ||
          "white";
        if (captureBgColor.startsWith("var")) {
          captureBgColor = document.documentElement.classList.contains("dark")
            ? "#1e293b"
            : "white";
        }
      } catch (e) {
        console.warn("Could not compute bg color for capture", e);
      }
    }
    console.log("[FinancialRatios] Capture BG Color:", captureBgColor);

    console.log(
      "[FinancialRatios] Efficiency Chart Ref Current:",
      efficiencyChartRef.current
    );
    console.log(
      "[FinancialRatios] Efficiency Days Chart Data Length:",
      efficiencyDaysChartData?.length
    );
    if (efficiencyChartRef.current && efficiencyDaysChartData?.length > 0) {
      try {
        console.log("[FinancialRatios] Capturing Efficiency Days chart...");
        const dataUrl = await htmlToImage.toPng(efficiencyChartRef.current, {
          quality: 0.85,
          backgroundColor: captureBgColor,
        });
        images.push({
          data: dataUrl.split(",")[1],
          mimeType: imageMimeType,
          description: "Efficiency Days Trend Chart",
        });
        console.log("[FinancialRatios] Efficiency Days chart captured.");
      } catch (error) {
        console.error(
          "[FinancialRatios] Error capturing efficiency days chart:",
          error
        );
      }
    } else {
      console.log("[FinancialRatios] Skipping Efficiency Days chart capture.");
    }

    console.log(
      "[FinancialRatios] ROCE Chart Ref Current:",
      roceChartRef.current
    );
    console.log(
      "[FinancialRatios] ROCE Trend Chart Data Length:",
      roceTrendChartData?.length
    );
    if (roceChartRef.current && roceTrendChartData?.length > 0) {
      try {
        console.log("[FinancialRatios] Capturing ROCE Trend chart...");
        const dataUrl = await htmlToImage.toPng(roceChartRef.current, {
          quality: 0.85,
          backgroundColor: captureBgColor,
        });
        images.push({
          data: dataUrl.split(",")[1],
          mimeType: imageMimeType,
          description: "ROCE % Trend Chart",
        });
        console.log("[FinancialRatios] ROCE Trend chart captured.");
      } catch (error) {
        console.error(
          "[FinancialRatios] Error capturing ROCE trend chart:",
          error
        );
      }
    } else {
      console.log("[FinancialRatios] Skipping ROCE Trend chart capture.");
    }

    const latestYearRatios =
      ratiosTableData && ratiosTableData.length > 0
        ? ratiosTableData[ratiosTableData.length - 1]
        : {};

    const summarizedTableData = {
      /* ... as before ... */
    };
    const dataForSummary = {
      /* ... as before ... */
    };

    console.log(
      "[FinancialRatios] Final images array before sending:",
      images.map((img) => ({ desc: img.description, size: img.data?.length }))
    );

    try {
      const summary = await generateSectionSummary(
        "Financial Ratios",
        dataForSummary,
        stockName,
        images.length > 0 ? images : null
      );
      return summary;
    } catch (error) {
      console.error(
        "[FinancialRatios] Failed to get summary from Gemini service:",
        error
      );
      throw error;
    }
  }, [ratiosTableData, efficiencyDaysChartData, roceTrendChartData, stockName]);

  // ... (rest of the component: noTableData checks, JSX for rendering)
  const noTable = !ratiosTableData || ratiosTableData.length === 0;
  const noEffChart =
    !efficiencyDaysChartData || efficiencyDaysChartData.length === 0;
  const noRoceChart = !roceTrendChartData || roceTrendChartData.length === 0;

  if (noTable && noEffChart && noRoceChart) {
    // ... No data message ...
    return (
      <section className="section-card bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="m-0 text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 leading-tight">
            Ratios
          </h2>
        </div>
        <p className="text-slate-500 dark:text-slate-400">
          No financial ratio data available.
        </p>
      </section>
    );
  }

  const chartHeight = 300;
  const tableYears = noTable ? [] : ratiosTableData.map((item) => item.year);
  const tableRowItems = [
    { key: "debtorDays", label: "Debtor Days" },
    { key: "inventoryDays", label: "Inventory Days" },
    { key: "daysPayable", label: "Days Payable" },
    {
      key: "cashConversionCycle",
      label: "Cash Conversion Cycle",
      isTotal: true,
    },
    { key: "workingCapitalDays", label: "Working Capital Days" },
    { key: "roce", label: "ROCE %", isTotal: true },
  ];

  // Applying Tailwind styling as per previous examples
  return (
    <section className="section-card bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="m-0 text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 leading-tight">
          Ratios
        </h2>
        {(!noTable || !noEffChart || !noRoceChart) && (
          <GeminiSummarizeButton
            sectionTitle="Financial Ratios"
            onSummarizeRequest={handleRatiosSummarizeRequest}
          />
        )}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 -mt-3 mb-5">
        Consolidated Figures
      </p>

      {(!noEffChart || !noRoceChart) && (
        // Use grid for charts layout
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {!noEffChart && (
            <div
              ref={efficiencyChartRef}
              className="chart-box p-4 rounded-lg bg-[var(--card-bg-color)] dark:bg-[var(--dark-card-bg-color,#1e293b)] border border-slate-200 dark:border-slate-700"
            >
              <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                Efficiency Days Trend
              </h4>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <LineChart
                  data={efficiencyDaysChartData}
                  margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--chart-grid-color, #e0e0e0)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 9,
                      fill: "var(--chart-tick-color, #555)",
                    }}
                    stroke="var(--chart-axis-line-color, #ccc)"
                  />
                  <YAxis
                    tick={{
                      fontSize: 9,
                      fill: "var(--chart-tick-color, #555)",
                    }}
                    stroke="var(--chart-axis-line-color, #ccc)"
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    wrapperStyle={{ zIndex: 50 }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: "10px",
                      color: "var(--chart-legend-text-color, #333)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Debtor Days"
                    stroke={RATIO_COLORS_VARS[0]}
                    activeDot={{ r: 5 }}
                    name="Debtor Days"
                    strokeWidth={1.5}
                    connectNulls={true}
                  />
                  <Line
                    type="monotone"
                    dataKey="Inventory Days"
                    stroke={RATIO_COLORS_VARS[1]}
                    activeDot={{ r: 5 }}
                    name="Inv. Days"
                    strokeWidth={1.5}
                    connectNulls={true}
                  />
                  <Line
                    type="monotone"
                    dataKey="Payable Days"
                    stroke={RATIO_COLORS_VARS[2]}
                    activeDot={{ r: 5 }}
                    name="Payable Days"
                    strokeWidth={1.5}
                    connectNulls={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {!noRoceChart && (
            <div
              ref={roceChartRef}
              className="chart-box p-4 rounded-lg bg-[var(--card-bg-color)] dark:bg-[var(--dark-card-bg-color,#1e293b)] border border-slate-200 dark:border-slate-700"
            >
              <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                ROCE % Trend
              </h4>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart
                  data={roceTrendChartData}
                  margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--chart-grid-color, #e0e0e0)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 9,
                      fill: "var(--chart-tick-color, #555)",
                    }}
                    stroke="var(--chart-axis-line-color, #ccc)"
                  />
                  <YAxis
                    tickFormatter={(value) => `${value}%`}
                    tick={{
                      fontSize: 9,
                      fill: "var(--chart-tick-color, #555)",
                    }}
                    stroke="var(--chart-axis-line-color, #ccc)"
                    domain={[0, "dataMax + 5"]}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    wrapperStyle={{ zIndex: 50 }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: "10px",
                      color: "var(--chart-legend-text-color, #333)",
                    }}
                  />
                  <Bar
                    dataKey="ROCE %"
                    fill={RATIO_COLORS_VARS[3]}
                    name="ROCE %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {!noTable && (
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-xs text-left text-slate-500 dark:text-slate-400 data-table-compact">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-2 sticky left-0 bg-slate-50 dark:bg-slate-700 z-10"
                >
                  Ratio
                </th>
                {tableYears.map((year) => (
                  <th scope="col" key={year} className="px-3 py-2 text-right">
                    {year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRowItems.map((rowItem) => (
                <tr
                  key={rowItem.key}
                  className={`bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 ${
                    rowItem.isTotal
                      ? "font-semibold text-slate-700 dark:text-slate-200"
                      : ""
                  }`}
                >
                  <td className="px-3 py-2 sticky left-0 bg-white dark:bg-slate-800 z-10 whitespace-nowrap">
                    {rowItem.label}
                  </td>
                  {ratiosTableData.map((yearlyData) => (
                    <td
                      key={yearlyData.year + "-" + rowItem.key}
                      className="px-3 py-2 text-right"
                    >
                      {yearlyData[rowItem.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default FinancialRatiosSection;
