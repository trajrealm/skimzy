import React, { useState } from "react";
import Header from "../components/Header";
import AddContentForm from "../components/AddContentForm";
import LibraryItemCard from "../components/LibraryItemCard";
import { Loader2 } from "lucide-react";
import { useLibrary } from "../hooks";
import { formatErrorMessage } from "../utils";

const LibraryPage: React.FC = () => {
  const { 
    items, 
    isLoading, 
    error, 
    generateFromUrl, 
    uploadPdf, 
    deleteLibraryItem,
    clearError 
  } = useLibrary();
  
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAdd = async (urlOrFile: string | File) => {
    setIsGenerating(true);
    clearError();
    
    try {
      if (typeof urlOrFile === "string") {
        await generateFromUrl(urlOrFile);
      } else {
        await uploadPdf(urlOrFile);
      }
    } catch (err) {
      console.error('Error adding content:', err);
      // Error is already handled by the hook
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }
    
    try {
      await deleteLibraryItem(id);
    } catch (err) {
      console.error('Error deleting item:', err);
      // Error is already handled by the hook
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      <Header />
      <main className="max-w-5xl mx-auto p-6 space-y-6 relative z-10">
        <AddContentForm onAdd={handleAdd} isGenerating={isGenerating} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{formatErrorMessage(error)}</p>
            <button 
              onClick={clearError}
              className="text-red-600 hover:text-red-800 text-xs mt-1 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {isLoading && (
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading your library...
          </div>
        )}
        
        {!isLoading && items.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            Your library is empty. Add a URL or PDF to get started!
          </div>
        )}
        
        {!isLoading && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <LibraryItemCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {isGenerating && (
        <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-700 text-lg font-medium">
            <Loader2 className="w-6 h-6 animate-spin" />
            Preparing your data to make Skim Ready....
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
