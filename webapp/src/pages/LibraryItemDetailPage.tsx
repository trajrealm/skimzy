import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useSwipeable } from "react-swipeable";
import Header from "../components/Header";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import ChatWidget from "../components/ChatWidget";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface Flashcard {
  question: string;
  answer: string;
}

interface MCQ {
  question: string;
  options: string[];
  answer: string;
}

interface LibraryItem {
  id: number;
  title: string;
  source: string;
  created_at: string;
  summary: string;
  flashcards: Flashcard[];
  mcqs: MCQ[];
}

const LibraryItemDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [item, setItem] = useState<LibraryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"summary" | "flashcards" | "mcqs">("summary");
  const [flashIndex, setFlashIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIndex: number]: string }>({});
  const [mcqIndex, setMcqIndex] = useState(0);
  // Add below other useStates
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/library/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch item");
        const data = await res.json();
        setItem(data);
      } catch (err) {
        console.error("Error loading item:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, token]);

  // const [chatOpen, setChatOpen] = useState(false);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (item && flashIndex < item.flashcards.length - 1) {
        triggerCardTransition(() => {
          setFlashIndex(flashIndex + 1);
          setShowBack(false);
        });
      }
    },
    onSwipedRight: () => {
      if (flashIndex > 0) {
        triggerCardTransition(() => {
          setFlashIndex(flashIndex - 1);
          setShowBack(false);
        });
      }
    },
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: false, // optional
  });




  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!item) return <div className="p-6 text-center text-red-500">Item not found.</div>;

  const triggerCardTransition = (updateCard: () => void) => {
    setFade(false); // start fade-out
    setTimeout(() => {
      updateCard();      // switch card
      setFade(true);     // start fade-in
    }, 500); // match duration to tailwind "duration-500"
  };

  // const flashcard = item.flashcards?.[flashIndex];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 p-6 max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 mb-6 px-4 py-2 bg-indigo-100 text-indigo-800 font-semibold rounded-md shadow-sm hover:bg-indigo-200 hover:text-indigo-900 transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-label="Back to Library"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Library</span>
        </button>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-3xl font-extrabold mb-2">{item.title}</h1>
          <a
            href={item.source}
            className="text-sm text-blue-600 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Source
          </a>
          <p className="text-xs text-gray-500 mb-6">Added on: {new Date(item.created_at).toLocaleDateString()}</p>

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
                className={`pb-2 px-2 capitalize border-b-2 ${activeTab === tab
                  ? "border-indigo-600 text-indigo-600 font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab === "mcqs" ? "MCQs" : tab}
              </button>
            ))}
          </div>

          {/* Summary (Markdown rendered) */}
          {activeTab === "summary" && (
            <div>
              <div className="markdown-content text-gray-800 leading-relaxed">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                  {item.summary}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Flashcards */}


          {activeTab === "flashcards" && item?.flashcards && flashIndex < item.flashcards.length && (

            <div className="flex flex-col items-center space-y-4">

              {/* Card Container */}
              <div
                {...handlers}
                className={`w-full sm:w-[400px] h-[200px] perspective cursor-pointer 
        transition-opacity duration-500 ease-in-out
        ${fade ? "opacity-100" : "opacity-0"}`}
                onClick={() => setShowBack((prev) => !prev)}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${showBack ? "rotate-y-180" : ""
                    }`}
                >
                  {/* Front (Question) */}
                  <div className="absolute w-full h-full flex items-center justify-center text-center 
            text-lg font-medium border rounded-xl backface-hidden 
            bg-indigo-50 hover:shadow-xl hover:bg-indigo-100 transition duration-300">
                    {item.flashcards[flashIndex]?.question}
                  </div>

                  {/* Back (Answer) */}
                  <div className="absolute w-full h-full flex items-center justify-center text-center 
            text-lg font-medium border rounded-xl backface-hidden rotate-y-180 
            bg-yellow-50 hover:shadow-xl hover:bg-yellow-100 transition duration-300">
                    {item.flashcards[flashIndex]?.answer}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    if (flashIndex > 0) {
                      triggerCardTransition(() => {
                        setFlashIndex(flashIndex - 1);
                        setShowBack(false); // Reset to front
                      });
                    }
                  }}
                  disabled={flashIndex === 0}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={() => {
                    if (flashIndex < item.flashcards.length - 1) {
                      triggerCardTransition(() => {
                        setShowBack(false); // Reset to front
                        setFlashIndex(flashIndex + 1);
                      });
                    }
                  }}
                  disabled={flashIndex === item.flashcards.length - 1}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-40"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-500">
                Card {flashIndex + 1} of {item.flashcards.length}
              </p>
            </div>
          )}


          {/* MCQs */}
          {activeTab === "mcqs" && item.mcqs?.length > 0 && (
            <div className="flex flex-col items-center space-y-6 w-full">
              {!showScore ? (
                <>
                  <div className="w-full">
                    <p className="font-medium text-gray-800 mb-2 text-lg">
                      {mcqIndex + 1}. {item.mcqs[mcqIndex].question}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.mcqs[mcqIndex].options.map((opt) => {
                        const selected = selectedAnswers[mcqIndex] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() =>
                              setSelectedAnswers((prev) => ({ ...prev, [mcqIndex]: opt }))
                            }
                            className={`border px-3 py-2 rounded text-left transition duration-200 ease-in-out transform ${selected
                              ? "bg-indigo-100 border-indigo-500 text-indigo-700"
                              : "bg-white border-gray-300 hover:bg-yellow-50 hover:border-yellow-400 hover:shadow-md hover:scale-105"
                              }`}                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setMcqIndex((prev) => Math.max(0, prev - 1))}
                      disabled={mcqIndex === 0}
                      className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setMcqIndex((prev) => Math.min(item.mcqs.length - 1, prev + 1))}
                      disabled={mcqIndex === item.mcqs.length - 1}
                      className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-40"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={() => {
                        let correctCount = 0;
                        item.mcqs.forEach((q, idx) => {
                          if (selectedAnswers[idx] === q.answer) correctCount++;
                        });
                        setScore(correctCount);
                        setShowScore(true);
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
                </>
              ) : (
                <div className="w-full bg-white rounded-lg p-6 shadow space-y-6 border border-gray-200">
                  <p className="text-xl font-bold text-center text-green-700">
                    Your Score: {score} / {item.mcqs.length}
                  </p>
                  <h3 className="text-md font-semibold text-gray-800">Your Results:</h3>
                  <div className="space-y-4">
                    {item.mcqs.map((q, idx) => {
                      const userAnswer = selectedAnswers[idx];
                      const isCorrect = userAnswer === q.answer;
                      return (
                        <div key={idx} className="p-4 rounded border bg-gray-50">
                          <p className="font-medium">{idx + 1}. {q.question}</p>
                          <p>
                            Your Answer:{" "}
                            <span className={isCorrect ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                              {userAnswer || "Not Answered"}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p>
                              Correct Answer:{" "}
                              <span className="text-green-700 font-medium">{q.answer}</span>
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-center pt-4">
                    <button
                      onClick={() => setShowScore(false)}
                      className="mt-4 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
                    >
                      Back to Quiz
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <ChatWidget libraryItemId={item.id} />
    </>
  );
};

export default LibraryItemDetailPage;
