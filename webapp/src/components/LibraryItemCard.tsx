import React from "react";
import { useNavigate } from "react-router-dom";

interface LibraryItem {
  id: string;
  title: string;
  source: string;
  dateAdded: string;
  hasSummary: boolean;
  hasFlashcards: boolean;
  hasQA: boolean;
}

export type { LibraryItem };

// Define distinct pastel colors and matching icons
const colorSets = [
  { bg: "bg-pink-50", border: "border-pink-200", emoji: "🦄" },
  { bg: "bg-blue-50", border: "border-blue-200", emoji: "🧸" },
  { bg: "bg-yellow-50", border: "border-yellow-200", emoji: "🌈" },
  { bg: "bg-green-50", border: "border-green-200", emoji: "🐸" },
  { bg: "bg-purple-50", border: "border-purple-200", emoji: "🦕" },
  { bg: "bg-orange-50", border: "border-orange-200", emoji: "🍭" },
  { bg: "bg-red-50", border: "border-red-200", emoji: "🚀" },
];

// Hash string to stable index for consistent color/icon
const hashToIndex = (str: string, modulo: number) =>
  Array.from(str).reduce((acc, char) => acc + char.charCodeAt(0), 0) % modulo;

const LibraryItemCard: React.FC<{ item: LibraryItem; onDelete: (id: string) => void }> = ({
  item,
  onDelete,
}) => {
  const navigate = useNavigate();
  const index = hashToIndex(item.id, colorSets.length);
  const { bg, border, emoji } = colorSets[index];

  return (
    <div
      className={`rounded-xl border-2 ${border} ${bg} p-4 shadow-md transform transition duration-300 hover:scale-105 hover:shadow-xl`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="text-xl">{emoji}</span> {item.title}
          </h3>
          <a
            href={item.source}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            Source
          </a>
          <p className="text-xs text-gray-500">{new Date(item.dateAdded).toLocaleDateString()}</p>
        </div>
        <button
          onClick={() => onDelete(item.id)}
          className="text-gray-400 hover:text-red-600 text-xl"
          aria-label="Delete"
        >
          🗑️
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {item.hasSummary && (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Summary</span>
        )}
        {item.hasFlashcards && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Flashcards</span>
        )}
        {item.hasQA && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Q&A</span>
        )}
      </div>

      <button
        onClick={() => navigate(`/library/${item.id}`)}
        className="mt-4 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 self-start transition"
      >
        View Details
      </button>
    </div>
  );
};

export default LibraryItemCard;
