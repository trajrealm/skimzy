import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import AddContentForm from "../components/AddContentForm";
import LibraryItemCard, { LibraryItem } from "../components/LibraryItemCard";
import { useNavigate } from "react-router-dom";


const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const LibraryPage: React.FC = () => {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();


  // Load library items from backend on mount
  useEffect(() => {
    fetchLibraryItems();
  }, []);

  // Fetch /library endpoint
  const fetchLibraryItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/library`, {
        headers: {
          "Content-Type": "application/json",
          // Add Authorization header if needed, e.g.
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch library items");
      }
      const data = await res.json();

      // Adapt backend response to LibraryItem type used by LibraryItemCard
      const adaptedItems: LibraryItem[] = data.map((item: any) => ({
        id: item.id.toString(),
        title: item.title,
        source: item.source, // no source in backend? Could add if you want
        dateAdded: item.created_at,
        hasSummary: !!item.snippet,
        hasFlashcards: false, // backend doesn't return these flags yet; update when ready
        hasQA: false,
      }));
      setItems(adaptedItems);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding new URL or file: call generate-from-url backend, then refresh list
  const handleAdd = async (urlOrFile: string | File) => {
    let url = "";
    if (typeof urlOrFile === "string") {
      url = urlOrFile;
    } else {
      // If file upload, handle file upload logic here or disable for now
      alert("File upload not implemented yet");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/generate-from-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Add Authorization header if needed
        },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert("Error: " + (errorData.detail || "Failed to add item"));
        return;
      }

      const savedItem = await res.json();
      // After successful save, reload library items list
      await fetchLibraryItems();
    } catch (error) {
      console.error(error);
      alert("Failed to add item");
    }
  };

  const handleView = (id: string) => {
    navigate(`/library/${id}`);
    // Navigate to detail page or open modal
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/library/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`, // Make sure you pass the auth token here
        },
      });
  
      if (response.status === 204) {
        // Success: update UI
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
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <AddContentForm onAdd={handleAdd} />
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
    </div>
  );
};

export default LibraryPage;
