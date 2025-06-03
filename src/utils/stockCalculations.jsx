// src/utils/stockCalculations.js

// ... (keep existing functions like calculateMarketCap, getCurrentPrice, etc.)
export const calculateMarketCap = (stockData) => {
  return stockData?.marketCap ?? "N/A";
};
export const getCurrentPrice = (stockData) => {
  return stockData?.currentPrice ?? "N/A";
};
export const getPreviousClose = (stockData) => {
  return stockData?.previousClose ?? "N/A";
};
export const getDayHighLow = (stockData) => {
  return `${stockData?.dayHigh ?? "N/A"} / ${stockData?.dayLow ?? "N/A"}`;
};
export const getYearHighLow = (stockData) => {
  return `${stockData?.yearHigh ?? "N/A"} / ${stockData?.yearLow ?? "N/A"}`;
};
export const calculateStockPE = (stockData) => {
  if (
    stockData?.currentPrice &&
    stockData?.earningsPerShareTTM &&
    stockData.earningsPerShareTTM !== 0
  ) {
    return (stockData.currentPrice / stockData.earningsPerShareTTM).toFixed(2);
  }
  return "N/A";
};
export const getBookValue = (stockData) => {
  return stockData?.bookValuePerShare?.toFixed(2) ?? "N/A";
};
export const calculateDividendYield = (stockData) => {
  if (
    stockData?.dividendPerShare &&
    stockData?.currentPrice &&
    stockData.currentPrice !== 0
  ) {
    return (
      (stockData.dividendPerShare / stockData.currentPrice) *
      100
    ).toFixed(2);
  }
  return "N/A";
};
export const calculateROCE = (stockData) => {
  if (
    stockData?.earningsBeforeInterestAndTaxAnnual &&
    stockData?.capitalEmployedAnnual &&
    stockData.capitalEmployedAnnual !== 0
  ) {
    return (
      (stockData.earningsBeforeInterestAndTaxAnnual /
        stockData.capitalEmployedAnnual) *
      100
    ).toFixed(2);
  }
  return "N/A";
};
export const calculateROE = (stockData) => {
  if (
    stockData?.netProfitAnnual &&
    stockData?.shareholderEquity &&
    stockData.shareholderEquity !== 0
  ) {
    return (
      (stockData.netProfitAnnual / stockData.shareholderEquity) *
      100
    ).toFixed(2);
  }
  return "N/A";
};
export const getFaceValue = (stockData) => {
  return stockData?.faceValue ?? "N/A";
};
export const calculateRSI = (priceHistory, period = 14) => {
  if (!priceHistory || priceHistory.length < period) return "N/A";
  const prices = priceHistory.map((p) => p.close);
  let gains = 0,
    losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  let avgGain = gains / period,
    avgLoss = losses / period;
  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - diff) / period;
    }
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return (100 - 100 / (1 + rs)).toFixed(2);
};

// New and Enhanced Calculation Functions
export const getPriceChange = (stockData) => {
  if (stockData?.currentPrice && stockData?.previousClose) {
    const change = stockData.currentPrice - stockData.previousClose;
    const percentChange = (change / stockData.previousClose) * 100;
    return {
      absolute: change.toFixed(2),
      percent: percentChange.toFixed(2),
      isPositive: change >= 0,
    };
  }
  return { absolute: "N/A", percent: "N/A", isPositive: true };
};

export const formatPriceVolumeDataForChart = (priceHistory) => {
  if (!priceHistory) return [];
  return priceHistory.map((item) => ({
    date: item.date, // Recharts usually infers date parsing, or use moment.js to format
    price: item.close,
    volume: item.volume,
  }));
};

export const getPros = (stockData) => stockData?.pros ?? [];
export const getCons = (stockData) => stockData?.cons ?? [];
export const getAboutInfo = (stockData) =>
  stockData?.about ?? "No information available.";
export const getKeyPoints = (stockData) => stockData?.keyPoints ?? []; // Added

export const getPeerComparisonData = (stockData) =>
  stockData?.peerComparison ?? [];

export const formatPeerComparisonForChart = (
  peerData,
  selfSymbol,
  metricKey,
  chartTitle
) => {
  if (!peerData) return { data: [], title: chartTitle };
  const chartData = peerData
    .filter((peer) => typeof peer[metricKey] === "number") // Only include peers with valid numeric metric
    .map((peer) => ({
      name: peer.name,
      [metricKey]: peer[metricKey],
    }));

  // Optionally add self to the peer chart
  // const selfData = dummyStockData.find(s => s.symbol === selfSymbol);
  // if (selfData && typeof selfData[metricKey] === 'number') {
  //   chartData.push({ name: selfData.name, [metricKey]: selfData[metricKey] });
  // }

  return { data: chartData, title: chartTitle, dataKey: metricKey };
};

export const getQuarterlyResults = (stockData) =>
  stockData?.quarterlyResults ?? [];
export const formatQuarterlyFinancialsForChart = (
  quarterlyResults,
  dataKeys
) => {
  if (!quarterlyResults) return [];
  return quarterlyResults.map((q) => {
    const entry = { name: q.quarter }; // 'name' is conventional for X-axis in Recharts
    dataKeys.forEach((key) => (entry[key] = q[key]));
    return entry;
  });
};

export const getProfitAndLoss = (stockData) => stockData?.profitAndLoss ?? [];
export const formatAnnualFinancialsForChart = (profitAndLoss, dataKeys) => {
  if (!profitAndLoss) return [];
  return profitAndLoss
    .filter((item) => item.year !== "TTM") // Exclude TTM for annual trend charts
    .map((pl) => {
      const entry = { name: pl.year };
      dataKeys.forEach((key) => (entry[key] = pl[key]));
      return entry;
    });
};

export const getCashFlows = (stockData) => stockData?.cashFlows ?? [];
export const formatCashFlowsForChart = (cashFlows, dataKeys) => {
  if (!cashFlows) return [];
  return cashFlows
    .filter((item) => item.year !== "TTM")
    .map((cf) => {
      const entry = { name: cf.year };
      dataKeys.forEach((key) => (entry[key] = cf[key]));
      return entry;
    });
};

export const getShareholdingHistory = (stockData) =>
  stockData?.shareholdingPatternHistory ?? [];
export const getLatestShareholding = (stockData) => {
  const history = stockData?.shareholdingPatternHistory;
  if (!history || history.length === 0) return null;
  return history[history.length - 1]; // Assumes last entry is latest
};

export const formatShareholdingForPieChart = (latestShareholding) => {
  if (!latestShareholding || !latestShareholding.date) return []; // Check if latestShareholding itself and its date are valid
  const { date, ...pattern } = latestShareholding; // Exclude date from pattern data
  return Object.entries(pattern)
    .filter(([key, value]) => key !== "others" || value > 0) // Exclude 'others' if 0
    .map(([name, value]) => ({ name: name.toUpperCase(), value }));
};

export const formatShareholdingTrendForChart = (shareholdingHistory) => {
  if (!shareholdingHistory) return [];
  // Recharts expects data in an array of objects, where each object is a point in time
  // and keys are the series (promoters, fii, dii, public)
  return shareholdingHistory.map((pattern) => ({
    date: pattern.date,
    Promoters: pattern.promoters,
    FII: pattern.fii,
    DII: pattern.dii,
    Public: pattern.public,
  }));
};
