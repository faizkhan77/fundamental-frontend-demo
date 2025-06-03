// src/components/EnhancedPriceChart.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
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

// PriceChartTooltip remains the same...
const PriceChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-lg text-sm">
        <p className="label font-bold mb-1.5 text-slate-700 dark:text-slate-200">
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
              style={{ color: pld.stroke || pld.fill }}
              className="my-0.5"
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

const EnhancedPriceChart = ({ stockId, API_BASE_URL, stockName }) => {
  const [priceChartDisplayData, setPriceChartDisplayData] = useState([]);
  const [isLoadingPriceChart, setIsLoadingPriceChart] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("1y");
  const [show50DMA, setShow50DMA] = useState(true);
  const [show200DMA, setShow200DMA] = useState(true);
  const [showVolumeBars, setShowVolumeBars] = useState(true);

  const chartContainerRef = useRef(null);

  const animationDurationMs = 700;
  const animationEasingType = "ease-out";
  const chartComponentKey = `price-chart-${stockId}-${selectedTimeRange}-${show50DMA}-${show200DMA}-${showVolumeBars}`;

  const fetchPriceChart = useCallback(async () => {
    if (!stockId || !API_BASE_URL) return;
    setIsLoadingPriceChart(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/stock/${stockId}/price-chart?time_range=${selectedTimeRange}`
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setPriceChartDisplayData(data.priceData || []);
    } catch (error) {
      console.error("Failed to fetch price chart data:", error);
      setPriceChartDisplayData([]);
    } finally {
      setIsLoadingPriceChart(false);
    }
  }, [stockId, selectedTimeRange, API_BASE_URL]);

  useEffect(() => {
    fetchPriceChart();
  }, [fetchPriceChart]);

  const handlePriceChartSummarizeRequest = async () => {
    let chartImageBase64 = null;
    const imageMimeType = "image/png";

    if (chartContainerRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(chartContainerRef.current, {
          quality: 0.9,
          // Ensure a background color is applied to the captured element via CSS
          // for consistent capture, especially if it has transparent parts.
        });
        chartImageBase64 = dataUrl.split(",")[1];
      } catch (error) {
        console.error("Error capturing chart image:", error);
      }
    }

    const dataForSummary = {
      stockId,
      currentTimeRange: selectedTimeRange,
      is50DMAVisible: show50DMA,
      is200DMAVisible: show200DMA,
      isVolumeVisible: showVolumeBars,
      hasChartData: priceChartDisplayData && priceChartDisplayData.length > 0,
      chartDataPointCount: priceChartDisplayData
        ? priceChartDisplayData.length
        : 0,
    };

    try {
      const summary = await generateSectionSummary(
        "Price Chart",
        dataForSummary,
        stockName,
        chartImageBase64
          ? { data: chartImageBase64, mimeType: imageMimeType }
          : null
      );
      return summary;
    } catch (error) {
      console.error("Failed to get summary from Gemini service:", error);
      throw error;
    }
  };

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
  };

  const formatDateTick = (tickItem) => {
    if (!tickItem) return "";
    const date = new Date(tickItem);
    if (selectedTimeRange === "1m" || selectedTimeRange === "6m") {
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      });
    }
    if (selectedTimeRange === "1y") {
      return date.toLocaleDateString("en-GB", {
        month: "short",
        year: "2-digit",
      });
    }
    return date.toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
    });
  };

  const timeRangeButtonBaseClass =
    "px-2.5 py-1.5 text-xs sm:text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 dark:focus:ring-offset-slate-800 transition-colors duration-150";
  const timeRangeButtonActiveClass =
    "bg-purple-600 text-white dark:bg-purple-500";
  const timeRangeButtonInactiveClass =
    "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600";
  const checkboxLabelClass =
    "inline-flex items-center cursor-pointer text-sm text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400";
  const checkboxInputClass =
    "mr-2 h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 dark:border-slate-600 dark:bg-slate-700 dark:focus:ring-purple-600 dark:focus:ring-offset-slate-800";

  return (
    <section className="section-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-x-4 gap-y-3 mb-4">
        {/* Container for Title and Summarize Button */}
        <div className="flex items-center gap-2">
          {" "}
          {/* Use gap for spacing, items-center for vertical alignment */}
          <h2 className="m-0 text-xl sm:text-2xl font-semibold leading-tight">
            {" "}
            {/* leading-tight for better box model */}
            Price Chart
          </h2>
          <GeminiSummarizeButton
            sectionTitle="Price Chart"
            onSummarizeRequest={handlePriceChartSummarizeRequest}
          />
        </div>
        {/* Container for Time Range Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {" "}
          {/* items-center added for consistency if wraps */}
          {["1m", "6m", "1y", "3y", "5y", "max"].map((range) => (
            <button
              key={range}
              onClick={() => handleTimeRangeChange(range)}
              className={`${timeRangeButtonBaseClass} ${
                selectedTimeRange === range
                  ? timeRangeButtonActiveClass
                  : timeRangeButtonInactiveClass
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <label className={checkboxLabelClass}>
          <input
            type="checkbox"
            className={checkboxInputClass}
            checked={showVolumeBars}
            onChange={() => setShowVolumeBars(!showVolumeBars)}
          />
          <span>Volume</span>
        </label>
        <label className={checkboxLabelClass}>
          <input
            type="checkbox"
            className={checkboxInputClass}
            checked={show50DMA}
            onChange={() => setShow50DMA(!show50DMA)}
          />
          <span>50 DMA</span>
        </label>
        <label className={checkboxLabelClass}>
          <input
            type="checkbox"
            className={checkboxInputClass}
            checked={show200DMA}
            onChange={() => setShow200DMA(!show200DMA)}
          />
          <span>200 DMA</span>
        </label>
      </div>
      <div
        ref={chartContainerRef}
        className="chart-container bg-[var(--card-bg-color)] dark:bg-[var(--dark-card-bg-color,#1e293b)]"
        style={{ height: "450px" }}
      >
        {isLoadingPriceChart ? (
          <p className="loading-message">Loading chart data...</p>
        ) : priceChartDisplayData && priceChartDisplayData.length > 0 ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
            key={chartComponentKey}
          >
            <ComposedChart
              data={priceChartDisplayData}
              margin={{ top: 5, right: 5, left: 0, bottom: 25 }}
            >
              <defs>
                <linearGradient
                  id="priceAreaGradientEnhanced"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--chart-price-area-start, #3498db)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-price-area-end, #3498db)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--chart-grid-color, #e0e0e0)"
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateTick}
                tick={{ fontSize: 10, fill: "var(--chart-tick-color, #555)" }}
                stroke="var(--chart-axis-line-color, #ccc)"
                angle={
                  selectedTimeRange === "max" ||
                  selectedTimeRange === "5y" ||
                  selectedTimeRange === "3y"
                    ? -35
                    : 0
                }
                textAnchor={
                  selectedTimeRange === "max" ||
                  selectedTimeRange === "5y" ||
                  selectedTimeRange === "3y"
                    ? "end"
                    : "middle"
                }
                dy={
                  selectedTimeRange === "max" ||
                  selectedTimeRange === "5y" ||
                  selectedTimeRange === "3y"
                    ? 10
                    : 5
                }
                minTickGap={
                  selectedTimeRange === "1m"
                    ? 7
                    : selectedTimeRange === "6m"
                    ? 10
                    : 15
                }
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="priceAxis"
                orientation="left"
                stroke="var(--chart-axis-line-color, #ccc)"
                tick={{ fontSize: 10, fill: "var(--chart-tick-color, #555)" }}
                tickFormatter={(value) =>
                  typeof value === "number"
                    ? value.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })
                    : value
                }
                domain={["auto", "auto"]}
                label={{
                  value: "Price (₹)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "var(--chart-label-color, #555)",
                  fontSize: 12,
                  dy: 40,
                  dx: -5,
                }}
                allowDataOverflow={false}
              />
              {showVolumeBars && (
                <YAxis
                  yAxisId="volumeAxis"
                  orientation="right"
                  stroke="var(--chart-axis-line-color, #ccc)"
                  tick={{ fontSize: 10, fill: "var(--chart-tick-color, #555)" }}
                  tickFormatter={(value) =>
                    value >= 1000000
                      ? `${(value / 1000000).toFixed(1)}M`
                      : value >= 1000
                      ? `${(value / 1000).toFixed(0)}K`
                      : value.toLocaleString()
                  }
                  domain={[0, "dataMax * 4"]}
                  label={{
                    value: "Volume",
                    angle: 90,
                    position: "insideRight",
                    fill: "var(--chart-label-color, #555)",
                    fontSize: 12,
                    dy: -50,
                    dx: 10,
                  }}
                  allowDataOverflow={false}
                  width={60}
                />
              )}
              <Tooltip
                content={<PriceChartTooltip />}
                wrapperStyle={{ zIndex: 100 }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{
                  fontSize: "12px",
                  color: "var(--chart-legend-text-color, #333)",
                }}
              />
              <Area
                yAxisId="priceAxis"
                type="monotone"
                dataKey="price"
                name="Price"
                stroke="var(--chart-price-line-color, #3498db)"
                fill="url(#priceAreaGradientEnhanced)"
                strokeWidth={1.5}
                activeDot={{
                  r: 5,
                  strokeWidth: 1,
                  fill: "#fff",
                  stroke: "var(--chart-price-line-color, #3498db)",
                }}
                connectNulls={true}
                isAnimationActive={true}
                animationDuration={animationDurationMs}
                animationEasing={animationEasingType}
              />
              {show50DMA && (
                <Line
                  yAxisId="priceAxis"
                  type="monotone"
                  dataKey="dma50"
                  name="50 DMA"
                  stroke="var(--chart-dma50-color, #f39c12)"
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls={true}
                  isAnimationActive={false}
                />
              )}
              {show200DMA && (
                <Line
                  yAxisId="priceAxis"
                  type="monotone"
                  dataKey="dma200"
                  name="200 DMA"
                  stroke="var(--chart-dma200-color, #8e44ad)"
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls={true}
                  isAnimationActive={false}
                />
              )}
              {showVolumeBars && (
                <Bar
                  yAxisId="volumeAxis"
                  dataKey="volume"
                  name="Volume"
                  fill="var(--chart-volume-bar-color, #aed6f1)"
                  isAnimationActive={true}
                  animationDuration={animationDurationMs}
                  animationEasing={animationEasingType}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <p className="no-data-message">
            No price data available for the selected period.
          </p>
        )}
      </div>
    </section>
  );
};

export default EnhancedPriceChart;
