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

const LibraryItemCard: React.FC<{ item: LibraryItem; onDelete: (id: string) => void }> = ({
  item,
  onDelete,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-between hover:shadow-lg transition">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{item.title}</h3>
          <a href={item.source} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
            Source
          </a>
          <p className="text-xs text-gray-500">{new Date(item.dateAdded).toLocaleDateString()}</p>
        </div>
        <button
          onClick={() => onDelete(item.id)}
          className="text-gray-400 hover:text-red-600"
          aria-label="Delete"
        >
          🗑️
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {item.hasSummary && <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Summary</span>}
        {item.hasFlashcards && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Flashcards</span>
        )}
        {item.hasQA && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Q&A</span>}
      </div>
      <button
        onClick={() => navigate(`/library/${item.id}`)}
        className="mt-4 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 self-start"
      >
        View Details
      </button>
    </div>
  )
};

export default LibraryItemCard;
