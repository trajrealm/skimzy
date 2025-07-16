import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { useAuth } from "../contexts/AuthContext";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ChatWidget: React.FC<{ libraryItemId: number }> = ({ libraryItemId }) => {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  //   const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<
    { role: string; text: string; timestamp?: string }[]>([]);

  const toggleChat = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (!isOpen || !libraryItemId) return;
    fetch(`${BACKEND_URL}/chat-history/${libraryItemId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch chat history");
        return res.json();
      })
      .then(data => {
        // Sort by created_at if available
        const msgs = data.flatMap(({ question, answer, timestamp }: { question: string; answer: string; timestamp?: string }) => [
          { role: "user", text: question, timestamp },
          { role: "assistant", text: answer, timestamp },
        ]);
        setMessages(msgs);
      })
      .catch(async (err) => {
        console.error("Fetch error:", err);
        try {
          const res = await fetch(`${BACKEND_URL}/chat-history/${libraryItemId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const text = await res.text();
          console.error("Raw response text:", text);
        } catch (e) {
          console.error("Error fetching or reading raw response:", e);
        }
      });
  }, [isOpen, libraryItemId, token]); // These are all primitives or strings — correct

  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
    }
  }, [isOpen]);


  const sendMessage = async () => {
    if (!input.trim()) return;
    const question = input;
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");

    try {
      const res = await fetch(`${BACKEND_URL}/ask-question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question, library_item_id: libraryItemId }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [...prev, { role: "assistant", text: "Something went wrong." }]);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div
          className="resize rounded-xl shadow-xl border border-gray-300 flex flex-col bg-white overflow-hidden"
          style={{
            width: "320px",
            height: "380px",
            maxWidth: "90vw",
            maxHeight: "80vh",
            minWidth: "280px",
            minHeight: "300px",
          }}
        >
          <div className="flex items-center justify-between bg-indigo-600 text-white px-4 py-2 rounded-t-xl">
            <span className="font-semibold">Ask Skimzy</span>
            <button onClick={toggleChat}><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 text-sm">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex w-full mb-3 ${msg.role === "user" ? "justify-start" : "justify-end"}`}
              >
                <div className="relative max-w-[75%]">
                  <div
                    className={`relative p-3 rounded-lg text-sm shadow-md whitespace-pre-wrap ${msg.role === "user"
                        ? "bg-indigo-200 text-gray-900"
                        : "bg-green-200 text-gray-900"
                      }`}
                  >
                    <ReactMarkdown>{msg.text}</ReactMarkdown>

                    {/* Bubble tail */}
                    <div
                      className={`absolute w-0 h-0 border-[6px] ${msg.role === "user"
                          ? "border-t-indigo-100 border-r-transparent border-l-transparent border-b-transparent left-2 -bottom-3"
                          : "border-t-green-100 border-r-transparent border-l-transparent border-b-transparent right-2 -bottom-3"
                        }`}
                    />
                  </div>

                  {msg.timestamp && (
                    <div className={`text-[10px] text-gray-400 mt-1 ${msg.role === "user" ? "text-left" : "text-right"}`}>
                      {new Date(msg.timestamp + "Z").toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-2 border-t flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 px-3 py-1 border rounded-lg text-sm"
              placeholder="Type a question..."
            />
            <button
              onClick={sendMessage}
              className="text-white bg-indigo-600 px-3 py-1 rounded-lg text-sm hover:bg-indigo-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
      <button
        onClick={toggleChat}
        className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition"
        aria-label="Toggle Chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ChatWidget;
