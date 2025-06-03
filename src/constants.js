// src/constants.js
export const ALL_INDICATOR_NAMES = [
  "EMA",
  "SMA",
  "MACD",
  "ADX",
  "Supertrend",
  "Ichimoku",
  "PSAR",
  "RSI",
  "WilliamsR",
  "VWAP",
  "BollingerBands",
  "ATR", // PSAR instead of ParabolicSAR to match backend key
];

export const INDICATOR_DISPLAY_NAMES = {
  // Optional: if display names differ from keys
  EMA: "EMA",
  SMA: "SMA",
  MACD: "MACD",
  ADX: "ADX",
  Supertrend: "SUPER TREND",
  Ichimoku: "ICHIMOKU CLOUD",
  PSAR: "PARABOLIC SAR",
  RSI: "RSI",
  WilliamsR: "WILLIAMS %R",
  VWAP: "VWAP",
  BollingerBands: "BOLLINGER BANDS",
  ATR: "ATR",
};

export const INDICATOR_WEIGHTS = {
  RSI: 1.0,
  EMA: 1.5,
  SMA: 1.5,
  MACD: 1.0,
  ADX: 1.0,
  Supertrend: 1.5,
  BollingerBands: 1.0,
  VWAP: 1.0,
  WilliamsR: 1.0,
  PSAR: 1.0,
  Ichimoku: 1.5,
  ATR: 1.0,
};

export const DECISION_SCORES = {
  "Strong Buy": 2,
  Buy: 1,
  Neutral: 0,
  Sell: -1,
  "Strong Sell": -2,
};
