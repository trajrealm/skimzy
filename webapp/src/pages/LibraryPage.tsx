import React, { useState } from "react";
import Header from "../components/Header";
import AddContentForm from "../components/AddContentForm";
import LibraryItemCard, { LibraryItem } from "../components/LibraryItemCard";

const LibraryPage: React.FC = () => {
  const [items, setItems] = useState<LibraryItem[]>([]);

  const handleAdd = (urlOrFile: string | File) => {
    const newItem: LibraryItem = {
      id: `${Date.now()}`,
      title: typeof urlOrFile === "string" ? urlOrFile : (urlOrFile as File).name,
      source: typeof urlOrFile === "string" ? urlOrFile : "",
      dateAdded: new Date().toISOString(),
      hasSummary: false,
      hasFlashcards: false,
      hasQA: false,
    };
    setItems([newItem, ...items]);
  };

  const handleView = (id: string) => {
    console.log("View", id);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <AddContentForm onAdd={handleAdd} />
        {items.length === 0 ? (
          <div className="text-center text-gray-500 mt-12">
            Your library is empty. Add a URL or PDF to get started!
          </div>
        ) : (
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
    </div>
  );
};

export default LibraryPage;
