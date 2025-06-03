// src/components/ProfitAndLossSection.jsx
import React, { useRef, useCallback } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
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
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-lg text-xs">
        <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">
          {label}
        </p>
        {payload.map((pld, index) => (
          <p key={index} style={{ color: pld.stroke }} className="my-0.5">
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

const ProfitAndLossSection = ({
  profitAndLossTableData,
  annualFinancialsChartData,
  growthData,
  stockName, // NEW PROP
}) => {
  const annualChartRef = useRef(null);

  const handleProfitLossSummarizeRequest = useCallback(async () => {
    const images = [];
    const imageMimeType = "image/png";

    if (annualChartRef.current && annualFinancialsChartData?.length > 0) {
      try {
        const dataUrl = await htmlToImage.toPng(annualChartRef.current, {
          quality: 0.85,
          backgroundColor: "var(--card-bg-color-capture, white)",
        });
        images.push({
          data: dataUrl.split(",")[1],
          mimeType: imageMimeType,
          description: "Annual Revenue & Net Profit Chart",
        });
      } catch (error) {
        console.error("Error capturing annual financials chart:", error);
      }
    }

    // Prepare textual data
    const summarizedTableData =
      profitAndLossTableData?.slice(0, 5).map((pl) => ({
        // Last 5 years
        Year: pl.year,
        Sales: pl.sales,
        OperatingProfit: pl.operatingProfit,
        NetProfit: pl.netProfit,
        EPS: pl.eps,
      })) || [];

    const dataForSummary = {
      tableSummary: summarizedTableData,
      growthMetrics: growthData, // Send all growth metrics
      chartAvailable: !!annualFinancialsChartData?.length,
    };

    try {
      const summary = await generateSectionSummary(
        "Profit & Loss",
        dataForSummary,
        stockName,
        images.length > 0 ? images : null
      );
      return summary;
    } catch (error) {
      console.error("Failed to get Profit & Loss summary:", error);
      throw error;
    }
  }, [
    profitAndLossTableData,
    annualFinancialsChartData,
    growthData,
    stockName,
  ]);

  const noTableData =
    !profitAndLossTableData || profitAndLossTableData.length === 0;
  const noAnnualChart =
    !annualFinancialsChartData || annualFinancialsChartData.length === 0;
  const noGrowthData =
    !growthData ||
    Object.keys(growthData).every(
      (key) => !growthData[key] || Object.keys(growthData[key]).length === 0
    );

  if (noTableData && noAnnualChart && noGrowthData) {
    return (
      <section className="section-card bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="m-0 text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 leading-tight">
            Profit & Loss
          </h2>
        </div>
        <p className="text-slate-500 dark:text-slate-400">
          No Profit & Loss data available.
        </p>
      </section>
    );
  }

  return (
    <section className="section-card bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="m-0 text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 leading-tight">
          Profit & Loss
        </h2>
        {(!noTableData || !noAnnualChart || !noGrowthData) && (
          <GeminiSummarizeButton
            sectionTitle="Profit & Loss"
            onSummarizeRequest={handleProfitLossSummarizeRequest}
          />
        )}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 -mt-3 mb-5">
        Consolidated Figures in Rs. Crores (unless stated otherwise)
      </p>

      {!noAnnualChart && (
        <div
          ref={annualChartRef}
          className="chart-box p-4 rounded-lg bg-[var(--card-bg-color)] dark:bg-[var(--dark-card-bg-color,#1e293b)] border border-slate-200 dark:border-slate-700 mb-6"
        >
          <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
            Annual Revenue & Net Profit (Cr.)
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={annualFinancialsChartData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--chart-grid-color, #e0e0e0)"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9, fill: "var(--chart-tick-color, #555)" }}
                stroke="var(--chart-axis-line-color, #ccc)"
              />
              <YAxis
                tick={{ fontSize: 9, fill: "var(--chart-tick-color, #555)" }}
                stroke="var(--chart-axis-line-color, #ccc)"
                tickFormatter={(value) =>
                  typeof value === "number" ? value.toLocaleString() : value
                }
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
                dataKey="sales"
                stroke="var(--chart-revenue-color, #2980b9)"
                name="Revenue"
                activeDot={{ r: 5 }}
                strokeWidth={1.5}
                connectNulls={true}
              />
              <Line
                type="monotone"
                dataKey="netProfit"
                stroke="var(--chart-profit-color, #c0392b)"
                name="Net Profit"
                activeDot={{ r: 5 }}
                strokeWidth={1.5}
                connectNulls={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {!noTableData && (
        <div className="overflow-x-auto shadow-md sm:rounded-lg mb-6">
          <table className="w-full text-xs text-left text-slate-500 dark:text-slate-400 data-table-compact">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
              <tr>
                <th scope="col" className="px-3 py-2">
                  Year
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Sales
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Expenses
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Op. Profit
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  OPM %
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Other Inc.
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Interest
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Deprec.
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  PBT
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Tax %
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Net Profit
                </th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">
                  EPS (₹)
                </th>
                {/* <th scope="col" className="px-3 py-2 text-right">Div Payout %</th> */}
              </tr>
            </thead>
            <tbody>
              {profitAndLossTableData.map((pl, index) => (
                <tr
                  key={pl.year + "-" + index}
                  className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
                >
                  <td className="px-3 py-2 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                    {pl.year}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {typeof pl.sales === "number"
                      ? pl.sales.toFixed(2)
                      : pl.sales}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {typeof pl.expenses === "number"
                      ? pl.expenses.toFixed(2)
                      : pl.expenses}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {typeof pl.operatingProfit === "number"
                      ? pl.operatingProfit.toFixed(2)
                      : pl.operatingProfit}
                  </td>
                  <td className="px-3 py-2 text-right">{pl.opm}</td>
                  <td className="px-3 py-2 text-right">
                    {typeof pl.otherIncome === "number"
                      ? pl.otherIncome.toFixed(2)
                      : pl.otherIncome}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {typeof pl.interest === "number"
                      ? pl.interest.toFixed(2)
                      : pl.interest}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {typeof pl.depreciation === "number"
                      ? pl.depreciation.toFixed(2)
                      : pl.depreciation}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {typeof pl.profitBeforeTax === "number"
                      ? pl.profitBeforeTax.toFixed(2)
                      : pl.profitBeforeTax}
                  </td>
                  <td className="px-3 py-2 text-right">{pl.tax}</td>
                  <td className="px-3 py-2 text-right">
                    {typeof pl.netProfit === "number"
                      ? pl.netProfit.toFixed(2)
                      : pl.netProfit}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-purple-600 dark:text-purple-400">
                    {typeof pl.eps === "number" ? pl.eps.toFixed(2) : pl.eps}
                  </td>
                  {/* <td className="px-3 py-2 text-right">{pl.dividendPayout}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!noGrowthData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(growthData).map(([key, data]) => {
            // Reformat title from camelCase to Title Case
            const title = key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase());
            if (data && Object.keys(data).length > 0) {
              // Ensure data object is not empty
              return (
                <div
                  key={key}
                  className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg shadow"
                >
                  <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    {title}
                  </h4>
                  {Object.entries(data).map(([period, value]) => (
                    <div
                      key={period}
                      className="flex justify-between text-xs text-slate-500 dark:text-slate-400"
                    >
                      <span>{period}:</span>{" "}
                      <span className="font-medium">{value}%</span>
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </section>
  );
};

export default ProfitAndLossSection;
