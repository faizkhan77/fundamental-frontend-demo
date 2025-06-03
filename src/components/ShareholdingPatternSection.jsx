// src/components/ShareholdingPatternSection.jsx
import React, { useRef, useCallback, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Sector,
} from "recharts";
import * as htmlToImage from "html-to-image";
import GeminiSummarizeButton from "./GeminiSummarizeButton";
import { generateSectionSummary } from "../services/geminiService";

// Tooltip for Pie and Line charts in this section
const CustomShareholdingTooltip = ({
  active,
  payload,
  chartType,
  pieDataPointName,
}) => {
  if (active && payload && payload.length) {
    if (chartType === "pie") {
      const dataPoint = payload[0];
      const name = dataPoint.name || pieDataPointName; // Use name from payload, fallback if needed
      const value = dataPoint.value;
      return (
        <div className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-lg text-xs">
          <p
            className="font-bold mb-0.5"
            style={{ color: dataPoint.payload.fill || dataPoint.color }}
          >
            {`${name}: ${value != null ? value.toFixed(2) : "N/A"}%`}
          </p>
        </div>
      );
    } else if (chartType === "line") {
      // For Line chart (Trend)
      const label = payload[0].payload.date; // Assuming X-axis is 'date'
      return (
        <div className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-lg text-xs">
          <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">
            {label}
          </p>
          {payload.map((pld, index) => (
            <p key={index} style={{ color: pld.stroke }} className="my-0.5">
              {`${pld.name}: ${
                typeof pld.value === "number" ? pld.value.toFixed(2) : pld.value
              }%`}
            </p>
          ))}
        </div>
      );
    }
  }
  return null;
};

const COLORS = [
  // Define colors for shareholding categories
  "var(--chart-promoters-color, #0088FE)",
  "var(--chart-fii-color, #00C49F)",
  "var(--chart-dii-color, #FFBB28)",
  "var(--chart-public-color, #FF8042)",
  "var(--chart-others-color, #8884d8)",
];

const renderActiveShape = (props) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
  } = props;
  return (
    <g>
      <text
        x={cx}
        y={cy - 5}
        dy={8}
        textAnchor="middle"
        fill={fill}
        className="text-sm font-semibold"
      >
        {payload.name}
      </text>
      <text
        x={cx}
        y={cy + 15}
        dy={8}
        textAnchor="middle"
        fill="var(--text-color-muted, #666)"
        className="text-xs"
      >
        {`${(percent * 100).toFixed(2)}%`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 4} // Make active sector slightly larger
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="var(--card-bg-color, white)" // Use themed background for separation
        strokeWidth={2}
      />
    </g>
  );
};

const ShareholdingPatternSection = ({
  shareholdingHistory,
  shareholdingPieData,
  shareholdingTrendData,
  stockName,
}) => {
  const pieChartRef = useRef(null);
  const trendChartRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);

  const onPieEnter = useCallback((_, index) => {
    setActiveIndex(index);
  }, []);
  const onPieLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  const handleShareholdingSummarizeRequest = useCallback(async () => {
    console.log("[Shareholding] Summarize request started.");
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

    if (pieChartRef.current && shareholdingPieData?.length > 0) {
      try {
        console.log("[Shareholding] Capturing Pie chart...");
        const dataUrl = await htmlToImage.toPng(pieChartRef.current, {
          quality: 0.85,
          backgroundColor: captureBgColor,
        });
        images.push({
          data: dataUrl.split(",")[1],
          mimeType: imageMimeType,
          description: `Shareholding Distribution Pie Chart (${shareholdingHistory[0]?.date})`,
        });
        console.log("[Shareholding] Pie chart captured.");
      } catch (error) {
        console.error("[Shareholding] Error capturing pie chart:", error);
      }
    }

    if (trendChartRef.current && shareholdingTrendData?.length > 0) {
      try {
        console.log("[Shareholding] Capturing Trend chart...");
        const dataUrl = await htmlToImage.toPng(trendChartRef.current, {
          quality: 0.85,
          backgroundColor: captureBgColor,
        });
        images.push({
          data: dataUrl.split(",")[1],
          mimeType: imageMimeType,
          description: "Shareholding Trend Chart",
        });
        console.log("[Shareholding] Trend chart captured.");
      } catch (error) {
        console.error("[Shareholding] Error capturing trend chart:", error);
      }
    }

    // Summarize table data - latest few entries
    const summarizedTableData =
      shareholdingHistory?.slice(0, 4).map((sh) => ({
        Date: sh.date,
        Promoters: sh.promoters,
        FII: sh.fii,
        DII: sh.dii,
        Public: sh.public,
      })) || [];

    const dataForSummary = {
      latestDistributionDate: shareholdingHistory[0]?.date,
      tableSummary: summarizedTableData, // Recent trend from table
      chartsAvailable: {
        pieChart: !!shareholdingPieData?.length,
        trendChart: !!shareholdingTrendData?.length,
      },
    };

    console.log(
      "[Shareholding] Final images array before sending:",
      images.map((img) => ({ desc: img.description, size: img.data?.length }))
    );

    try {
      const summary = await generateSectionSummary(
        "Shareholding Pattern",
        dataForSummary,
        stockName,
        images.length > 0 ? images : null
      );
      return summary;
    } catch (error) {
      console.error("Failed to get Shareholding Pattern summary:", error);
      throw error;
    }
  }, [
    shareholdingHistory,
    shareholdingPieData,
    shareholdingTrendData,
    stockName,
  ]);

  const noHistory = !shareholdingHistory || shareholdingHistory.length === 0;
  const noPieData = !shareholdingPieData || shareholdingPieData.length === 0;
  const noTrendData =
    !shareholdingTrendData || shareholdingTrendData.length === 0;

  if (noHistory && noPieData && noTrendData) {
    return (
      <section className="section-card bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="m-0 text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 leading-tight">
            Shareholding Pattern
          </h2>
        </div>
        <p className="text-slate-500 dark:text-slate-400">
          No Shareholding Pattern data available.
        </p>
      </section>
    );
  }

  return (
    <section
      id="shareholding-section"
      className="section-card bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 sm:p-6 mb-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <h2 className="m-0 text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 leading-tight">
          Shareholding Pattern
        </h2>
        {(!noHistory || !noPieData || !noTrendData) && (
          <GeminiSummarizeButton
            sectionTitle="Shareholding Pattern"
            onSummarizeRequest={handleShareholdingSummarizeRequest}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {!noPieData && (
          <div
            ref={pieChartRef}
            className="chart-box p-4 rounded-lg bg-[var(--card-bg-color)] dark:bg-[var(--dark-card-bg-color,#1e293b)] border border-slate-200 dark:border-slate-700"
          >
            <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
              Distribution ({shareholdingHistory[0]?.date})
            </h4>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart margin={{ top: 5, right: 5, bottom: 30, left: 5 }}>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={shareholdingPieData}
                  cx="50%"
                  cy="45%" // Adjusted to give space for legend below
                  innerRadius={70}
                  outerRadius={120}
                  fill="var(--chart-default-fill, #8884d8)"
                  dataKey="value"
                  nameKey="name"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  labelLine={false} // Hiding default labels
                  label={false} // Hiding default labels
                >
                  {shareholdingPieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="var(--card-bg-color)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={<CustomShareholdingTooltip chartType="pie" />}
                  wrapperStyle={{ zIndex: 40 }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{
                    fontSize: "10px",
                    paddingTop: "10px",
                    color: "var(--chart-legend-text-color, #333)",
                  }}
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        {!noTrendData && (
          <div
            ref={trendChartRef}
            className="chart-box p-4 rounded-lg bg-[var(--card-bg-color)] dark:bg-[var(--dark-card-bg-color,#1e293b)] border border-slate-200 dark:border-slate-700"
          >
            <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
              Shareholding Trend (%)
            </h4>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={shareholdingTrendData}
                margin={{ top: 5, right: 20, left: -10, bottom: 30 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--chart-grid-color, #e0e0e0)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9, fill: "var(--chart-tick-color, #555)" }}
                  angle={-30}
                  textAnchor="end"
                  height={40}
                  dy={10}
                  interval="preserveStartEnd"
                  stroke="var(--chart-axis-line-color, #ccc)"
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "var(--chart-tick-color, #555)" }}
                  domain={[0, "dataMax + 5"]}
                  unit="%"
                  stroke="var(--chart-axis-line-color, #ccc)"
                />
                <Tooltip
                  content={<CustomShareholdingTooltip chartType="line" />}
                  wrapperStyle={{ zIndex: 40 }}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: "10px",
                    color: "var(--chart-legend-text-color, #333)",
                  }}
                  verticalAlign="top"
                  align="center"
                  height={30}
                />
                <Line
                  type="monotone"
                  dataKey="Promoters"
                  stroke={COLORS[0]}
                  activeDot={{ r: 5 }}
                  connectNulls={true}
                  name="Promoters"
                  strokeWidth={1.5}
                />
                <Line
                  type="monotone"
                  dataKey="FII"
                  stroke={COLORS[1]}
                  activeDot={{ r: 5 }}
                  connectNulls={true}
                  name="FII"
                  strokeWidth={1.5}
                />
                <Line
                  type="monotone"
                  dataKey="DII"
                  stroke={COLORS[2]}
                  activeDot={{ r: 5 }}
                  connectNulls={true}
                  name="DII"
                  strokeWidth={1.5}
                />
                <Line
                  type="monotone"
                  dataKey="Public"
                  stroke={COLORS[3]}
                  activeDot={{ r: 5 }}
                  connectNulls={true}
                  name="Public"
                  strokeWidth={1.5}
                />
                {shareholdingTrendData.some(
                  (d) => d.Others != null && d.Others > 0
                ) && (
                  <Line
                    type="monotone"
                    dataKey="Others"
                    stroke={COLORS[4]}
                    activeDot={{ r: 5 }}
                    connectNulls={true}
                    name="Others"
                    strokeWidth={1.5}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {!noHistory && (
        <div className="overflow-x-auto shadow-md sm:rounded-lg mt-6">
          <table className="w-full text-xs text-left text-slate-500 dark:text-slate-400 data-table-compact">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
              <tr>
                <th scope="col" className="px-3 py-2">
                  Date
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Promoters %
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  FII %
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  DII %
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Public %
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Others %
                </th>
              </tr>
            </thead>
            <tbody>
              {shareholdingHistory.map((sh, index) => (
                <tr
                  key={sh.date + "-" + index}
                  className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
                >
                  <td className="px-3 py-2 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                    {sh.date}
                  </td>
                  <td className="px-3 py-2 text-right">{sh.promoters}</td>
                  <td className="px-3 py-2 text-right">{sh.fii}</td>
                  <td className="px-3 py-2 text-right">{sh.dii}</td>
                  <td className="px-3 py-2 text-right">{sh.public}</td>
                  <td className="px-3 py-2 text-right">{sh.others}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default ShareholdingPatternSection;
