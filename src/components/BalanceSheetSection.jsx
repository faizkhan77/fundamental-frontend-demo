// src/components/BalanceSheetSection.jsx
import React, { useRef, useCallback } from "react";
import {
  ResponsiveContainer,
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

// ... CustomTooltip ...
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-lg text-xs">
        <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">
          {label}
        </p>
        {payload.map((pld, index) => (
          <p key={index} style={{ color: pld.fill }} className="my-0.5">
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

const BS_COLORS_VARS = {
  "Equity Capital": "var(--chart-bs-equity, #2c7bb6)",
  Reserves: "var(--chart-bs-reserves, #abd9e9)",
  Borrowings: "var(--chart-bs-borrowings, #fdae61)",
  "Other Liabilities": "var(--chart-bs-otherliab, #d7191c)",
  "Fixed Assets": "var(--chart-bs-fixedassets, #1a9641)",
  CWIP: "var(--chart-bs-cwip, #a6d96a)",
  Investments: "var(--chart-bs-investments, #fee08b)",
  "Other Assets": "var(--chart-bs-otherassets, #b2abd2)",
};

const BalanceSheetSection = ({
  balanceSheetData,
  liabilitiesChartData,
  assetsChartData,
  stockName,
}) => {
  const liabilitiesChartRef = useRef(null);
  const assetsChartRef = useRef(null);

  const handleBalanceSheetSummarizeRequest = useCallback(async () => {
    const images = [];
    const imageMimeType = "image/png";
    console.log("Attempting to capture Balance Sheet charts...");

    // Get computed background color for capture to ensure consistency
    let captureBgColor = "white"; // Default
    if (typeof window !== "undefined") {
      try {
        const style = window.getComputedStyle(document.documentElement);
        // Assumes you have --card-bg-color-capture defined in your CSS
        // or use a fallback like --card-bg-color
        captureBgColor =
          style.getPropertyValue("--card-bg-color-capture").trim() ||
          style.getPropertyValue("--card-bg-color").trim() ||
          "white";
        if (captureBgColor.startsWith("var")) {
          // If it's still a var, default
          captureBgColor = document.documentElement.classList.contains("dark")
            ? "#1e293b"
            : "white";
        }
      } catch (e) {
        console.warn(
          "Could not compute background color for chart capture, defaulting to white.",
          e
        );
      }
    }
    console.log("Using background color for capture:", captureBgColor);

    if (liabilitiesChartRef.current && liabilitiesChartData?.length > 0) {
      try {
        console.log("Capturing Liabilities chart...");
        const dataUrl = await htmlToImage.toPng(liabilitiesChartRef.current, {
          quality: 0.85,
          backgroundColor: captureBgColor, // Use computed or default background
          // pixelRatio: 1, // Try setting pixelRatio to 1 if images are too large or blurry
        });
        images.push({
          data: dataUrl.split(",")[1],
          mimeType: imageMimeType,
          description: "Liabilities Composition Chart",
        });
        console.log("Liabilities chart captured successfully.");
        // For debugging: You can display the image:
        // const img = new Image(); img.src = dataUrl; document.body.appendChild(img);
      } catch (error) {
        console.error("Error capturing liabilities chart:", error);
      }
    } else {
      console.log("Skipping Liabilities chart capture (no ref or data).");
    }

    if (assetsChartRef.current && assetsChartData?.length > 0) {
      try {
        console.log("Capturing Assets chart...");
        const dataUrl = await htmlToImage.toPng(assetsChartRef.current, {
          quality: 0.85,
          backgroundColor: captureBgColor,
          // pixelRatio: 1,
        });
        images.push({
          data: dataUrl.split(",")[1],
          mimeType: imageMimeType,
          description: "Assets Composition Chart",
        });
        console.log("Assets chart captured successfully.");
      } catch (error) {
        console.error("Error capturing assets chart:", error);
      }
    } else {
      console.log("Skipping Assets chart capture (no ref or data).");
    }

    const latestYearData =
      balanceSheetData && balanceSheetData.length > 0
        ? balanceSheetData[balanceSheetData.length - 1]
        : {};
    const summarizedTableData = {
      latestYear: latestYearData.year,
      totalLiabilities: latestYearData.totalLiabilities,
      totalAssets: latestYearData.totalAssets,
      shareholdersEquity:
        parseFloat(latestYearData.equityCapital) +
        parseFloat(latestYearData.reserves),
      totalDebt: latestYearData.borrowings,
    };

    const dataForSummary = {
      tableSummary: summarizedTableData,
      chartsAvailable: {
        liabilities: !!liabilitiesChartData?.length,
        assets: !!assetsChartData?.length,
      },
    };

    console.log("Data for summary (textual):", dataForSummary);
    console.log(
      `Number of images to send: ${images.length}`,
      images.map((img) => ({ desc: img.description, size: img.data?.length }))
    );

    try {
      const summary = await generateSectionSummary(
        "Balance Sheet",
        dataForSummary,
        stockName,
        images.length > 0 ? images : null
      );
      return summary;
    } catch (error) {
      console.error("Failed to get Balance Sheet summary:", error);
      throw error;
    }
  }, [balanceSheetData, liabilitiesChartData, assetsChartData, stockName]);

  // ... (rest of the component: noTableData checks, JSX for rendering)
  const noTableData = !balanceSheetData || balanceSheetData.length === 0;
  const noLiabilitiesChart =
    !liabilitiesChartData || liabilitiesChartData.length === 0;
  const noAssetsChart = !assetsChartData || assetsChartData.length === 0;

  if (noTableData && noLiabilitiesChart && noAssetsChart) {
    return (
      <section className="section-card bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="m-0 text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 leading-tight">
            Balance Sheet
          </h2>
        </div>
        <p className="text-slate-500 dark:text-slate-400">
          No Balance Sheet data available.
        </p>
      </section>
    );
  }

  const chartHeight = 300;
  const tableHeaders = [
    { key: "equityCapital", label: "Equity Capital" },
    { key: "reserves", label: "Reserves" },
    { key: "borrowings", label: "Borrowings" },
    { key: "otherLiabilities", label: "Other Liabilities" },
    { key: "totalLiabilities", label: "Total Liabilities", isTotal: true },
    { key: "fixedAssets", label: "Fixed Assets" },
    { key: "cwip", label: "CWIP" },
    { key: "investments", label: "Investments" },
    { key: "otherAssets", label: "Other Assets" },
    { key: "totalAssets", label: "Total Assets", isTotal: true },
  ];

  return (
    <section className="section-card bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="m-0 text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 leading-tight">
          Balance Sheet
        </h2>
        {(!noTableData || !noLiabilitiesChart || !noAssetsChart) && (
          <GeminiSummarizeButton
            sectionTitle="Balance Sheet"
            onSummarizeRequest={handleBalanceSheetSummarizeRequest}
          />
        )}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 -mt-3 mb-5">
        Consolidated Figures in Rs. Crores
      </p>

      {(!noLiabilitiesChart || !noAssetsChart) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {!noLiabilitiesChart && (
            <div
              ref={liabilitiesChartRef}
              // IMPORTANT: Ensure this div has a defined background color for htmlToImage
              className="chart-box p-4 rounded-lg bg-[var(--card-bg-color)] dark:bg-[var(--dark-card-bg-color,#1e293b)] border border-slate-200 dark:border-slate-700"
            >
              <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                Liabilities Composition (Cr.)
              </h4>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart
                  data={liabilitiesChartData}
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
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    wrapperStyle={{ zIndex: 50 }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: "10px",
                      wordBreak: "break-word",
                      color: "var(--chart-legend-text-color, #333)",
                    }}
                  />
                  <Bar
                    dataKey="Equity Capital"
                    stackId="liabilities"
                    fill={BS_COLORS_VARS["Equity Capital"]}
                    name="Equity Cap."
                  />
                  <Bar
                    dataKey="Reserves"
                    stackId="liabilities"
                    fill={BS_COLORS_VARS["Reserves"]}
                    name="Reserves"
                  />
                  <Bar
                    dataKey="Borrowings"
                    stackId="liabilities"
                    fill={BS_COLORS_VARS["Borrowings"]}
                    name="Borrowings"
                  />
                  <Bar
                    dataKey="Other Liabilities"
                    stackId="liabilities"
                    fill={BS_COLORS_VARS["Other Liabilities"]}
                    name="Other Liab."
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {!noAssetsChart && (
            <div
              ref={assetsChartRef}
              // IMPORTANT: Ensure this div has a defined background color
              className="chart-box p-4 rounded-lg bg-[var(--card-bg-color)] dark:bg-[var(--dark-card-bg-color,#1e293b)] border border-slate-200 dark:border-slate-700"
            >
              <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                Assets Composition (Cr.)
              </h4>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart
                  data={assetsChartData}
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
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    wrapperStyle={{ zIndex: 50 }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: "10px",
                      wordBreak: "break-word",
                      color: "var(--chart-legend-text-color, #333)",
                    }}
                  />
                  <Bar
                    dataKey="Fixed Assets"
                    stackId="assets"
                    fill={BS_COLORS_VARS["Fixed Assets"]}
                    name="Fixed Assets"
                  />
                  <Bar
                    dataKey="CWIP"
                    stackId="assets"
                    fill={BS_COLORS_VARS["CWIP"]}
                    name="CWIP"
                  />
                  <Bar
                    dataKey="Investments"
                    stackId="assets"
                    fill={BS_COLORS_VARS["Investments"]}
                    name="Investments"
                  />
                  <Bar
                    dataKey="Other Assets"
                    stackId="assets"
                    fill={BS_COLORS_VARS["Other Assets"]}
                    name="Other Assets"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {!noTableData && (
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-xs text-left text-slate-500 dark:text-slate-400 data-table-compact">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-2 sticky left-0 bg-slate-50 dark:bg-slate-700 z-10"
                ></th>
                {balanceSheetData
                  .map((bs) => bs.year)
                  .map((year) => (
                    <th scope="col" key={year} className="px-3 py-2 text-right">
                      {year}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {tableHeaders.map((header) => (
                <tr
                  key={header.key}
                  className={`bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 ${
                    header.isTotal
                      ? "font-semibold text-slate-700 dark:text-slate-200"
                      : ""
                  }`}
                >
                  <td className="px-3 py-2 sticky left-0 bg-white dark:bg-slate-800 z-10 whitespace-nowrap">
                    {header.label}
                  </td>
                  {balanceSheetData.map((yearlyData) => (
                    <td
                      key={yearlyData.year + "-" + header.key}
                      className="px-3 py-2 text-right"
                    >
                      {yearlyData[header.key]}
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

export default BalanceSheetSection;
