// src/components/GeminiSummarizeButton.jsx
import React, { useState, useCallback, useEffect } from "react";

// Placeholder for a more sophisticated Gemini-like animation
const GeminiLoadingAnimation = () => (
  <div className="flex flex-col items-center justify-center min-h-[150px] text-center text-slate-600 dark:text-slate-400">
    <div className="text-5xl animate-pulse">✨</div>{" "}
    {/* Simple pulse, can be customized */}
    <p className="mt-3 text-lg">Gemini is analyzing...</p>
  </div>
);

const GeminiSummarizeButton = ({ sectionTitle, onSummarizeRequest }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSummarizeClick = async () => {
    setIsModalOpen(true);
    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      const result = await onSummarizeRequest();
      setSummary(result);
    } catch (e) {
      console.error("Summarization error:", e);
      setError(e.message || "Failed to generate summary.");
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };
    if (isModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, closeModal]);

  return (
    <>
      <button
        onClick={handleSummarizeClick}
        className="inline-flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-white whitespace-nowrap bg-purple-600 rounded-full shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:bg-purple-500 dark:hover:bg-purple-600 dark:focus:ring-offset-slate-900 transition-colors duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
        title={`Summarize ${sectionTitle} with AI`}
        disabled={isLoading && isModalOpen}
      >
        <span>✨</span>
        <span>Summarize</span>
      </button>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative flex flex-col w-full max-w-lg max-h-[85vh] p-5 bg-white rounded-xl shadow-2xl dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()} // Prevent click through to overlay
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
              <h3 className="m-0 text-xl font-semibold text-purple-600 dark:text-purple-400">
                AI Summary: {sectionTitle}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 text-2xl leading-none bg-transparent border-0 cursor-pointer text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto flex-grow min-h-[100px]">
              {isLoading && <GeminiLoadingAnimation />}
              {error && (
                <p className="p-5 font-medium text-center text-red-600 dark:text-red-400 text-base">
                  Error: {error}
                </p>
              )}
              {!isLoading && summary && (
                <div className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
                  {summary.split("\n").map((paragraph, index) => (
                    <p key={index} className="mb-3 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GeminiSummarizeButton;
