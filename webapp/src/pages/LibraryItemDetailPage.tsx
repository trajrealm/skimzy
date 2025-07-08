import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

const LibraryItemDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"summary" | "flashcards" | "mcqs">("summary");
  const [flashIndex, setFlashIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIndex: number]: string }>({});
  const [mcqIndex, setMcqIndex] = useState(0);


  const mockItem = {
    title: "The Science Behind Black Holes",
    source: "https://example.com/blackholes",
    dateAdded: "2025-07-08",
    summary: "Black holes are regions in space where gravity is so strong...",
    flashcards: [
      { question: "What is a black hole?", answer: "A region of spacetime where gravity is extreme." },
      { question: "What is the event horizon?", answer: "The boundary beyond which nothing can escape." },
    ],
    mcqs: [
      {
        question: "What causes a black hole to form?",
        options: ["Supernova", "Big Bang", "Asteroid impact", "Galaxy collision"],
        answer: "Supernova",
      },
      {
        question: "What escapes a black hole?",
        options: ["Light", "Radiation", "Nothing", "Time"],
        answer: "Nothing",
      },
    ],
  };

  const flashcard = mockItem.flashcards[flashIndex];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <button onClick={() => navigate(-1)} className="flex items-center text-blue-600 mb-4 hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Library
      </button>

      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold">{mockItem.title}</h1>
        <a href={mockItem.source} className="text-sm text-blue-500 hover:underline" target="_blank" rel="noreferrer">
          {mockItem.source}
        </a>
        <p className="text-xs text-gray-500 mb-4">Added on: {mockItem.dateAdded}</p>

        {/* Tabs */}
        <div className="flex space-x-4 border-b mb-6">
          {["summary", "flashcards", "mcqs"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab as any);
                setFlashIndex(0);
                setShowBack(false);
              }}
              className={`pb-2 px-2 capitalize border-b-2 ${activeTab === tab ? "border-indigo-600 text-indigo-600 font-medium" : "border-transparent text-gray-500"
                }`}
            >
              {tab === "mcqs" ? "MCQs" : tab}
            </button>
          ))}
        </div>

        {/* Summary */}
        {activeTab === "summary" && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Summary</h2>
            <p className="text-gray-800 leading-relaxed">{mockItem.summary}</p>
          </div>
        )}

        {/* Flashcards */}
        {activeTab === "flashcards" && (
          <div className="flex flex-col items-center space-y-4">
            {/* Flashcard Flip Container */}
            <div className="w-full sm:w-[400px] h-[200px] perspective" onClick={() => setShowBack(!showBack)}>
              <div
                className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${showBack ? "rotate-y-180" : ""
                  }`}
              >
                {/* Front Side */}
                <div
                  className="absolute w-full h-full flex items-center justify-center text-center
             bg-indigo-50 text-lg font-medium border rounded-xl backface-hidden
             cursor-pointer hover:shadow-xl hover:bg-indigo-100 transition duration-300"
                  title="Click to flip the card"
                >
                  {flashcard.question}
                </div>
                {/* Back Side */}
                <div
                  className="absolute w-full h-full flex items-center justify-center text-center
             bg-indigo-100 text-lg font-medium border rounded-xl backface-hidden rotate-y-180
             cursor-pointer hover:shadow-xl hover:bg-indigo-200 transition duration-300"
                  title="Click to flip the card"
                >
                  {flashcard.answer}
                </div>      </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setFlashIndex((prev) => Math.max(0, prev - 1));
                  setShowBack(false);
                }}
                disabled={flashIndex === 0}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setShowBack(false);
                  setFlashIndex((prev) => Math.min(mockItem.flashcards.length - 1, prev + 1));
                }}
                disabled={flashIndex === mockItem.flashcards.length - 1}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500">
              Card {flashIndex + 1} of {mockItem.flashcards.length}
            </p>
          </div>
        )}


        {/* MCQs */}
        {activeTab === "mcqs" && (
          <div className="flex flex-col items-center space-y-6">
            {/* MCQ Slider */}
            <div className="w-full">
              <p className="font-medium text-gray-800 mb-2 text-lg">
                {mcqIndex + 1}. {mockItem.mcqs[mcqIndex].question}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {mockItem.mcqs[mcqIndex].options.map((opt) => {
                  const selected = selectedAnswers[mcqIndex] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() =>
                        setSelectedAnswers((prev) => ({
                          ...prev,
                          [mcqIndex]: opt,
                        }))
                      }
                      className={`border px-3 py-2 rounded text-left transition ${selected
                          ? "bg-indigo-100 border-indigo-500 text-indigo-700"
                          : "bg-white border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex space-x-4">
              <button
                onClick={() => setMcqIndex((prev) => Math.max(0, prev - 1))}
                disabled={mcqIndex === 0}
                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMcqIndex((prev) => Math.min(mockItem.mcqs.length - 1, prev + 1))}
                disabled={mcqIndex === mockItem.mcqs.length - 1}
                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-40"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Footer Actions */}
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  // TODO: Score logic
                  alert("Scoring feature coming soon!");
                }}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                Score
              </button>
              <button
                onClick={() => {
                  setSelectedAnswers({});
                  setMcqIndex(0);
                }}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Reset
              </button>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default LibraryItemDetailPage;
