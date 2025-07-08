import React, { useState } from "react";

interface AddContentFormProps {
  onAdd: (urlOrFile: string | File) => void;
}

const AddContentForm: React.FC<AddContentFormProps> = ({ onAdd }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onAdd(input.trim());
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 bg-gray-50 p-4 rounded-lg">
      <input
        type="text"
        placeholder="Paste URL here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring"
      />
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Add &amp; Generate
      </button>
    </form>
  );
};

export default AddContentForm;
