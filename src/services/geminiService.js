// src/services/geminiService.js
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const API_KEY = "AIzaSyAmLfpN3QyAbmI-NgI2AKj6QHTxBxiM22s"; // Your API key

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

const generationConfig = {
  /* ... same ... */
};
const safetySettings = [
  /* ... same ... */
];

export const generateSectionSummary = async (
  sectionTitle,
  sectionData,
  stockName = "",
  imagesInput = null
) => {
  const images = Array.isArray(imagesInput)
    ? imagesInput
    : imagesInput
    ? [imagesInput]
    : [];

  // Placeholder logic
  if (
    API_KEY === "YOUR_GEMINI_API_KEY" ||
    (API_KEY === "AIzaSyAmLfpN3QyAbmI-NgI2AKj6QHTxBxiM22s" &&
      images.length === 0)
  ) {
    if (
      process.env.NODE_ENV !== "test" &&
      API_KEY === "AIzaSyAmLfpN3QyAbmI-NgI2AKj6QHTxBxiM22s"
    ) {
      console.warn("Using placeholder Gemini API key for text-only summaries.");
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
    let placeholderSummary = `Placeholder summary for ${sectionTitle} of ${stockName}. Textual data: ${Object.keys(
      sectionData
    ).join(", ")}.`;
    if (images.length > 0)
      placeholderSummary += ` ${images.length} chart image(s) prepared.`;
    return placeholderSummary;
  }

  try {
    let initialPromptText = `You are a financial analyst AI. Summarize the "${sectionTitle}" for "${
      stockName ? stockName : "a stock"
    }".
          
  Instructions:
  - Analyze provided text and images. Main company is "${stockName}".
  - Explain data/image insights without investment advice.
  - Highlight key trends an investor should note.
  - Use simple language, 2-3 short paragraphs.
  - Stick to provided data.
          
  Textual Data for the Section:
  ${JSON.stringify(sectionData, null, 2)}
  `;

    if (images.length > 0) {
      initialPromptText += `\n\nConsider the provided image(s):`;
      images.forEach((img, index) => {
        initialPromptText += `\nImage ${index + 1}${
          img.description ? ` (${img.description})` : ""
        } shows relevant trends.`;
      });
    }
    initialPromptText += `\n\nBased on this, what are key takeaways from this "${sectionTitle}" data and image(s)?`;

    // Price Chart specific
    if (sectionTitle === "Price Chart" && images.length > 0) {
      const priceChartImage =
        images.find((img) =>
          img.description?.toLowerCase().includes("price chart")
        ) || images[0];
      if (priceChartImage) {
        initialPromptText += `\nFor this Price Chart (${
          priceChartImage.description || "main chart"
        }), analyze: overall trend, patterns, price vs MAs/volume, current price relative to MAs, volume spikes. Covers ${
          sectionData.currentTimeRange
        }.`;
      }
    }
    // Peer Comparison specific
    else if (sectionTitle === "Peer Comparison") {
      initialPromptText += `\nFor "Peer Comparison" of "${stockName}":
  - Text data compares "${stockName}" with peers on CMP, P/E, Market Cap, Div Yield, ROCE.
  - The images (${images
    .map((img) => img.description || `Chart ${images.indexOf(img) + 1}`)
    .join(", ")}) show graphical comparisons.
  - Analyze "${stockName}" vs peers from table and charts. Highlight standouts (positive/negative) or alignment with industry. Note significant ratio differences.`;
    }
    // Quarterly Results specific
    else if (sectionTitle === "Quarterly Results") {
      initialPromptText += `\nFor these "Quarterly Results" of "${stockName}":
  - Textual data summarizes recent quarterly figures (Revenue, Net Profit, EPS).
  - The images (${images
    .map((img) => img.description || `Chart ${images.indexOf(img) + 1}`)
    .join(
      ", "
    )}) visualize trends for "Quarterly Revenue & Net Profit" and "Quarterly EPS".
  - Analyze trends in table data and charts. Are revenues, profits, EPS growing, declining, or stable?
  - Note significant quarter-over-quarter changes or patterns.
  - Briefly explain what these trends might indicate about recent performance.`;
    }
    // Profit & Loss specific
    else if (sectionTitle === "Profit & Loss") {
      initialPromptText += `\n\nFor this "Profit & Loss" statement of "${stockName}":
  - The textual data includes a summary of annual P&L figures (Sales, Profits, EPS) and growth metrics (Compounded Sales/Profit Growth, Stock Price CAGR, ROE).
  - The image (${
    images[0]?.description || "Annual Financials Chart"
  }) likely shows trends in annual revenue and net profit.
  - Analyze the year-on-year trends from the table and the chart. Is the company showing consistent growth in sales and profitability?
  - Comment on the operating profit margin (OPM) trends if discernible from the data.
  - Explain what the provided growth metrics (like CAGR for sales/profit, ROE trend) signify about the company's long-term performance and efficiency.`;
    }
    // Balance Sheet specific
    else if (sectionTitle === "Balance Sheet") {
      // Corrected from `else if` to `if` for clarity if it's the only one being modified here
      initialPromptText += `\n\nFor this "Balance Sheet" analysis of "${stockName}":
- Textual data provides a summary of the latest year's key balance sheet items (Total Assets/Liabilities, Equity, Debt).
- The images (${images
        .map((img) => img.description || `Chart ${images.indexOf(img) + 1}`)
        .join(
          "; "
        )}) depict the composition of Liabilities and Assets over time.
- From the "${
        images.find((img) => img.description?.includes("Liabilities"))
          ?.description || "Liabilities chart"
      }", analyze the structure of the company's liabilities. What are the major components (Equity, Borrowings)? How has the debt level changed over time?
- From the "${
        images.find((img) => img.description?.includes("Assets"))
          ?.description || "Assets chart"
      }", analyze the structure of the company's assets. What are the major components (Fixed Assets, Investments, Other Assets)? How has the asset composition evolved?
- Briefly explain what these compositions and trends might indicate about the company's financial health, leverage, and asset management.`;
    } else if (sectionTitle === "Cash Flows") {
      initialPromptText += `\n\nFor this "Cash Flows" statement of "${stockName}":
- Textual data summarizes annual cash flows from Operating, Investing, and Financing activities, along with Net Cash Flow.
- The image (${
        images[0]?.description || "Annual Cash Flow Chart"
      }) likely visualizes these cash flow components over time, possibly with Operating CF as bars and Net Cash Flow as a line.
- Analyze the trend in Cash from Operating Activities (CFO). Is it consistently positive and growing? This is crucial for sustainable operations.
- What does the Cash from Investing Activities (CFI) indicate? (e.g., negative CFI might mean investments in assets, positive might mean asset sales).
- What does the Cash from Financing Activities (CFF) indicate? (e.g., positive CFF could mean raising debt/equity, negative could mean debt repayment/dividends).
- How has the Net Cash Flow trended? Does the company generally generate positive net cash flow?`;
    }
    // Financial Ratios specific
    else if (sectionTitle === "Financial Ratios") {
      initialPromptText += `\n\nFor these "Financial Ratios" of "${stockName}":
- Textual data provides key ratios for the latest year (Debtor Days, Inventory Days, Days Payable, Cash Conversion Cycle, ROCE).
- The images (${images
        .map((img) => img.description || `Chart ${images.indexOf(img) + 1}`)
        .join(
          "; "
        )}) likely show trends for "Efficiency Days" (Debtor, Inventory, Payable Days) and "ROCE %".
- Analyze the trends in Efficiency Days from its chart. Are debtor days increasing or decreasing? How about inventory and payable days? What does the Cash Conversion Cycle trend suggest about working capital management?
- Analyze the ROCE % trend from its chart. Is the company's Return on Capital Employed improving, declining, or stable? What does this indicate about its profitability and efficiency in using capital?
- Relate these ratio trends to the company's operational efficiency and profitability.`;
    }

    const promptParts = [{ text: initialPromptText }];
    if (images.length > 0) {
      images.forEach((img) => {
        if (img && img.data && img.mimeType) {
          promptParts.push({
            inlineData: { mimeType: img.mimeType, data: img.data },
          });
        }
      });
      promptParts.push({
        text: `\nBased on your analysis of all the provided text and image(s) for the "${sectionTitle}" of "${stockName}", provide the summary.`,
      });
    }

    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: [],
    });
    const result = await chatSession.sendMessage(promptParts);
    return result.response.text().trim();
  } catch (error) {
    // ... (error handling remains similar)
    console.error("Error calling Gemini API:", error.message, error.stack);
    let errorMessage = "Sorry, I couldn't generate a summary at this time.";
    if (error.response?.promptFeedback?.blockReason) {
      errorMessage = `Content blocked: ${error.response.promptFeedback.blockReason}. Adjust content/safety settings.`;
    } else if (error.message.includes("API key not valid")) {
      errorMessage = "Invalid Gemini API key. Check configuration.";
    } else if (error.message.includes("quota")) {
      errorMessage = "API quota exceeded. Try again later.";
    } else if (
      error.message.toLowerCase().includes("image") ||
      (error.message.includes("request payload") && images.length > 0)
    ) {
      errorMessage =
        "Issue processing chart image(s). May be too large or unsupported format.";
    }
    throw new Error(errorMessage);
  }
};
