import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import AddContentForm from "../components/AddContentForm";
import LibraryItemCard, { LibraryItem } from "../components/LibraryItemCard";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const LibraryPage: React.FC = () => {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const didFetchRef = useRef(false);

  useEffect(() => {
    if (!didFetchRef.current) {
      console.log("useEffect called");
      fetchLibraryItems();
      didFetchRef.current = true;        
    }
  }, []);

  const fetchLibraryItems = async () => {
    console.log("fetchLibraryItems called");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/library`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch library items");

      const data = await res.json();

      const adaptedItems: LibraryItem[] = data.map((item: any) => ({
        id: item.id.toString(),
        title: item.title,
        source: item.source,
        dateAdded: item.created_at,
        hasSummary: !!item.snippet,
        hasFlashcards: false,
        hasQA: false,
      }));

      setItems(adaptedItems);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (urlOrFile: string | File) => {
    console.log("handleAdd called");
    setIsGenerating(true);
    try {
      if (typeof urlOrFile === "string") {
        const res = await fetch(`${BACKEND_URL}/generate-from-url`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url: urlOrFile }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          alert("Error: " + (errorData.detail || "Failed to add item"));
          return;
        }
      } else {
        const formData = new FormData();
        formData.append("file", urlOrFile);

        const res = await fetch(`${BACKEND_URL}/upload_pdf/process`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json();
          alert("Error: " + (errorData.detail || "Failed to upload PDF"));
          return;
        }
      }

      await fetchLibraryItems();
    } catch (error) {
      console.error("Add failed:", error);
      alert("Failed to add item");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleView = (id: string) => {
    console.log("handleView called");
    navigate(`/library/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/library/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 204) {
        setItems(items.filter((i) => i.id !== id));
      } else {
        const data = await response.json();
        alert(`Failed to delete: ${data.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Error deleting item. See console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      <Header />
      <main className="max-w-5xl mx-auto p-6 space-y-6 relative z-10">
        <AddContentForm onAdd={handleAdd} isGenerating={isGenerating} />

        {loading && <div className="text-center">Loading...</div>}
        {!loading && items.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            Your library is empty. Add a URL or PDF to get started!
          </div>
        )}
        {!loading && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <LibraryItemCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
                onClick={handleView}
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
            ...
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
