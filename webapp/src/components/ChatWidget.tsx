import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useChat } from "../hooks";
import { formatErrorMessage } from "../utils";

const ChatWidget: React.FC<{ libraryItemId: number }> = ({ libraryItemId }) => {
  const { messages, isLoading, isAsking, error, askQuestion, clearError } = useChat(libraryItemId);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async () => {
    if (!input.trim() || isAsking) return;
    
    const question = input.trim();
    setInput("");
    
    try {
      await askQuestion(question);
    } catch (err) {
      console.error('Error sending message:', err);
      // Error is already handled by the hook
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                <p className="text-red-800 text-xs">{formatErrorMessage(error)}</p>
                <button 
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800 text-xs mt-1 underline"
                >
                  Dismiss
                </button>
              </div>
            )}
            
            {isLoading && messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                Loading chat history...
              </div>
            )}
            
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
            
            {isAsking && (
              <div className="flex justify-end mb-3">
                <div className="bg-green-200 text-gray-900 p-3 rounded-lg text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          <div className="p-2 border-t flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isAsking}
              className="flex-1 px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
              placeholder="Type a question..."
            />
            <button
              onClick={handleSend}
              disabled={isAsking || !input.trim()}
              className="text-white bg-indigo-600 px-3 py-1 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {isAsking ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
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
