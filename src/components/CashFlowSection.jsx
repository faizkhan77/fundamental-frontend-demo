// src/components/CashFlowSection.jsx
import React, { useRef, useCallback } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
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
          <p
            key={index}
            style={{ color: pld.stroke || pld.fill }}
            className="my-0.5"
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

const CF_COLORS_VARS = {
  operating: "var(--chart-cf-operating, #2980b9)",
  investing: "var(--chart-cf-investing, #c0392b)", // Will add if chart shows investing
  financing: "var(--chart-cf-financing, #27ae60)", // Will add if chart shows financing
  netChange: "var(--chart-cf-netchange, #f39c12)",
};

const CashFlowSection = ({
  cashFlowTableData,
  cashFlowsChartData,
  stockName, // NEW PROP
}) => {
  const cashFlowChartRef = useRef(null);

  const handleCashFlowSummarizeRequest = useCallback(async () => {
    const images = [];
    const imageMimeType = "image/png";

    if (cashFlowChartRef.current && cashFlowsChartData?.length > 0) {
      try {
        const dataUrl = await htmlToImage.toPng(cashFlowChartRef.current, {
          quality: 0.85,
          backgroundColor: "var(--card-bg-color-capture, white)",
        });
        images.push({
          data: dataUrl.split(",")[1],
          mimeType: imageMimeType,
          description: "Annual Cash Flow Analysis Chart",
        });
      } catch (error) {
        console.error("Error capturing cash flow chart:", error);
      }
    }

    const summarizedTableData =
      cashFlowTableData?.slice(0, 5).map((cf) => ({
        // Last 5 years
        Year: cf.year,
        OperatingCF: cf.cashFromOperating,
        InvestingCF: cf.cashFromInvesting,
        FinancingCF: cf.cashFromFinancing,
        NetCashFlow: cf.netCashFlow,
      })) || [];

    const dataForSummary = {
      tableSummary: summarizedTableData,
      chartAvailable: !!cashFlowsChartData?.length,
    };

    try {
      const summary = await generateSectionSummary(
        "Cash Flows",
        dataForSummary,
        stockName,
        images.length > 0 ? images : null
      );
      return summary;
    } catch (error) {
      console.error("Failed to get Cash Flows summary:", error);
      throw error;
    }
  }, [cashFlowTableData, cashFlowsChartData, stockName]);

  const noTableData = !cashFlowTableData || cashFlowTableData.length === 0;
  const noChartData = !cashFlowsChartData || cashFlowsChartData.length === 0;

  if (noTableData && noChartData) {
    return (
      <section className="section-card bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="m-0 text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 leading-tight">
            Cash Flows
          </h2>
        </div>
        <p className="text-slate-500 dark:text-slate-400">
          No Cash Flow data available.
        </p>
      </section>
    );
  }

  const chartHeight = 300;

  return (
    <section className="section-card bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="m-0 text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 leading-tight">
          Cash Flows
        </h2>
        {(!noTableData || !noChartData) && (
          <GeminiSummarizeButton
            sectionTitle="Cash Flows"
            onSummarizeRequest={handleCashFlowSummarizeRequest}
          />
        )}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 -mt-3 mb-5">
        Consolidated Figures in Rs. Crores
      </p>

      {!noChartData && (
        <div
          ref={cashFlowChartRef}
          className="chart-box p-4 rounded-lg bg-[var(--card-bg-color)] dark:bg-[var(--dark-card-bg-color,#1e293b)] border border-slate-200 dark:border-slate-700 mb-6"
        >
          <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
            Annual Cash Flow Analysis (Cr.)
          </h4>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <ComposedChart
              data={cashFlowsChartData}
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
                tickFormatter={(value) => value.toLocaleString()}
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
                dataKey="cashFromOperating"
                name="Operating CF"
                fill={CF_COLORS_VARS.operating}
              />
              {/* Optional: Add bars for Investing and Financing if present in chart data and desired */}
              {/* <Bar dataKey="cashFromInvesting" name="Investing CF" fill={CF_COLORS_VARS.investing} /> */}
              {/* <Bar dataKey="cashFromFinancing" name="Financing CF" fill={CF_COLORS_VARS.financing} /> */}
              <Line
                type="monotone"
                dataKey="netCashFlow"
                name="Net Cash Flow"
                stroke={CF_COLORS_VARS.netChange}
                strokeWidth={2}
                activeDot={{ r: 5 }}
                dot={{ strokeWidth: 1, r: 2.5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {!noTableData && (
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-xs text-left text-slate-500 dark:text-slate-400 data-table-compact">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
              <tr>
                <th scope="col" className="px-3 py-2">
                  Year
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Operating Activity
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Investing Activity
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Financing Activity
                </th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">
                  Net Cash Flow
                </th>
              </tr>
            </thead>
            <tbody>
              {cashFlowTableData.map((cf, index) => (
                <tr
                  key={cf.year + "-" + index}
                  className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
                >
                  <td className="px-3 py-2 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                    {cf.year}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {cf.cashFromOperating}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {cf.cashFromInvesting}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {cf.cashFromFinancing}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-purple-600 dark:text-purple-400">
                    {cf.netCashFlow}
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

export default CashFlowSection;
