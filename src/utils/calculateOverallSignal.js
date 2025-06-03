// src/utils/calculateOverallSignal.js
import { INDICATOR_WEIGHTS, DECISION_SCORES } from "../constants"; // Adjust path if constants.js is elsewhere

export const calculateFrontendOverallSignal = (
  stockSignals,
  selectedIndicators
) => {
  if (!stockSignals || stockSignals.length === 0) {
    return "Neutral";
  }

  let totalScore = 0;

  stockSignals.forEach((signal) => {
    const indicatorName = signal.name;
    if (selectedIndicators[indicatorName]) {
      // Check if this indicator is selected
      const decision = signal.decision || "Neutral";
      const score = DECISION_SCORES[decision] || 0;
      const weight = INDICATOR_WEIGHTS[indicatorName] || 0;
      totalScore += score * weight;
    }
  });

  // Determine Overall Verdict based on totalScore
  if (totalScore >= 1.5) return "Strong Buy";
  if (totalScore >= 0.5) return "Buy";
  if (totalScore <= -1.5) return "Strong Sell";
  if (totalScore <= -0.5) return "Sell";
  return "Neutral";
};
