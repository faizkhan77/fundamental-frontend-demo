// src/components/QuarterlyResultsSection.jsx
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

const QuarterlyResultsSection = ({
  quarterlyTableData,
  financialsChartData,
  epsChartData,
  stockName,
}) => {
  const financialsChartRef = useRef(null);
  const epsChartRef = useRef(null);

  const handleQuarterlyResultsSummarizeRequest = useCallback(async () => {
    const images = []; // Array to hold multiple image data objects
    const imageMimeType = "image/png";

    if (financialsChartRef.current && financialsChartData?.length > 0) {
      try {
        const dataUrl = await htmlToImage.toPng(financialsChartRef.current, {
          quality: 0.85,
          backgroundColor: "var(--card-bg-color-capture, white)",
        });
        images.push({
          data: dataUrl.split(",")[1],
          mimeType: imageMimeType,
          description: "Quarterly Revenue & Net Profit Chart",
        });
      } catch (error) {
        console.error("Error capturing financials chart image:", error);
      }
    }

    if (epsChartRef.current && epsChartData?.length > 0) {
      try {
        const dataUrl = await htmlToImage.toPng(epsChartRef.current, {
          quality: 0.85,
          backgroundColor: "var(--card-bg-color-capture, white)",
        });
        images.push({
          data: dataUrl.split(",")[1],
          mimeType: imageMimeType,
          description: "Quarterly EPS Chart",
        });
      } catch (error) {
        console.error("Error capturing EPS chart image:", error);
      }
    }

    const summarizedTableData =
      quarterlyTableData?.slice(0, 8).map((q) => ({
        quarter: q.quarter,
        revenue: q.revenue,
        netProfit: q.netProfit,
        eps: q.eps,
      })) || [];

    const dataForSummary = {
      tableDataSummary: summarizedTableData,
      chartsInfo: {
        financialsTrend: !!financialsChartData?.length,
        epsTrend: !!epsChartData?.length,
      },
    };

    try {
      const summary = await generateSectionSummary(
        "Quarterly Results",
        dataForSummary,
        stockName,
        images.length > 0 ? images : null // Pass array of image data objects
      );
      return summary;
    } catch (error) {
      console.error("Failed to get quarterly results summary:", error);
      throw error;
    }
  }, [quarterlyTableData, financialsChartData, epsChartData, stockName]);

  const noTableData = !quarterlyTableData || quarterlyTableData.length === 0;
  const noFinancialsChart =
    !financialsChartData || financialsChartData.length === 0;
  const noEpsChart = !epsChartData || epsChartData.length === 0;

  if (noTableData && noFinancialsChart && noEpsChart) {
    return (
      <section className="section-card bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="m-0 text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 leading-tight">
            Quarterly Results
          </h2>
        </div>
        <p className="text-slate-500 dark:text-slate-400">
          No Quarterly Results data available.
        </p>
      </section>
    );
  }

  const chartHeight = 300;

  return (
    <section className="section-card bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="m-0 text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 leading-tight">
          Quarterly Results
        </h2>
        {(!noTableData || !noFinancialsChart || !noEpsChart) && (
          <GeminiSummarizeButton
            sectionTitle="Quarterly Results"
            onSummarizeRequest={handleQuarterlyResultsSummarizeRequest}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {!noFinancialsChart && (
          <div
            ref={financialsChartRef}
            className="chart-box p-4 rounded-lg bg-[var(--card-bg-color)] dark:bg-[var(--dark-card-bg-color,#1e293b)] border border-slate-200 dark:border-slate-700"
          >
            <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
              Quarterly Revenue & Net Profit (Cr.)
            </h4>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <LineChart
                data={financialsChartData}
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
                  stroke="var(--chart-revenue-color, #8884d8)"
                  name="Revenue"
                  activeDot={{ r: 5 }}
                  strokeWidth={1.5}
                  connectNulls={true}
                />
                <Line
                  type="monotone"
                  dataKey="netProfit"
                  stroke="var(--chart-profit-color, #e74c3c)"
                  name="Net Profit"
                  activeDot={{ r: 5 }}
                  strokeWidth={1.5}
                  connectNulls={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {!noEpsChart && (
          <div
            ref={epsChartRef}
            className="chart-box p-4 rounded-lg bg-[var(--card-bg-color)] dark:bg-[var(--dark-card-bg-color,#1e293b)] border border-slate-200 dark:border-slate-700"
          >
            <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
              Quarterly EPS (₹)
            </h4>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <LineChart
                data={epsChartData}
                margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
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
                    typeof value === "number" ? value.toFixed(2) : value
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
                  dataKey="eps"
                  stroke="var(--chart-eps-color, #27ae60)"
                  name="EPS"
                  activeDot={{ r: 5 }}
                  strokeWidth={1.5}
                  connectNulls={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {!noTableData && (
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-xs text-left text-slate-500 dark:text-slate-400 data-table-compact">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
              <tr>
                <th scope="col" className="px-3 py-2">
                  Quarter
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Revenue (Cr.)
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Interest (Cr.)
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Net Profit (Cr.)
                </th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">
                  EPS (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {quarterlyTableData.map((q, index) => (
                <tr
                  key={q.quarter + "-" + index}
                  className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
                >
                  <td className="px-3 py-2 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                    {q.quarter}
                  </td>
                  <td className="px-3 py-2 text-right">{q.revenue}</td>
                  <td className="px-3 py-2 text-right">{q.interest}</td>
                  <td className="px-3 py-2 text-right">{q.netProfit}</td>
                  <td className="px-3 py-2 text-right font-semibold text-purple-600 dark:text-purple-400">
                    {q.eps}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default QuarterlyResultsSection;
