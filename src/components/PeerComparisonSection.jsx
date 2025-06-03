// src/components/PeerComparisonSection.jsx
import React, { useRef, useCallback } from "react"; // Added useRef, useCallback
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
import * as htmlToImage from "html-to-image"; // NEW IMPORT
import GeminiSummarizeButton from "./GeminiSummarizeButton"; // NEW IMPORT
import { generateSectionSummary } from "../services/geminiService"; // NEW IMPORT

// Make sure CustomTooltip is defined here or imported from a shared utility
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const name = payload[0].name; // For BarChart, name is the dataKey
    const entryName = payload[0].payload.name; // Actual name from data (e.g., company name)

    return (
      <div className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-lg text-xs">
        <p className="font-bold text-slate-700 dark:text-slate-200">
          {entryName}
        </p>
        <p style={{ color: payload[0].fill }}>
          {`${name}: ${
            typeof value === "number" ? value.toLocaleString() : value
          }`}
        </p>
      </div>
    );
  }
  return null;
};

const PeerComparisonSection = ({
  peerComparisonData,
  peerCmpChartData,
  peerPeChartData,
  stockName, // NEW PROP
}) => {
  const cmpChartRef = useRef(null); // Ref for CMP chart
  const peChartRef = useRef(null); // Ref for P/E chart

  const handlePeerComparisonSummarizeRequest = useCallback(async () => {
    let cmpChartImage = null;
    let peChartImage = null;
    const imageMimeType = "image/png";
    const images = [];

    if (cmpChartRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(cmpChartRef.current, {
          quality: 0.85,
        });
        cmpChartImage = {
          data: dataUrl.split(",")[1],
          mimeType: imageMimeType,
          description: "CMP Comparison Chart",
        };
        images.push(cmpChartImage);
      } catch (error) {
        console.error("Error capturing CMP chart image:", error);
      }
    }

    if (peChartRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(peChartRef.current, {
          quality: 0.85,
        });
        peChartImage = {
          data: dataUrl.split(",")[1],
          mimeType: imageMimeType,
          description: "P/E Ratio Comparison Chart",
        };
        images.push(peChartImage);
      } catch (error) {
        console.error("Error capturing P/E chart image:", error);
      }
    }

    // Prepare textual data for Gemini
    // Summarize table data to avoid sending too much text if it's very long
    const summarizedPeerTableData = peerComparisonData
      .map((peer) => ({
        name: peer.name,
        cmp: peer.cmp,
        pe: peer.pe,
        marketCap: peer.marketCapFormatted || peer.marketCap,
        dividendYield: peer.dividendYield,
        roce: peer.roce,
      }))
      .slice(0, 10); // Send up to 10 peers to keep it concise, or select main company + top N

    const dataForSummary = {
      tableDataSummary: summarizedPeerTableData,
      // Include info about what the charts represent if needed, though Gemini should infer from titles/images
      chartsAvailable: {
        cmpChart: !!peerCmpChartData?.data?.length,
        peChart: !!peerPeChartData?.data?.length,
      },
      mainCompany: stockName, // To help Gemini identify the primary stock in comparisons
    };

    try {
      // Pass multiple images as an array to generateSectionSummary (if the service is adapted for it)
      // For now, we'll demonstrate sending them one by one or adapting the service
      // Let's assume generateSectionSummary can take an array of image objects.
      const summary = await generateSectionSummary(
        "Peer Comparison",
        dataForSummary,
        stockName,
        images.length > 0 ? images : null // Pass array of image data objects
      );
      return summary;
    } catch (error) {
      console.error(
        "Failed to get peer comparison summary from Gemini service:",
        error
      );
      throw error;
    }
  }, [peerComparisonData, peerCmpChartData, peerPeChartData, stockName]);

  if (!peerComparisonData || peerComparisonData.length === 0) {
    return (
      <section className="section-card">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="m-0 text-xl sm:text-2xl font-semibold leading-tight">
            Peer Comparison
          </h2>
          {/* No button if no data */}
        </div>
        <p className="text-slate-500 dark:text-slate-400">
          No peer comparison data available.
        </p>
      </section>
    );
  }
  const chartHeight = 300;

  return (
    <section className="section-card">
      <div className="flex items-center gap-2 mb-4">
        {" "}
        {/* Header styling from PriceChart */}
        <h2 className="m-0 text-xl sm:text-2xl font-semibold leading-tight">
          Peer Comparison
        </h2>
        <GeminiSummarizeButton
          sectionTitle="Peer Comparison"
          onSummarizeRequest={handlePeerComparisonSummarizeRequest}
        />
      </div>

      {/* Charts Row - Apply Tailwind for layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {peerCmpChartData?.data?.length > 0 && (
          <div
            ref={cmpChartRef}
            className="chart-box peer-chart-box p-4 rounded-lg bg-[var(--card-bg-color)] dark:bg-[var(--dark-card-bg-color,#1e293b)] border border-slate-200 dark:border-slate-700"
          >
            <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
              {peerCmpChartData.title}
            </h4>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart
                data={peerCmpChartData.data}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }} // Adjusted margins
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--chart-grid-color, #e0e0e0)"
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 9, fill: "var(--chart-tick-color, #555)" }}
                  stroke="var(--chart-axis-line-color, #ccc)"
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={80} // Adjusted width
                  tick={{
                    fontSize: 9,
                    fill: "var(--chart-tick-color, #555)",
                    width: 75,
                  }}
                  stroke="var(--chart-axis-line-color, #ccc)"
                  interval={0}
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
                  dataKey={peerCmpChartData.dataKey}
                  fill="var(--chart-series1-color, #8884d8)" // Use CSS var
                  name="CMP (₹)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {peerPeChartData?.data?.length > 0 && (
          <div
            ref={peChartRef}
            className="chart-box peer-chart-box p-4 rounded-lg bg-[var(--card-bg-color)] dark:bg-[var(--dark-card-bg-color,#1e293b)] border border-slate-200 dark:border-slate-700"
          >
            <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
              {peerPeChartData.title}
            </h4>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart
                data={peerPeChartData.data}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }} // Adjusted margins
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--chart-grid-color, #e0e0e0)"
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 9, fill: "var(--chart-tick-color, #555)" }}
                  stroke="var(--chart-axis-line-color, #ccc)"
                  domain={["auto", "auto"]}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={80} // Adjusted width
                  tick={{
                    fontSize: 9,
                    fill: "var(--chart-tick-color, #555)",
                    width: 75,
                  }}
                  stroke="var(--chart-axis-line-color, #ccc)"
                  interval={0}
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
                  dataKey={peerPeChartData.dataKey}
                  fill="var(--chart-series2-color, #82ca9d)" // Use CSS var
                  name="P/E Ratio"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Table - Ensure it's wrapped for responsiveness and styled with Tailwind */}
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-xs text-left text-slate-500 dark:text-slate-400 data-table-compact peer-comparison-table">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
            <tr>
              <th scope="col" className="px-3 py-2">
                S.No.
              </th>
              <th scope="col" className="px-3 py-2">
                Name
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                CMP Rs.
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                P/E
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                Mar Cap Rs.Cr
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                Div Yld %
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                NP Qtr Rs.Cr.
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                Qtr Profit Var %
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                Sales Qtr Rs.Cr.
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                Qtr Sales Var %
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                ROCE %
              </th>
            </tr>
          </thead>
          <tbody>
            {peerComparisonData.map((peer, index) => (
              <tr
                key={peer.id || peer.name + index}
                className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
              >
                <td className="px-3 py-2">{index + 1}</td>
                <td className="px-3 py-2 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                  {peer.name}
                </td>
                <td className="px-3 py-2 text-right">
                  {typeof peer.cmp === "number"
                    ? peer.cmp.toFixed(2)
                    : peer.cmp}
                </td>
                <td className="px-3 py-2 text-right">
                  {typeof peer.pe === "number" ? peer.pe.toFixed(2) : peer.pe}
                </td>
                <td className="px-3 py-2 text-right">
                  {peer.marketCapFormatted || peer.marketCap}
                </td>
                <td className="px-3 py-2 text-right">
                  {typeof peer.dividendYield === "number"
                    ? peer.dividendYield.toFixed(2)
                    : peer.dividendYield}
                </td>
                <td className="px-3 py-2 text-right">
                  {typeof peer.netProfitQtr === "number"
                    ? peer.netProfitQtr.toFixed(2)
                    : peer.netProfitQtr}
                </td>
                <td className="px-3 py-2 text-right">
                  {typeof peer.qtrProfitVar === "number"
                    ? peer.qtrProfitVar.toFixed(2)
                    : peer.qtrProfitVar}
                </td>
                <td className="px-3 py-2 text-right">
                  {typeof peer.salesQtr === "number"
                    ? peer.salesQtr.toFixed(2)
                    : peer.salesQtr}
                </td>
                <td className="px-3 py-2 text-right">
                  {typeof peer.qtrSalesVar === "number"
                    ? peer.qtrSalesVar.toFixed(2)
                    : peer.qtrSalesVar}
                </td>
                <td className="px-3 py-2 text-right">
                  {typeof peer.roce === "number"
                    ? peer.roce.toFixed(2)
                    : peer.roce}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
export default PeerComparisonSection;
